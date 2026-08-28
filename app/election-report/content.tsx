'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/providers/i18n-provider';
import { useCurrentMeeting } from '../hooks/use-current-meeting';
import { personDisplayName, type PersonRecord } from '../components/person-picker';
import { useMembers } from '../components/member-picker';
import { CompanyLogo } from '../components/election-media';
import { ReportShell } from '../components/report-shell';
import { ReportClock } from '../components/report-clock';
import { VoteBox } from './components/vote-box';

const FA = 12;
const EN = 10;
const REFRESH_MS = 5000;

interface ResultView {
  id: string;
  meetingId: string;
  candidateId: string;
  voteCount: number;
  rank: number;
  outcome: number;
}
interface CandidateView {
  id: string;
  meetingId: string;
  personId: string;
  companyId: string | null;
  candidateNumber: number | null;
}
interface VoteView {
  id: string;
  meetingId: string;
  candidateId: string;
}
interface AttendanceView {
  id: string;
  meetingId: string;
  isPresent: boolean;
}
interface Row {
  candidateId: string;
  voteCount: number;
  rank: number;
  outcome: number;
}
// Tied candidates (same rank == same vote count == same outcome) collapse into
// one box that shares a single rank number.
interface RankGroup {
  rank: number;
  voteCount: number;
  outcome: number;
  candidateIds: string[];
}

// Mirrors the backend TallyOutcomes: competition ranking (ties share a rank),
// top `seats` = Elected, next `alternates` = Alternate, rest = Not Elected.
function tally(counts: { candidateId: string; votes: number }[], seats: number, alternates: number): Row[] {
  const ordered = [...counts].sort((a, b) => b.votes - a.votes);
  const electedCut = ordered.length >= seats ? ordered[seats - 1].votes : -Infinity;
  const alternateCut = ordered.length >= seats + alternates ? ordered[seats + alternates - 1].votes : -Infinity;
  let rank = 0;
  let seen = 0;
  let prev = Infinity;
  return ordered.map((c) => {
    seen++;
    if (c.votes !== prev) {
      rank = seen;
      prev = c.votes;
    }
    const outcome = c.votes >= electedCut ? 1 : c.votes >= alternateCut ? 2 : 3;
    return { candidateId: c.candidateId, voteCount: c.votes, rank, outcome };
  });
}

export function ElectionReportContent() {
  const { t } = useTranslation('general-meeting');
  const { language } = useLanguage();
  const langId = language.code === 'en' ? EN : FA;
  const { meeting, refetch: refetchMeeting } = useCurrentMeeting();
  const members = useMembers();

  const [results, setResults] = useState<ResultView[]>([]);
  const [candidates, setCandidates] = useState<CandidateView[]>([]);
  const [votes, setVotes] = useState<VoteView[]>([]);
  const [attendance, setAttendance] = useState<AttendanceView[]>([]);
  const [persons, setPersons] = useState<PersonRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/general-meeting/api/general-meeting/persons');
        if (res.ok && !cancelled) setPersons(await res.json());
      } catch {
        /* non-fatal */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    if (!meeting) {
      setResults([]);
      setCandidates([]);
      setVotes([]);
      setAttendance([]);
      return;
    }
    try {
      const [rRes, cRes, vRes, aRes] = await Promise.all([
        fetch('/general-meeting/api/general-meeting/results', { cache: 'no-store' }),
        fetch('/general-meeting/api/general-meeting/candidates', { cache: 'no-store' }),
        fetch('/general-meeting/api/general-meeting/votes', { cache: 'no-store' }),
        fetch('/general-meeting/api/general-meeting/attendance', { cache: 'no-store' }),
      ]);
      const r: ResultView[] = rRes.ok ? await rRes.json() : [];
      const c: CandidateView[] = cRes.ok ? await cRes.json() : [];
      const v: VoteView[] = vRes.ok ? await vRes.json() : [];
      const a: AttendanceView[] = aRes.ok ? await aRes.json() : [];
      setResults(r.filter((x) => x.meetingId === meeting.id));
      setCandidates(c.filter((x) => x.meetingId === meeting.id));
      setVotes(v.filter((x) => x.meetingId === meeting.id));
      setAttendance(a.filter((x) => x.meetingId === meeting.id));
    } catch {
      /* non-fatal */
    }
  }, [meeting?.id]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh every 5s so results update live during voting.
  useEffect(() => {
    const id = setInterval(() => {
      load();
      refetchMeeting();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [load, refetchMeeting]);

  // Final once tallied; otherwise a live provisional tally from current votes.
  const isFinal = meeting?.status === 'Closed' && results.length > 0;

  const rows: Row[] = useMemo(() => {
    if (isFinal) {
      return [...results]
        .map((r) => ({ candidateId: r.candidateId, voteCount: r.voteCount, rank: r.rank, outcome: r.outcome }))
        .sort((a, b) => b.voteCount - a.voteCount || a.rank - b.rank);
    }
    const counts = candidates.map((c) => ({
      candidateId: c.id,
      votes: votes.filter((v) => v.candidateId === c.id).length,
    }));
    return tally(counts, meeting?.boardSeatCount ?? 7, meeting?.alternateSeatCount ?? 2);
  }, [isFinal, results, candidates, votes, meeting?.boardSeatCount, meeting?.alternateSeatCount]);

  const infoOf = useCallback(
    (candidateId: string) => {
      const c = candidates.find((x) => x.id === candidateId);
      const person = c ? persons.find((p) => p.id === c.personId) : undefined;
      const company = c?.companyId ? members.find((m) => m.companyId === c.companyId) : undefined;
      return {
        personId: c?.personId ?? '',
        companyId: c?.companyId ?? null,
        personName: person ? personDisplayName(person, langId) : (c?.personId ?? candidateId),
        companyName: company?.name ?? '',
      };
    },
    [candidates, persons, members, langId],
  );

  // Collapse tied candidates into one box per rank. `rows` is already sorted by
  // votes desc / rank asc, so grouping in order keeps the rank ascending.
  const groups: RankGroup[] = useMemo(() => {
    const byRank = new Map<number, RankGroup>();
    const order: number[] = [];
    for (const r of rows) {
      let g = byRank.get(r.rank);
      if (!g) {
        g = { rank: r.rank, voteCount: r.voteCount, outcome: r.outcome, candidateIds: [] };
        byRank.set(r.rank, g);
        order.push(r.rank);
      }
      g.candidateIds.push(r.candidateId);
    }
    return order.map((rk) => byRank.get(rk)!);
  }, [rows]);

  // Present members are the potential voters — each can cast a vote for any one
  // candidate, so the present count is the full scale (100%) for the vote bars.
  const presentCount = useMemo(() => attendance.filter((a) => a.isPresent).length, [attendance]);

  // Outcome is assigned purely by BOX POSITION (not vote thresholds): the first
  // `boardSeatCount` boxes are Board Members (Elected), the next
  // `alternateSeatCount` boxes are Alternates, and every box beyond that gets no
  // outcome at all (neutral styling, no badge). Applies to live and final.
  const boardSeats = meeting?.boardSeatCount ?? 7;
  const alternateSeats = meeting?.alternateSeatCount ?? 2;
  const boxMeta = (boxIndex: number) => {
    if (boxIndex < boardSeats)
      return { label: t('resultsElected', { defaultValue: 'Elected' }), accent: 'border-s-emerald-500', badge: 'success' as const, fill: 'bg-emerald-500/20 dark:bg-emerald-500/25' };
    if (boxIndex < boardSeats + alternateSeats)
      return { label: t('resultsAlternate', { defaultValue: 'Alternate' }), accent: 'border-s-amber-500', badge: 'warning' as const, fill: 'bg-amber-500/20 dark:bg-amber-500/25' };
    return null;
  };

  const resultsBlock =
    groups.length === 0 ? (
      <Card>
        <CardContent className="py-16 text-center text-lg text-muted-foreground">
          {t('resultsNoData', {
            defaultValue: 'No results yet. Close voting on the Board Election page to tally.',
          })}
        </CardContent>
      </Card>
    ) : (
      <div className="space-y-3">
        {groups.map((g, gi) => {
          const meta = boxMeta(gi);
          return (
            <Card key={g.rank} className={`relative overflow-hidden border-s-4 ${meta ? meta.accent : 'border-s-slate-300 dark:border-s-slate-700'}`}>
              {/* the box background itself is the progress bar: it fills from the
                  leading edge to voteCount / presentCount of the box width */}
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-y-0 start-0 ${meta ? meta.fill : 'bg-slate-400/15 dark:bg-slate-500/20'}`}
                style={{
                  width: `${presentCount > 0 ? Math.min(100, (g.voteCount / presentCount) * 100) : 0}%`,
                }}
              />
              <CardContent className="relative flex items-center gap-4 py-4">
                {/* sequential, gapless box number — tied candidates share this one box.
                    (competition rank has gaps after a tie, e.g. 1,1,3 — we number boxes 1,2,3) */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-bold tabular-nums">
                  {gi + 1}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  {g.candidateIds.map((cid) => {
                    const info = infoOf(cid);
                    return (
                      <div key={cid} className="flex items-center gap-3">
                        <CompanyLogo
                          companyId={info.companyId}
                          name={info.companyName}
                          className="size-11 rounded object-contain shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          {/* Member (company) name — primary */}
                          <div
                            className="truncate text-lg font-semibold"
                            style={{ unicodeBidi: 'plaintext' }}
                          >
                            {info.companyName || '—'}
                          </div>
                          {/* Person name — secondary */}
                          <div
                            className="truncate text-sm text-muted-foreground"
                            style={{ unicodeBidi: 'plaintext' }}
                          >
                            {info.personName}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="shrink-0 text-center tabular-nums">
                  <div className="text-3xl font-bold leading-none">{g.voteCount}</div>
                  <div
                    className="mt-1 text-xs text-muted-foreground"
                    title={t('ofPresentVoters', { defaultValue: 'of present voters' })}
                  >
                    / {presentCount}
                  </div>
                </div>
                {meta && (
                  <Badge variant={meta.badge} appearance="light" className="shrink-0">
                    {meta.label}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );

  // The vote box (and thus the 80/20 split) shows only while voting is open and
  // there are candidates; otherwise the report takes the full page width.
  const showVoteBox = Boolean(
    meeting && meeting.status !== 'Closed' && candidates.length > 0,
  );

  // Page header — now a left-hand column (not a full-width top bar). Contents are
  // stacked vertically & centered with smaller text so they fit the narrow column.
  const headerCard = (
    <Card>
      <CardContent className="py-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <ReportClock size="text-xl md:text-2xl" className="text-foreground" />
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {t('pageTitleElectionReport', { defaultValue: 'Election Results' })}
          </h1>
          {meeting && (
            <>
              <p
                className="text-xl md:text-2xl text-foreground"
                style={{ unicodeBidi: 'plaintext' }}
              >
                {meeting.title}
              </p>
              {isFinal ? (
                <Badge variant="secondary" appearance="light" className="text-xl md:text-2xl">
                  {t('resultsFinal', { defaultValue: 'Final results' })}
                </Badge>
              ) : (
                <Badge variant="success" appearance="light" className="animate-pulse text-xl md:text-2xl">
                  ● {t('resultsLive', { defaultValue: 'Live — updating every 5s' })}
                </Badge>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ReportShell>
      <div className="w-full space-y-6">
        {/* System title banner — top of the page */}
        <Card>
          <CardContent className="py-8">
            <div
              className="text-center text-[1.8rem] md:text-[2.4rem] font-bold text-foreground"
              style={{ unicodeBidi: 'plaintext' }}
            >
              {t('reportSystemTitle', {
                defaultValue: 'Comprehensive Members & Related Persons Information System',
              })}
            </div>
          </CardContent>
        </Card>

        {/* Three sections across the page. DOM order [vote box, report, header]
            so the RTL layout renders: vote box → right, report → center,
            header → left. Falls back to report + header when voting is closed. */}
        {showVoteBox ? (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 lg:gap-7.5 items-start">
            <div className="xl:col-span-1 xl:sticky xl:top-6">
              <VoteBox
                meeting={meeting}
                candidates={candidates}
                onVoted={load}
              />
            </div>
            <div className="xl:col-span-3">{resultsBlock}</div>
            <div className="xl:col-span-1 xl:sticky xl:top-6">{headerCard}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 lg:gap-7.5 items-start">
            <div className="xl:col-span-3">{resultsBlock}</div>
            <div className="xl:col-span-1 xl:sticky xl:top-6">{headerCard}</div>
          </div>
        )}
      </div>
    </ReportShell>
  );
}

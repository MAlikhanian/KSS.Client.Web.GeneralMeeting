'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { RiErrorWarningFill } from '@remixicon/react';
import { Minus, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/providers/i18n-provider';
import { usePermission } from '@/hooks/use-permission';
import { useCurrentMeeting } from '../hooks/use-current-meeting';
import { CurrentMeetingBanner } from '../components/current-meeting-banner';
import { personDisplayName, type PersonRecord } from '../components/person-picker';
import { useMembers } from '../components/member-picker';
import { PersonPhoto, CompanyLogo } from '../components/election-media';

const FA = 12;
const EN = 10;
const ANONYMOUS = 0; // MemberType 0 marks a secret-ballot (anonymous) vote

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
  memberType: number;
  candidateId: string;
}

function showError(msg: string) {
  toast.custom(
    () => (
      <Alert variant="mono" icon="destructive">
        <AlertIcon>
          <RiErrorWarningFill />
        </AlertIcon>
        <AlertTitle>{msg}</AlertTitle>
      </Alert>
    ),
    { position: 'top-center' },
  );
}
async function errMessage(res: Response): Promise<string> {
  try {
    return (await res.json())?.message || 'Request failed';
  } catch {
    return 'Request failed';
  }
}

/**
 * Secret-ballot counter for the hidden election. The operator reads each paper
 * ballot and taps +1 on every candidate it marks; -1 undoes a mistap. Each +1
 * inserts an anonymous MeetingVote (MemberType 0) on the backend, which feeds
 * the same tally/report as named ballots — so the counts here are what the
 * Election Results page shows.
 */
export function HiddenElectionContent() {
  const { t } = useTranslation('general-meeting');
  const { language } = useLanguage();
  const langId = language.code === 'en' ? EN : FA;
  const { hasPermission } = usePermission();
  const canManage = hasPermission(['Members.Election.Manage']);

  const { meeting } = useCurrentMeeting();
  const members = useMembers();

  const [persons, setPersons] = useState<PersonRecord[]>([]);
  const [candidates, setCandidates] = useState<CandidateView[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Voting is open for the whole meeting (until it is closed).
  const votingOpen = Boolean(meeting && meeting.status !== 'Closed');

  // Person directory (loaded once).
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
      setCandidates([]);
      setCounts({});
      return;
    }
    try {
      const [cRes, vRes] = await Promise.all([
        fetch('/general-meeting/api/general-meeting/candidates', { cache: 'no-store' }),
        fetch('/general-meeting/api/general-meeting/votes', { cache: 'no-store' }),
      ]);
      const c: CandidateView[] = cRes.ok ? await cRes.json() : [];
      const v: VoteView[] = vRes.ok ? await vRes.json() : [];
      const cs = c.filter((x) => x.meetingId === meeting.id);
      const vs = v.filter((x) => x.meetingId === meeting.id && x.memberType === ANONYMOUS);
      setCandidates(cs);
      const map: Record<string, number> = {};
      for (const cand of cs) map[cand.id] = vs.filter((x) => x.candidateId === cand.id).length;
      setCounts(map);
    } catch {
      /* non-fatal */
    }
  }, [meeting?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const infoOf = useCallback(
    (c: CandidateView) => {
      const person = persons.find((p) => p.id === c.personId);
      const company = c.companyId ? members.find((m) => m.companyId === c.companyId) : undefined;
      return {
        name: person ? personDisplayName(person, langId) : c.personId,
        companyName: company?.name ?? '',
      };
    },
    [persons, members, langId],
  );

  const adjust = useCallback(
    async (candidateId: string, delta: number) => {
      if (!meeting) return;
      // Optimistic update — a single operator drives the count, so trust the
      // local bump and only reconcile with the server if the call fails.
      setCounts((prev) => ({
        ...prev,
        [candidateId]: Math.max(0, (prev[candidateId] ?? 0) + delta),
      }));
      try {
        const res = await fetch(
          `/general-meeting/api/general-meeting/workflow/anonymous-vote?meetingId=${encodeURIComponent(meeting.id)}` +
            `&candidateId=${encodeURIComponent(candidateId)}&delta=${delta}`,
          { method: 'POST' },
        );
        if (!res.ok) throw new Error(await errMessage(res));
      } catch (e) {
        showError((e as Error)?.message);
        await load(); // reconcile with server truth
      }
    },
    [meeting?.id, load],
  );

  const totalBallots = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts],
  );

  return (
    <div className="space-y-5 lg:space-y-7.5 [&_div.rounded-xl.bg-card]:bg-violet-50/40! [&_div.rounded-xl.bg-card]:border-violet-100! dark:[&_div.rounded-xl.bg-card]:bg-violet-950/25! dark:[&_div.rounded-xl.bg-card]:border-violet-900! [&_div.rounded-xl.bg-card]:shadow-lg [&_div.rounded-xl.bg-card]:shadow-black/5">
      <Card>
        <CardContent className="py-5">
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text={t('pageTitleHiddenElection', { defaultValue: 'Secret Ballot Count' })} />
              <ToolbarDescription>
                {t('descHiddenElection', {
                  defaultValue:
                    'Tally secret paper ballots — tap +1 for each candidate as ballots are read out. Votes are anonymous.',
                })}
              </ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
        </CardContent>
      </Card>

      <CurrentMeetingBanner meeting={meeting} />

      {!canManage ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {t('hiddenNoPermission', {
              defaultValue: 'You do not have permission to run the secret ballot count.',
            })}
          </CardContent>
        </Card>
      ) : !meeting ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {t('electionNoMeeting', { defaultValue: 'No meeting is currently open.' })}
          </CardContent>
        </Card>
      ) : candidates.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {t('noCandidatesYet', { defaultValue: 'No candidates registered yet.' })}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-muted-foreground">
              {t('hiddenTotalBallots', { defaultValue: 'Total votes counted' })}:{' '}
              <span className="font-bold tabular-nums text-foreground">{totalBallots}</span>
            </div>
            {!votingOpen && (
              <Badge variant="secondary" appearance="light">
                {t('hiddenVotingClosed', { defaultValue: 'Meeting closed — count is final' })}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((c, i) => {
              const info = infoOf(c);
              const count = counts[c.id] ?? 0;
              return (
                <Card key={c.id}>
                  <CardContent className="flex flex-col items-center gap-3 py-5 text-center">
                    <div className="flex items-center gap-2 self-stretch">
                      <Badge variant="outline" className="tabular-nums">
                        {c.candidateNumber ?? i + 1}
                      </Badge>
                      <PersonPhoto personId={c.personId} name={info.name} />
                      <div className="min-w-0 flex-1 text-start">
                        <div className="truncate font-semibold" style={{ unicodeBidi: 'plaintext' }}>
                          {info.name}
                        </div>
                        {info.companyName && (
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CompanyLogo
                              companyId={c.companyId}
                              name={info.companyName}
                              className="size-4 rounded object-contain shrink-0"
                            />
                            <span className="truncate" style={{ unicodeBidi: 'plaintext' }}>
                              {info.companyName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-5xl font-bold tabular-nums leading-none">{count}</div>
                    <div className="text-xs text-muted-foreground">
                      {t('votesCol', { defaultValue: 'Votes' })}
                    </div>

                    <div className="flex items-center gap-2 self-stretch">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 shrink-0"
                        disabled={!votingOpen || count === 0}
                        onClick={() => adjust(c.id, -1)}
                        aria-label="-1"
                      >
                        <Minus className="size-5" />
                      </Button>
                      <Button
                        className="h-12 flex-1 text-lg"
                        disabled={!votingOpen}
                        onClick={() => adjust(c.id, 1)}
                      >
                        <Plus className="size-5" />
                        +1
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

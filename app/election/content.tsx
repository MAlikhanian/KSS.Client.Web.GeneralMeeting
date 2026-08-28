'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/providers/i18n-provider';
import { useBrokerages } from '@/hooks/use-brokerages';
import { useInvestmentFunds } from '@/hooks/use-investment-funds';
import { useCurrentMeeting } from '../hooks/use-current-meeting';
import { CurrentMeetingBanner } from '../components/current-meeting-banner';
import { personDisplayName, type PersonRecord } from '../components/person-picker';

const FA = 12;
const EN = 10;

interface CandidateView {
  id: string;
  meetingId: string;
  personId: string;
  companyId: string | null;
  candidateNumber: number | null;
}
interface AttendanceView {
  id: string;
  meetingId: string;
  companyId: string;
  memberType: number;
  isPresent: boolean;
}
interface VoteView {
  id: string;
  meetingId: string;
  voterCompanyId: string;
  memberType: number;
  candidateId: string;
}

function showSuccess(msg: string) {
  toast.custom(
    () => (
      <Alert variant="mono" icon="success">
        <AlertIcon>
          <RiCheckboxCircleFill />
        </AlertIcon>
        <AlertTitle>{msg}</AlertTitle>
      </Alert>
    ),
    { position: 'top-center' },
  );
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

export function ElectionContent() {
  const { t } = useTranslation('general-meeting');
  const { language } = useLanguage();
  const langId = language.code === 'en' ? EN : FA;

  const { meeting } = useCurrentMeeting();
  const { brokerages } = useBrokerages();
  const { investmentFunds } = useInvestmentFunds();

  const [persons, setPersons] = useState<PersonRecord[]>([]);
  const [candidates, setCandidates] = useState<CandidateView[]>([]);
  const [attendance, setAttendance] = useState<AttendanceView[]>([]);
  const [votes, setVotes] = useState<VoteView[]>([]);

  const [voter, setVoter] = useState<string>('');
  const [selection, setSelection] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const maxSel = meeting?.maxSelectionsPerBallot ?? 7;
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

  const loadForMeeting = useCallback(async () => {
    if (!meeting) {
      setCandidates([]);
      setAttendance([]);
      setVotes([]);
      return;
    }
    try {
      const [cRes, aRes, vRes] = await Promise.all([
        fetch('/general-meeting/api/general-meeting/candidates'),
        fetch('/general-meeting/api/general-meeting/attendance'),
        fetch('/general-meeting/api/general-meeting/votes'),
      ]);
      const c: CandidateView[] = cRes.ok ? await cRes.json() : [];
      const a: AttendanceView[] = aRes.ok ? await aRes.json() : [];
      const v: VoteView[] = vRes.ok ? await vRes.json() : [];
      setCandidates(c.filter((x) => x.meetingId === meeting.id));
      setAttendance(a.filter((x) => x.meetingId === meeting.id));
      setVotes(v.filter((x) => x.meetingId === meeting.id));
    } catch {
      /* non-fatal */
    }
  }, [meeting?.id]);

  useEffect(() => {
    loadForMeeting();
  }, [loadForMeeting]);

  const personName = useCallback(
    (personId: string) => {
      const p = persons.find((x) => x.id === personId);
      return p ? personDisplayName(p, langId) : personId;
    },
    [persons, langId],
  );

  const memberName = useCallback(
    (companyId: string) => {
      const b = brokerages.find((x) => x.id === companyId);
      if (b) return b.name;
      const f = investmentFunds.find((x) => x.id === companyId);
      return f ? f.name : companyId;
    },
    [brokerages, investmentFunds],
  );

  const presentMembers = useMemo(
    () =>
      attendance
        .filter((a) => a.isPresent)
        .map((a) => ({ companyId: a.companyId, memberType: a.memberType, name: memberName(a.companyId) })),
    [attendance, memberName],
  );

  const votedSet = useMemo(() => new Set(votes.map((v) => v.voterCompanyId)), [votes]);

  // When the voter changes, pre-fill the ballot from any existing votes.
  useEffect(() => {
    if (!voter) {
      setSelection([]);
      return;
    }
    setSelection(votes.filter((v) => v.voterCompanyId === voter).map((v) => v.candidateId));
  }, [voter, votes]);

  const toggleSelection = (candidateId: string) => {
    setSelection((sel) => {
      if (sel.includes(candidateId)) return sel.filter((x) => x !== candidateId);
      if (sel.length >= maxSel) {
        showError(t('tooManySelected', { defaultValue: 'You can select at most {max} candidates.' }).replace('{max}', String(maxSel)));
        return sel;
      }
      return [...sel, candidateId];
    });
  };

  const recordBallot = async () => {
    if (!meeting || !voter) {
      showError(t('selectMemberFirst', { defaultValue: 'Select a voting member first.' }));
      return;
    }
    const member = presentMembers.find((m) => m.companyId === voter);
    if (!member) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/general-meeting/api/general-meeting/workflow/cast-ballot?meetingId=${encodeURIComponent(meeting.id)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voterCompanyId: voter,
            memberType: member.memberType,
            candidateIds: selection,
          }),
        },
      );
      if (!res.ok) throw new Error(await errMessage(res));
      showSuccess(t('ballotRecorded', { defaultValue: 'Ballot recorded' }));
      setVoter('');
      setSelection([]);
      await loadForMeeting();
    } catch (e) {
      showError((e as Error)?.message);
    } finally {
      setBusy(false);
    }
  };

  // Meeting lifecycle (close + tally) is handled on the Meeting Management page.

  return (
    <div className="space-y-5 lg:space-y-7.5 [&_div.rounded-xl.bg-card]:bg-emerald-50/40! [&_div.rounded-xl.bg-card]:border-emerald-100! dark:[&_div.rounded-xl.bg-card]:bg-emerald-950/25! dark:[&_div.rounded-xl.bg-card]:border-emerald-900! [&_div.rounded-xl.bg-card]:shadow-lg [&_div.rounded-xl.bg-card]:shadow-black/5">
      <Card>
        <CardContent className="py-5">
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text={t('pageTitleElection', { defaultValue: 'Board Election' })} />
              <ToolbarDescription>
                {t('descElection', {
                  defaultValue:
                    'Cast ballots for present members — each ballot selects up to 7 of the 15 candidates for the board.',
                })}
              </ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
        </CardContent>
      </Card>

      <CurrentMeetingBanner meeting={meeting} />

      {!meeting ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {t('electionNoMeeting', { defaultValue: 'No meeting is currently open.' })}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Ballot entry */}
          <Card>
            <CardHeader>
              <CardTitle>{t('ballotTitle', { defaultValue: 'Record Ballot' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!votingOpen ? (
                <p className="text-sm text-muted-foreground">
                  {t('electionNotOpen', {
                    defaultValue: 'This meeting is closed — voting has ended.',
                  })}
                </p>
              ) : presentMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('noPresentMembers', { defaultValue: 'No present members to vote.' })}
                </p>
              ) : (
                <>
                  <div className="space-y-1 max-w-md">
                    <Label>{t('votingMember', { defaultValue: 'Voting Member' })}</Label>
                    <Select value={voter || undefined} onValueChange={setVoter}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectMemberPlaceholder', { defaultValue: 'Select a present member' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {presentMembers.map((m) => (
                          <SelectItem key={m.companyId} value={m.companyId}>
                            {m.name}
                            {votedSet.has(m.companyId) ? ` ✓` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {voter && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {t('maxSelectionsHint', { defaultValue: 'Select up to {max} candidates.' }).replace(
                          '{max}',
                          String(maxSel),
                        )}{' '}
                        ({selection.length}/{maxSel})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {candidates.map((c, i) => {
                          const on = selection.includes(c.id);
                          return (
                            <Button
                              key={c.id}
                              size="sm"
                              variant={on ? undefined : 'outline'}
                              disabled={busy}
                              onClick={() => toggleSelection(c.id)}
                            >
                              <span className="tabular-nums me-1 opacity-60">{c.candidateNumber ?? i + 1}.</span>
                              {personName(c.personId)}
                            </Button>
                          );
                        })}
                      </div>
                      <div>
                        <Button onClick={recordBallot} disabled={busy || selection.length === 0}>
                          {t('recordBallot', { defaultValue: 'Record Ballot' })}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

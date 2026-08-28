'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { RiErrorWarningFill } from '@remixicon/react';
import { Minus, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/useTranslation';
import { useMembers } from '../../components/member-picker';

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

interface MeetingLike {
  id: string;
  status: string;
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
 * Live +/- ballot tally embedded on the Election Results board. Each candidate
 * is a single line — company name + a - / + control. Every tap posts an
 * anonymous MeetingVote (MemberType 0) via the same workflow the Secret Ballot
 * page uses, feeding the live tally shown to the left. Rendered only while the
 * meeting is open. Per-candidate counts are tracked internally (seeded once per
 * meeting) purely to disable - at 0 — they are not displayed.
 */
export function VoteBox({
  meeting,
  candidates,
  onVoted,
}: {
  meeting: MeetingLike | null | undefined;
  candidates: CandidateView[];
  onVoted: () => void;
}) {
  const { t } = useTranslation('general-meeting');
  const members = useMembers();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const seededRef = useRef<string | null>(null);

  const votingOpen = Boolean(meeting && meeting.status !== 'Closed');

  // Seed each candidate's anonymous vote count once per meeting (guarded with
  // seededRef so the parent's 5s candidate refresh does not clobber optimistic
  // +/- taps). Counts are used only to disable - at 0.
  useEffect(() => {
    if (!meeting) {
      setCounts({});
      seededRef.current = null;
      return;
    }
    if (candidates.length === 0) return;
    if (seededRef.current === meeting.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/general-meeting/api/general-meeting/votes', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const votes: VoteView[] = await res.json();
        const map: Record<string, number> = {};
        for (const c of candidates) {
          map[c.id] = votes.filter(
            (v) =>
              v.meetingId === meeting.id &&
              v.memberType === ANONYMOUS &&
              v.candidateId === c.id,
          ).length;
        }
        if (!cancelled) {
          setCounts(map);
          seededRef.current = meeting.id;
        }
      } catch {
        /* non-fatal */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [meeting?.id, candidates]);

  const adjust = useCallback(
    async (candidateId: string, delta: number) => {
      if (!meeting) return;
      // Optimistic bump — a single operator drives the count, so trust the local
      // change and only reconcile if the request fails.
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
        onVoted(); // refresh the live results panel on the left
      } catch (e) {
        showError((e as Error)?.message);
        // revert the optimistic bump
        setCounts((prev) => ({
          ...prev,
          [candidateId]: Math.max(0, (prev[candidateId] ?? 0) - delta),
        }));
      }
    },
    [meeting?.id, onVoted],
  );

  const companyName = (companyId: string | null) =>
    (companyId ? members.find((m) => m.companyId === companyId)?.name : '') ?? '';

  // Only offer voting while a meeting is open and there are candidates.
  if (!meeting || !votingOpen || candidates.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('voteBoxTitle', { defaultValue: 'Cast your vote' })}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('voteBoxHint', {
            defaultValue: 'Tap + to add a vote, − to remove. Saved automatically.',
          })}
        </p>
        <div className="grid grid-cols-1 gap-2">
          {candidates.map((c) => {
            const cname = companyName(c.companyId);
            const count = counts[c.id] ?? 0;
            return (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-lg border p-1"
              >
                <span
                  className="min-w-0 flex-1 truncate text-sm font-semibold"
                  style={{ unicodeBidi: 'plaintext' }}
                >
                  {cname || '—'}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0"
                  disabled={count === 0}
                  onClick={() => adjust(c.id, -1)}
                  aria-label="-1"
                >
                  <Minus className="size-4" />
                </Button>
                <Button
                  size="icon"
                  className="size-9 shrink-0"
                  onClick={() => adjust(c.id, 1)}
                  aria-label="+1"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

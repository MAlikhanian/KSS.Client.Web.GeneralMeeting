'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/providers/i18n-provider';
import { usePermission } from '@/hooks/use-permission';
import { useCurrentMeeting } from '../hooks/use-current-meeting';
import { CurrentMeetingBanner } from '../components/current-meeting-banner';
import { personDisplayName, type PersonRecord } from '../components/person-picker';
import { useMembers } from '../components/member-picker';

const FA = 12;
const EN = 10;

interface CandidateView {
  id: string;
  meetingId: string;
  personId: string;
  companyId: string | null;
  candidateNumber: number | null;
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

/**
 * Select the board-election candidates for the current meeting. Moved out of the
 * (transparent) election page so candidate registration is a distinct step.
 */
export function CandidatesContent() {
  const { t } = useTranslation('general-meeting');
  const { language } = useLanguage();
  const langId = language.code === 'en' ? EN : FA;
  const { hasPermission } = usePermission();
  const canManage = hasPermission(['Members.Election.Manage']);

  const router = useRouter();
  const { meeting } = useCurrentMeeting();
  const members = useMembers();

  const [persons, setPersons] = useState<PersonRecord[]>([]);
  const [candidates, setCandidates] = useState<CandidateView[]>([]);
  const [busy, setBusy] = useState(false);

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
      return;
    }
    try {
      const res = await fetch('/general-meeting/api/general-meeting/candidates', { cache: 'no-store' });
      const c: CandidateView[] = res.ok ? await res.json() : [];
      setCandidates(c.filter((x) => x.meetingId === meeting.id));
    } catch {
      /* non-fatal */
    }
  }, [meeting?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const personName = useCallback(
    (personId: string) => {
      const p = persons.find((x) => x.id === personId);
      return p ? personDisplayName(p, langId) : personId;
    },
    [persons, langId],
  );

  const memberName = useCallback(
    (companyId: string | null) => {
      if (!companyId) return '—';
      const m = members.find((x) => x.companyId === companyId);
      return m?.name ?? companyId;
    },
    [members],
  );

  const removeCandidate = async (c: CandidateView) => {
    setBusy(true);
    try {
      const res = await fetch('/general-meeting/api/general-meeting/candidates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
      if (!res.ok) throw new Error(await errMessage(res));
      showSuccess(t('candidateRemoved', { defaultValue: 'Candidate removed' }));
      await load();
    } catch (e) {
      showError((e as Error)?.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 lg:space-y-7.5 [&_div.rounded-xl.bg-card]:bg-teal-50/40! [&_div.rounded-xl.bg-card]:border-teal-100! dark:[&_div.rounded-xl.bg-card]:bg-teal-950/25! dark:[&_div.rounded-xl.bg-card]:border-teal-900! [&_div.rounded-xl.bg-card]:shadow-lg [&_div.rounded-xl.bg-card]:shadow-black/5">
      <Card>
        <CardContent className="py-5">
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text={t('pageTitleCandidates', { defaultValue: 'Select Candidates' })} />
              <ToolbarDescription>
                {t('descCandidates', {
                  defaultValue: 'Register the board-election candidates for the current meeting.',
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
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              {t('candidatesTitle', { defaultValue: 'Candidates' })}
              <Badge variant="outline">{candidates.length}</Badge>
            </CardTitle>
            {canManage && (
              <Button onClick={() => router.push('/candidates/create')}>
                <Plus className="size-4" />
                {t('addCandidate', { defaultValue: 'Add Candidate' })}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t('candidateNumberCol', { defaultValue: 'No.' })}</TableHead>
                  <TableHead>{t('candidateNameCol', { defaultValue: 'Candidate' })}</TableHead>
                  <TableHead>{t('memberCompany', { defaultValue: 'Company' })}</TableHead>
                  {canManage && <TableHead className="w-20 text-center" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c, i) => (
                  <TableRow key={c.id}>
                    <TableCell className="tabular-nums">{c.candidateNumber ?? i + 1}</TableCell>
                    <TableCell style={{ unicodeBidi: 'plaintext' }}>{personName(c.personId)}</TableCell>
                    <TableCell style={{ unicodeBidi: 'plaintext' }}>{memberName(c.companyId)}</TableCell>
                    {canManage && (
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          disabled={busy}
                          onClick={() => removeCandidate(c)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {candidates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 4 : 3} className="py-8 text-center text-muted-foreground">
                      {t('noCandidatesYet', { defaultValue: 'No candidates registered yet.' })}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

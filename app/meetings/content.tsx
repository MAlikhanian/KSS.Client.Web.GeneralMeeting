'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { Plus, Pencil, Trash2, Gavel, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import type { MeetingViewDto } from '@/services/general-meeting-api';

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

const isClosed = (s: string) => s === 'Closed';

/**
 * Meeting Management: the single home for the meeting lifecycle. Create and edit
 * live on dedicated pages (/meetings/create, /meetings/edit); this list drives
 * set-as-current, close, and delete. The operational pages (attendance,
 * elections) only show a read-only current-meeting banner.
 */
export function MeetingsContent() {
  const { t } = useTranslation('general-meeting');
  const { language } = useLanguage();
  const locale = language.code === 'en' ? 'en-US' : 'fa-IR';
  const { hasPermission } = usePermission();
  const canEdit = hasPermission(['Members.Meeting.Modify']);
  const canRun = hasPermission(['Members.Election.Manage']);
  const router = useRouter();
  const { refetch: refetchCurrent } = useCurrentMeeting();

  const [meetings, setMeetings] = useState<MeetingViewDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/general-meeting/api/general-meeting/meetings', { cache: 'no-store' });
      const all: MeetingViewDto[] = res.ok ? await res.json() : [];
      all.sort((a, b) => (a.meetingDate < b.meetingDate ? 1 : a.meetingDate > b.meetingDate ? -1 : 0));
      setMeetings(all);
    } catch {
      /* non-fatal */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (url: string, okMsg: string) => {
    setBusy(true);
    try {
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) throw new Error(await errMessage(res));
      showSuccess(okMsg);
      await load();
      refetchCurrent();
    } catch (e) {
      showError((e as Error)?.message);
    } finally {
      setBusy(false);
    }
  };

  const setCurrent = (m: MeetingViewDto) =>
    runAction(
      `/api/general-meeting/workflow/set-current?meetingId=${encodeURIComponent(m.id)}`,
      t('meetingActivated', { defaultValue: 'Meeting set as current' }),
    );

  const close = (m: MeetingViewDto) =>
    runAction(
      `/api/general-meeting/workflow/close-and-tally?meetingId=${encodeURIComponent(m.id)}`,
      t('meetingClosed', { defaultValue: 'Meeting closed' }),
    );

  const remove = async (m: MeetingViewDto) => {
    setBusy(true);
    try {
      const res = await fetch('/general-meeting/api/general-meeting/meetings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: m.id }),
      });
      if (!res.ok) throw new Error(await errMessage(res));
      showSuccess(t('meetingDeleted', { defaultValue: 'Meeting deleted' }));
      setConfirmDeleteId(null);
      await load();
      refetchCurrent();
    } catch (e) {
      showError((e as Error)?.message);
    } finally {
      setBusy(false);
    }
  };

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-5 lg:space-y-7.5 [&_div.rounded-xl.bg-card]:bg-slate-50/40! [&_div.rounded-xl.bg-card]:border-slate-200! dark:[&_div.rounded-xl.bg-card]:bg-slate-900/25! dark:[&_div.rounded-xl.bg-card]:border-slate-800! [&_div.rounded-xl.bg-card]:shadow-lg [&_div.rounded-xl.bg-card]:shadow-black/5">
      <Card>
        <CardContent className="py-5">
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text={t('pageTitleMeetings', { defaultValue: 'Meeting Management' })} />
              <ToolbarDescription>
                {t('descMeetings', {
                  defaultValue:
                    'Create, edit and delete general meetings, choose the active meeting, and close a meeting.',
                })}
              </ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {canRun && (
            <div className="mb-4 flex justify-end">
              <Button onClick={() => router.push('/meetings/create')}>
                <Plus className="size-4" />
                {t('createMeeting', { defaultValue: 'Create Meeting' })}
              </Button>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">{t('meetingTitle', { defaultValue: 'Meeting Title' })}</TableHead>
                <TableHead className="w-36 whitespace-nowrap">{t('meetingDate', { defaultValue: 'Meeting Date' })}</TableHead>
                <TableHead className="w-48">{t('meetingStatus', { defaultValue: 'Status' })}</TableHead>
                <TableHead className="whitespace-nowrap">{t('totalMembers', { defaultValue: 'Total Members' })}</TableHead>
                <TableHead className="whitespace-nowrap">{t('boardSeatCount', { defaultValue: 'Board Seats' })}</TableHead>
                <TableHead className="whitespace-nowrap">{t('alternateSeatCount', { defaultValue: 'Alternate Seats' })}</TableHead>
                <TableHead className="whitespace-nowrap">{t('maxSelectionsPerBallot', { defaultValue: 'Max Selections per Ballot' })}</TableHead>
                <TableHead>{t('actionsCol', { defaultValue: 'Actions' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((m) => (
                <TableRow
                  key={m.id}
                  className={
                    m.isCurrent && !isClosed(m.status)
                      ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40'
                      : undefined
                  }
                >
                  <TableCell style={{ unicodeBidi: 'plaintext' }}>
                    <span className="font-medium">{m.title}</span>
                    {m.isCurrent && !isClosed(m.status) && (
                      <Badge variant="primary" appearance="light" className="ms-2">
                        {t('currentBadge', { defaultValue: 'Current' })}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums whitespace-nowrap" style={{ unicodeBidi: 'plaintext' }}>
                    {fmtDate(m.meetingDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isClosed(m.status) ? 'secondary' : 'success'} appearance="light">
                      {isClosed(m.status)
                        ? t('statusClosed', { defaultValue: 'Closed' })
                        : t('statusOpen', { defaultValue: 'Open' })}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{m.totalMembers}</TableCell>
                  <TableCell className="tabular-nums">{m.boardSeatCount}</TableCell>
                  <TableCell className="tabular-nums">{m.alternateSeatCount}</TableCell>
                  <TableCell className="tabular-nums">{m.maxSelectionsPerBallot}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center justify-start gap-1.5">
                      {confirmDeleteId === m.id ? (
                        <>
                          <span className="text-xs text-muted-foreground">
                            {t('confirmDeleteMeeting', {
                              defaultValue: 'Delete this meeting and all its data?',
                            })}
                          </span>
                          <Button size="sm" variant="destructive" disabled={busy} onClick={() => remove(m)}>
                            {t('yes', { defaultValue: 'Yes' })}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            {t('no', { defaultValue: 'No' })}
                          </Button>
                        </>
                      ) : (
                        <>
                          {canRun && !m.isCurrent && (
                            <Button size="sm" variant="outline" disabled={busy} onClick={() => setCurrent(m)}>
                              <CheckCircle2 className="size-4" />
                              {t('setCurrent', { defaultValue: 'Set as current' })}
                            </Button>
                          )}
                          {canRun && !isClosed(m.status) && (
                            <Button size="sm" variant="outline" disabled={busy} onClick={() => close(m)}>
                              <Gavel className="size-4" />
                              {t('closeMeeting', { defaultValue: 'Close Meeting' })}
                            </Button>
                          )}
                          {canEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy}
                              onClick={() => router.push(`/meetings/edit?id=${m.id}`)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          )}
                          {canEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              disabled={busy}
                              onClick={() => setConfirmDeleteId(m.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {meetings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    {t('noMeetings', { defaultValue: 'No meetings yet. Create a meeting to begin.' })}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

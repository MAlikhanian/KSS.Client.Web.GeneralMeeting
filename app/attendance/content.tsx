'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { RiErrorWarningFill } from '@remixicon/react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { useBrokerages } from '@/hooks/use-brokerages';
import { useInvestmentFunds } from '@/hooks/use-investment-funds';
import { toEnglishDigits } from '@/app/components/person/format-utils';
import { useCurrentMeeting } from '../hooks/use-current-meeting';
import { CurrentMeetingBanner } from '../components/current-meeting-banner';

const BROKERAGE = 1;
const FUND = 2;

interface AttendanceView {
  id: string;
  meetingId: string;
  companyId: string;
  memberType: number;
  isPresent: boolean;
  representativePersonId: string | null;
}

interface MemberRow {
  companyId: string;
  memberType: number;
  name: string;
  nationalId?: string;
  isPresent: boolean;
  attendanceId?: string;
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
    const j = await res.json();
    return j?.message || 'Request failed';
  } catch {
    return 'Request failed';
  }
}

/**
 * Meeting attendance: a merged grid of every member (brokerages + investment
 * funds, keyed by CompanyId) with a present/absent toggle. Editable while the
 * meeting is Open (not Closed). Rows are created lazily — a member gets a
 * MeetingAttendance row when first marked present, and PUT thereafter.
 */
export function AttendanceContent() {
  const { t } = useTranslation('general-meeting');
  const { meeting } = useCurrentMeeting();
  const { brokerages } = useBrokerages();
  const { investmentFunds } = useInvestmentFunds();

  const [rows, setRows] = useState<MemberRow[]>([]);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [brokerageSearch, setBrokerageSearch] = useState('');
  const [fundSearch, setFundSearch] = useState('');

  const loadAttendance = useCallback(async () => {
    if (!meeting) {
      setRows([]);
      return;
    }
    let existing: AttendanceView[] = [];
    try {
      const res = await fetch('/general-meeting/api/general-meeting/attendance');
      if (res.ok) existing = await res.json();
    } catch {
      /* non-fatal — fall back to no prior attendance */
    }
    const byCompany = new Map(
      existing.filter((a) => a.meetingId === meeting.id).map((a) => [a.companyId, a]),
    );
    const members: MemberRow[] = [
      ...brokerages.map((b) => ({ companyId: b.id, memberType: BROKERAGE, name: b.name, nationalId: b.nationalId })),
      ...investmentFunds.map((f) => ({ companyId: f.id, memberType: FUND, name: f.name, nationalId: f.nationalId })),
    ].map((m) => {
      const a = byCompany.get(m.companyId);
      return { ...m, isPresent: a?.isPresent ?? false, attendanceId: a?.id };
    });
    setRows(members);
  }, [meeting?.id, brokerages, investmentFunds]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const presentCount = useMemo(() => rows.filter((r) => r.isPresent).length, [rows]);
  // Total = the meeting's static member count, falling back to the live member list when unset.
  const totalMembers = (meeting?.totalMembers ?? 0) > 0 ? (meeting?.totalMembers ?? 0) : rows.length;

  // Attendance stays editable for the whole meeting — not locked during voting.
  const canEdit = Boolean(meeting && meeting.status !== 'Closed');

  // Live save: setting a member present/absent persists that one row to the DB
  // immediately. Optimistic — set locally, then PUT/POST; revert on failure.
  const setPresence = async (row: MemberRow, present: boolean) => {
    if (!meeting || savingIds.has(row.companyId) || row.isPresent === present) return;

    setRows((rs) => rs.map((r) => (r.companyId === row.companyId ? { ...r, isPresent: present } : r)));
    setSavingIds((s) => new Set(s).add(row.companyId));

    try {
      if (row.attendanceId) {
        const res = await fetch('/general-meeting/api/general-meeting/attendance', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: row.attendanceId, isPresent: present, representativePersonId: null }),
        });
        if (!res.ok) throw new Error(await errMessage(res));
      } else if (present) {
        // No row yet and now present → create it, then remember the new id so the
        // next change PUTs instead of creating a duplicate.
        const res = await fetch('/general-meeting/api/general-meeting/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId: meeting.id,
            companyId: row.companyId,
            memberType: row.memberType,
            isPresent: true,
          }),
        });
        if (!res.ok) throw new Error(await errMessage(res));
        const created = await res.json();
        setRows((rs) =>
          rs.map((r) => (r.companyId === row.companyId ? { ...r, attendanceId: created?.id } : r)),
        );
      }
    } catch (e) {
      // Revert the optimistic change.
      setRows((rs) =>
        rs.map((r) => (r.companyId === row.companyId ? { ...r, isPresent: row.isPresent } : r)),
      );
      showError((e as Error)?.message || t('attSaveError', { defaultValue: 'Failed to save attendance' }));
    } finally {
      setSavingIds((s) => {
        const n = new Set(s);
        n.delete(row.companyId);
        return n;
      });
    }
  };

  const brokerageRows = useMemo(() => rows.filter((r) => r.memberType === BROKERAGE), [rows]);
  const fundRows = useMemo(() => rows.filter((r) => r.memberType === FUND), [rows]);

  // One grid (brokerages or funds) with its own search box. A render function
  // (not a child component) so the search Input keeps focus across re-renders.
  const renderGrid = (
    title: string,
    typeRows: MemberRow[],
    search: string,
    setSearch: (v: string) => void,
  ) => {
    const present = typeRows.filter((r) => r.isPresent).length;
    // Search matches member name OR national id (digits normalized so Persian digits match).
    const q = toEnglishDigits(search).trim().toLowerCase();
    const filtered = q
      ? typeRows.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            toEnglishDigits(r.nationalId ?? '').includes(q),
        )
      : typeRows;
    return (
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            {title}
            <Badge variant="outline">
              {t('present', { defaultValue: 'Present' })}: {present} / {typeRows.length}
            </Badge>
          </CardTitle>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground start-3" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchMemberPlaceholder', { defaultValue: 'Search member' })}
              className="ps-9"
              disabled={typeRows.length === 0}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('memberCol', { defaultValue: 'Member' })}</TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('nationalIdCol', { defaultValue: 'National ID' })}
                </TableHead>
                <TableHead className="w-44 text-center">
                  {t('statusCol', { defaultValue: 'Attendance' })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r.companyId}
                  className={
                    r.isPresent
                      ? 'bg-emerald-50/60! hover:bg-emerald-50/80! dark:bg-emerald-950/60! dark:hover:bg-emerald-950/80!'
                      : 'bg-red-50/60! hover:bg-red-50/80! dark:bg-red-950/60! dark:hover:bg-red-950/80!'
                  }
                >
                  <TableCell className="font-medium" style={{ unicodeBidi: 'plaintext' }}>
                    {r.name}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground" style={{ unicodeBidi: 'plaintext' }}>
                    {r.nationalId || '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className={
                          r.isPresent
                            ? 'bg-emerald-600! text-white! border-emerald-600! hover:bg-emerald-700!'
                            : undefined
                        }
                        disabled={!canEdit || savingIds.has(r.companyId)}
                        onClick={() => setPresence(r, true)}
                      >
                        {t('present', { defaultValue: 'Present' })}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={
                          !r.isPresent
                            ? 'bg-red-600! text-white! border-red-600! hover:bg-red-700!'
                            : undefined
                        }
                        disabled={!canEdit || savingIds.has(r.companyId)}
                        onClick={() => setPresence(r, false)}
                      >
                        {t('absent', { defaultValue: 'Absent' })}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    {typeRows.length === 0
                      ? t('noMembers', { defaultValue: 'No members found.' })
                      : t('noResults', { defaultValue: 'No results found' })}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-5 lg:space-y-7.5 [&_div.rounded-xl.bg-card]:bg-emerald-50/40! [&_div.rounded-xl.bg-card]:border-emerald-100! dark:[&_div.rounded-xl.bg-card]:bg-emerald-950/25! dark:[&_div.rounded-xl.bg-card]:border-emerald-900! [&_div.rounded-xl.bg-card]:shadow-lg [&_div.rounded-xl.bg-card]:shadow-black/5">
      <Card>
        <CardContent className="py-5">
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text={t('pageTitleAttendance', { defaultValue: 'Meeting Attendance' })} />
              <ToolbarDescription>
                {t('descAttendance', {
                  defaultValue:
                    'Record member attendance for the general meeting and mark each member as present or absent.',
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
            <p className="font-medium">
              {t('noCurrentMeeting', { defaultValue: 'No meeting is currently open.' })}
            </p>
            <p className="text-sm mt-1">
              {t('noCurrentMeetingHint', {
                defaultValue: 'Start a new meeting to begin recording attendance.',
              })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-sm">
              {t('present', { defaultValue: 'Present' })}: {presentCount} / {totalMembers}
            </Badge>
            {canEdit && (
              <span className="text-xs text-muted-foreground">
                {t('autoSaveHint', { defaultValue: 'Changes are saved automatically.' })}
              </span>
            )}
          </div>

          {!canEdit && (
            <p className="text-sm text-muted-foreground">
              {t('attendanceLocked', {
                defaultValue:
                  'Attendance can only be edited while the meeting is in Draft or Attendance-Open status.',
              })}
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
            {renderGrid(
              t('brokeragesCard', { defaultValue: 'Brokerages' }),
              brokerageRows,
              brokerageSearch,
              setBrokerageSearch,
            )}
            {renderGrid(
              t('fundsCard', { defaultValue: 'Funds' }),
              fundRows,
              fundSearch,
              setFundSearch,
            )}
          </div>
        </>
      )}
    </div>
  );
}

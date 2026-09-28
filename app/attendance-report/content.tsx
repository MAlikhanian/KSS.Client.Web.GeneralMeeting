'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useBrokerages } from '@/hooks/use-brokerages';
import { useInvestmentFunds } from '@/hooks/use-investment-funds';
import { useCurrentMeeting } from '../hooks/use-current-meeting';
import { AttendancePie } from '../components/attendance-pie';
import { ReportShell } from '../components/report-shell';
import { ReportClock } from '../components/report-clock';

const BROKERAGE = 1;
const FUND = 2;

interface AttendanceView {
  id: string;
  meetingId: string;
  companyId: string;
  memberType: number;
  isPresent: boolean;
}
interface MemberRow {
  companyId: string;
  memberType: number;
  isPresent: boolean;
}

/** Clean, projector-friendly attendance report: just the large attendance donut
 * with the quorum in its centre. Rendered full-screen (no app menu) with a Back
 * button. */
export function AttendanceReportContent() {
  const { t } = useTranslation('general-meeting');
  const { meeting, refetch: refetchMeeting } = useCurrentMeeting();
  const { brokerages } = useBrokerages();
  const { investmentFunds } = useInvestmentFunds();
  const [attendance, setAttendance] = useState<AttendanceView[]>([]);

  const load = useCallback(async () => {
    if (!meeting) {
      setAttendance([]);
      return;
    }
    try {
      const res = await fetch('/general-meeting/api/general-meeting/attendance', { cache: 'no-store' });
      const all: AttendanceView[] = res.ok ? await res.json() : [];
      setAttendance(all.filter((a) => a.meetingId === meeting.id));
    } catch {
      /* non-fatal */
    }
  }, [meeting?.id]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh every 5s so the report stays live on the projector.
  useEffect(() => {
    const id = setInterval(() => {
      load();
      refetchMeeting();
    }, 5000);
    return () => clearInterval(id);
  }, [load, refetchMeeting]);

  const rows: MemberRow[] = useMemo(() => {
    const present = new Map(attendance.map((a) => [a.companyId, a.isPresent]));
    return [
      ...brokerages.map((b) => ({ companyId: b.id, memberType: BROKERAGE })),
      ...investmentFunds.map((f) => ({ companyId: f.id, memberType: FUND })),
    ].map((m) => ({ ...m, isPresent: present.get(m.companyId) ?? false }));
  }, [brokerages, investmentFunds, attendance]);

  const stats = useMemo(() => {
    // Total = the meeting's static member count, falling back to the live list when unset.
    const total = (meeting?.totalMembers ?? 0) > 0 ? (meeting?.totalMembers ?? 0) : rows.length;
    const present = rows.filter((r) => r.isPresent).length;
    const brokeragesPresent = rows.filter((r) => r.memberType === BROKERAGE && r.isPresent).length;
    const fundsPresent = rows.filter((r) => r.memberType === FUND && r.isPresent).length;
    const quorum = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent: total - present, brokeragesPresent, fundsPresent, quorum };
  }, [rows, meeting?.totalMembers]);

  // Quorum is a majority (50% + 1) — strictly more than half present.
  const quorumMet = stats.total > 0 && stats.present * 2 > stats.total;

  return (
    <ReportShell>
      <div className="mx-auto max-w-[86.4rem] space-y-6">
        {/* System title banner */}
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

        {/* Card 1 — report header: clock, title, meeting, live */}
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-between gap-6">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {t('pageTitleAttendanceReport', { defaultValue: 'Attendance Report' })}
              </h1>
              <ReportClock size="text-3xl md:text-4xl" className="text-foreground" />
            </div>
            {meeting && (
              <div className="mt-5 flex flex-col items-center gap-3 text-center">
                <p className="text-3xl md:text-4xl text-foreground" style={{ unicodeBidi: 'plaintext' }}>
                  {meeting.title}
                </p>
                <Badge variant="success" appearance="light" className="animate-pulse text-3xl md:text-4xl">
                  ● {t('resultsLive', { defaultValue: 'Live — updating every 5s' })}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2 — breakdown + pie chart */}
        <Card>
          <CardContent className="py-8">
            {!meeting ? (
              <div className="py-8 text-center text-3xl md:text-4xl text-muted-foreground">
                {t('reportNoMeeting', { defaultValue: 'No meeting to report on yet.' })}
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-col items-center gap-1 text-center">
                  <CardTitle className="text-3xl md:text-4xl">
                    {t('breakdownTitle', { defaultValue: 'Attendance Breakdown' })}
                  </CardTitle>
                  <div className="flex items-center justify-center gap-6 text-muted-foreground text-3xl md:text-4xl">
                    <span>
                      {t('reportPresent', { defaultValue: 'Present' })}: {stats.present} / {stats.total}
                    </span>
                    {quorumMet ? (
                      <Badge variant="success" appearance="light" className="text-3xl md:text-4xl">
                        {t('quorumMet', { defaultValue: 'Quorum met (> 50%)' })}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" appearance="light" className="text-3xl md:text-4xl">
                        {t('quorumNotMet', { defaultValue: 'Quorum not met (≤ 50%)' })}
                      </Badge>
                    )}
                  </div>
                </div>
                <AttendancePie
                  brokeragesPresent={stats.brokeragesPresent}
                  fundsPresent={stats.fundsPresent}
                  absent={stats.absent}
                  quorumPercent={stats.quorum}
                  met={quorumMet}
                  height={640}
                  labels={{
                    brokerage: t('reportBrokeragesPresent', { defaultValue: 'Brokerages Present' }),
                    fund: t('reportFundsPresent', { defaultValue: 'Funds Present' }),
                    absent: t('reportAbsent', { defaultValue: 'Absent' }),
                    quorum: t('reportQuorum', { defaultValue: 'Quorum' }),
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ReportShell>
  );
}

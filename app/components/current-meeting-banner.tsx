'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import type { MeetingViewDto } from '@/services/general-meeting-api';

/**
 * Read-only current-meeting indicator for the operational pages (attendance,
 * elections). Shows which meeting is active and its Open/Closed status, with NO
 * controls — the meeting lifecycle (start / close / edit / delete / set-current)
 * lives on the Meeting Management page.
 */
export function CurrentMeetingBanner({ meeting }: { meeting: MeetingViewDto | null }) {
  const { t } = useTranslation('general-meeting');
  const closed = meeting?.status === 'Closed';
  return (
    <div className="flex flex-wrap items-center gap-2 px-1 text-sm">
      <span className="text-muted-foreground">
        {t('currentMeeting', { defaultValue: 'Current meeting' })}:
      </span>
      {meeting ? (
        <>
          <span className="font-medium" style={{ unicodeBidi: 'plaintext' }}>
            {meeting.title}
          </span>
          <Badge variant={closed ? 'secondary' : 'success'} appearance="light">
            {closed
              ? t('statusClosed', { defaultValue: 'Closed' })
              : t('statusOpen', { defaultValue: 'Open' })}
          </Badge>
        </>
      ) : (
        <Badge variant="secondary">{t('noActiveMeeting', { defaultValue: 'No active meeting' })}</Badge>
      )}
    </div>
  );
}

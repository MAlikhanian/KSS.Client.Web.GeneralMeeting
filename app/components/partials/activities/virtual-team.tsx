'use client';

import { ZoneLink } from '@/app/components/zone-link';

import { BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';
import { useTranslation } from '@/hooks/useTranslation';

const ActivitiesVirtualTeam = () => {
  const { t } = useTranslation();
  return (
    <TimelineItem icon={BadgeCheck} line={false}>
      <div className="flex flex-col">
        <div className="text-sm font-medium text-foreground">
          {t('common.activities.virtualTeam.text')}{' '}
          <Button mode="link" asChild>
            <ZoneLink href="/public-profile/profiles/creator">
              {t('common.activities.virtualTeam.linkText')}
            </ZoneLink>
          </Button>
          {t('common.activities.virtualTeam.suffix')}
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {t('common.activities.virtualTeam.timestamp')}
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesVirtualTeam };

'use client';

import { ZoneLink } from '@/app/components/zone-link';

import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';
import { useTranslation } from '@/hooks/useTranslation';

const ActivitiesFollowersMilestone = () => {
  const { t } = useTranslation();
  return (
    <TimelineItem icon={Coffee} line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-mono">
          {t('common.activities.milestone.text')}{' '}
          <Button mode="link" asChild>
            <ZoneLink href="/public-profile/profiles/feeds">{t('common.activities.milestone.followers')}</ZoneLink>
          </Button>{' '}
          {t('common.activities.milestone.suffix')}
        </div>
        <span className="text-xs text-secondary-foreground">
          {t('common.activities.milestone.timestamp')}
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesFollowersMilestone };

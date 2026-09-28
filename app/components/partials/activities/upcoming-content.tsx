'use client';

import { ZoneLink } from '@/app/components/zone-link';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';
import { useTranslation } from '@/hooks/useTranslation';

const ActivitiesUpcomingContent = () => {
  const { t } = useTranslation();
  return (
    <TimelineItem icon={Share2} line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-gray-800">
          {t('common.activities.upcomingContent.text')}{' '}
          <Button mode="link" asChild>
            <ZoneLink href="/public-profile/profiles/blogger">
              {t('common.activities.upcomingContent.linkText')}
            </ZoneLink>
          </Button>
        </div>
        <span className="text-xs text-gray-600">{t('common.activities.upcomingContent.timestamp')}</span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesUpcomingContent };

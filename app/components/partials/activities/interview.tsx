'use client';

import { ZoneLink } from '@/app/components/zone-link';

import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';
import { useTranslation } from '@/hooks/useTranslation';

const ActivitiesInterview = () => {
  const { t } = useTranslation();
  return (
    <TimelineItem icon={LogIn} line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-foreground">
          {t('common.activities.interview.text')}{' '}
          <Button mode="link" asChild>
            <ZoneLink href="/public-profile/profiles/blogger">
              {t('common.activities.interview.linkText')}
            </ZoneLink>
          </Button>
        </div>
        <span className="text-xs text-secondary-foreground">
          {t('common.activities.interview.timestamp')}
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesInterview };

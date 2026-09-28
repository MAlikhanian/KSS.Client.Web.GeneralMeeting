'use client';

import { ZoneLink } from '@/app/components/zone-link';

import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';
import { useTranslation } from '@/hooks/useTranslation';

const ActivitiesNewArticle = () => {
  const { t } = useTranslation();
  return (
    <TimelineItem icon={Users} line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-foreground">
          {t('common.activities.newArticle.text')}{' '}
          <Button mode="link" asChild>
            <ZoneLink href="/public-profile/profiles/blogger">
              {t('common.activities.newArticle.articleTitle')}
            </ZoneLink>
          </Button>
        </div>
        <span className="text-xs text-secondary-foreground">
          {t('common.activities.newArticle.timestamp')}
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesNewArticle };

'use client';

import { ZoneLink } from '@/app/components/zone-link';

import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';
import { useTranslation } from '@/hooks/useTranslation';

const ActivitiesAnniversary = () => {
  const { t } = useTranslation();
  return (
    <TimelineItem icon={Trophy} line={false} removeSpace={true}>
      <div className="flex flex-col">
        <div className="text-sm text-foreground">
          {t('common.activities.anniversary.text')}{' '}
          <Button mode="link" asChild>
            <ZoneLink href="/public-profile/profiles/nft">{t('common.activities.anniversary.linkText')}</ZoneLink>
          </Button>{' '}
          {t('common.activities.anniversary.suffix')}
        </div>
        <span className="text-xs text-secondary-foreground">
          {t('common.activities.anniversary.timestamp')}
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesAnniversary };

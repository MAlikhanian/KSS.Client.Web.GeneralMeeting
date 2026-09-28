'use client';

import { ChartSpline } from 'lucide-react';
import { TimelineItem } from './timeline-item';
import { useTranslation } from '@/hooks/useTranslation';

const ActivitiesDesignerWelcome = () => {
  const { t } = useTranslation();
  return (
    <TimelineItem icon={ChartSpline} line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-foreground">
          {t('common.activities.designerWelcome.text')}
        </div>
        <span className="text-xs text-secondary-foreground">
          {t('common.activities.designerWelcome.timestamp')}
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesDesignerWelcome };

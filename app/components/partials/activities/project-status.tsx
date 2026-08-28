'use client';

import { Rocket } from 'lucide-react';
import { TimelineItem } from './timeline-item';
import { useTranslation } from '@/hooks/useTranslation';

const ActivitiesProjectStatus = () => {
  const { t } = useTranslation();
  return (
    <TimelineItem icon={Rocket} line={false}>
      <div className="flex flex-col">
        <div className="text-sm text-mono">
          {t('common.activities.projectStatus.text')}
        </div>
        <span className="text-xs text-secondary-foreground">
          {t('common.activities.projectStatus.timestamp')}
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesProjectStatus };

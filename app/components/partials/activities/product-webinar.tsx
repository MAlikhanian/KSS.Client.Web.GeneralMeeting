'use client';

import { ZoneLink } from '@/app/components/zone-link';

import { CalendarCheck2, SquareDashedBottomCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AvatarGroup } from '../common/avatar-group';
import { TimelineItem } from './timeline-item';
import { useTranslation } from '@/hooks/useTranslation';

const ActivitiesProductWebinar = () => {
  const { t } = useTranslation();
  return (
    <TimelineItem icon={CalendarCheck2} line={true}>
      <div className="flex flex-col pb-2.5">
        <span className="text-sm text-foreground">
          {t('common.activities.productWebinar.text')}
        </span>
        <span className="text-xs text-secondary-foreground">
          {t('common.activities.productWebinar.timestamp')}
        </span>
      </div>
      <Card className="shadow-none p-4">
        <div className="flex flex-wrap gap-2.5">
          <SquareDashedBottomCode
            size={20}
            className="text-lg text-violet-500"
          />
          <div className="flex flex-col gap-5 grow">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-medium text-mono cursor-pointer hover:text-primary mb-px">
                  {t('common.activities.productWebinar.title')}
                </span>
                <span className="text-xs text-secondary-foreground">
                  {t('common.activities.productWebinar.description')}
                </span>
              </div>
              <Button mode="link" underlined="dashed">
                <ZoneLink href="/account/members/teams">{t('common.activities.productWebinar.view')}</ZoneLink>
              </Button>
            </div>
            <div className="flex flex-wrap gap-7.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-secondary-foreground">
                  {t('common.activities.productWebinar.code')}:
                </span>
                <span className="text-sm text-primary">#leaderdev-1</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-secondary-foreground">
                  {t('common.activities.productWebinar.progress')}:
                </span>
                <Progress
                  value={80}
                  indicatorClassName="bg-green-500 min-w-[120px]"
                  className="h-1"
                />
              </div>
              <div className="flex items-center gap-1.5 lg:min-w-24 shrink-0 max-w-auto">
                <span className="text-sm text-secondary-foreground">
                  {t('common.activities.productWebinar.guests')}:
                </span>
                <AvatarGroup
                  size="size-7"
                  group={[
                    { filename: '300-4.png' },
                    { filename: '300-1.png' },
                    { filename: '300-2.png' },
                    {
                      fallback: '+24',
                      variant:
                        'text-primary-foreground ring-background bg-primary',
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </TimelineItem>
  );
};

export { ActivitiesProductWebinar };

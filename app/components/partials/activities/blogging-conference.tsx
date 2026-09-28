'use client';

import { ZoneLink } from '@/app/components/zone-link';

import { ReactNode } from 'react';
import { Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TimelineItem } from './timeline-item';
import { useTranslation } from '@/hooks/useTranslation';

interface IBloggingConferenceProps {
  heading?: string;
  datetime?: string;
  image?: ReactNode;
  title?: string;
}

const ActivitiesBloggingConference = ({
  heading,
  datetime,
  image,
  title,
}: IBloggingConferenceProps) => {
  const { t } = useTranslation();
  return (
    <TimelineItem icon={Printer} line={true}>
      <div className="flex flex-col pb-2.5">
        <span className="text-sm text-foreground">
          {heading ?? t('common.activities.bloggingConference.heading')}
        </span>
        <span className="text-xs text-secondary-foreground">
          {datetime ?? t('common.activities.bloggingConference.timestamp')}
        </span>
      </div>
      <Card className="shadow-none">
        <CardContent className="lg:py-4">
          <div className="flex justify-center py-4">{image}</div>
          <div className="flex flex-col gap-1">
            <div className="text-base font-medium text-mono text-center">
              {title ?? t('common.activities.bloggingConference.title')}
            </div>
            <div className="flex items-center justify-center gap-1">
              <Button mode="link" asChild>
                <ZoneLink href="/public-profile/profiles/company">
                  {t('common.activities.bloggingConference.release')}
                </ZoneLink>
              </Button>
              <span className="text-sm text-secondary-foreground me-2">
                {t('common.activities.bloggingConference.campaign')}
              </span>
              <Badge size="md" variant="success" appearance="light">
                {t('common.activities.bloggingConference.public')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </TimelineItem>
  );
};

export { ActivitiesBloggingConference, type IBloggingConferenceProps };

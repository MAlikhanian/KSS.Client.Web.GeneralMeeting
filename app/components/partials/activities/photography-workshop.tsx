'use client';

import Link from 'next/link';
import { SquareDashedBottomCode } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TimelineItem } from './timeline-item';
import { useTranslation } from '@/hooks/useTranslation';

const ActivitiesPhotographyWorkshop = () => {
  const { t } = useTranslation();
  return (
    <TimelineItem icon={SquareDashedBottomCode} line={true}>
      <div className="flex flex-col pb-2.5">
        <span className="text-sm text-foreground">
          {t('common.activities.photographyWorkshop.text')}
        </span>
        <span className="text-xs text-secondary-foreground">
          {t('common.activities.photographyWorkshop.timestamp')}
        </span>
      </div>
      <Card className="shadow-none">
        <CardContent>
          <div className="grid gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex items-center gap-5 shrink-0">
                <div className="border border-orange-200 rounded-lg  max-h-20">
                  <div className="flex items-center justify-center border-b border-b-orange-200 bg-orange-50 dark:border-orange-950 dark:bg-orange-950/30 rounded-t-lg">
                    <span className="text-sm text-orange-400 font-medium p-2">
                      {t('common.activities.photographyWorkshop.month')}
                    </span>
                  </div>
                  <div className="flex items-center justify-center size-12">
                    <span className="font-medium text-foreground text-xl tracking-tight">
                      {t('common.activities.photographyWorkshop.day')}
                    </span>
                  </div>
                </div>
                <img
                  src={toAbsoluteUrl('/media/images/600x400/8.jpg')}
                  className="rounded-lg max-h-20 max-w-full"
                  alt="image"
                />
              </div>
              <div className="flex flex-col items-start gap-2">
                <Button
                  mode="link"
                  asChild
                  className="text-xs text-orange-400 leading-[14px] hover:text-primary-active mb-px"
                >
                  <Link href="#">{t('common.activities.photographyWorkshop.title')}</Link>
                </Button>
                <Button
                  mode="link"
                  asChild
                  className="text-base font-medium hover:text-primary text-mono leading-4"
                >
                  <Link href="#">{t('common.activities.photographyWorkshop.title')}</Link>
                </Button>
                <p className="text-xs text-foreground leading-[22px]">
                  {t('common.activities.photographyWorkshop.description')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TimelineItem>
  );
};

export { ActivitiesPhotographyWorkshop };

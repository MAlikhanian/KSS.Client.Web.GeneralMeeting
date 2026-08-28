'use client';

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function NotificationsSheet({ trigger }: { trigger: ReactNode }) {
  const { t } = useTranslation();

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="p-0 gap-0 sm:w-[500px] sm:max-w-none inset-5 start-auto h-auto rounded-lg p-0 sm:max-w-none [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="mb-0">
          <SheetTitle className="p-3">
            {t('topbar.notifications.title')}
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="p-0">
          <ScrollArea className="h-[calc(100vh-10.5rem)]">
            <Tabs defaultValue="all" className="w-full relative">
              <TabsList variant="line" className="w-full px-5 mb-5">
                <TabsTrigger value="all">{t('topbar.notifications.tabs.all')}</TabsTrigger>
                <TabsTrigger value="inbox">{t('topbar.notifications.tabs.inbox')}</TabsTrigger>
                <TabsTrigger value="team">{t('topbar.notifications.tabs.team')}</TabsTrigger>
                <TabsTrigger value="following">{t('topbar.notifications.tabs.following')}</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0" />
              <TabsContent value="inbox" className="mt-0" />
              <TabsContent value="team" className="mt-0" />
              <TabsContent value="following" className="mt-0" />
            </Tabs>
          </ScrollArea>
        </SheetBody>
        <SheetFooter className="border-t border-border p-5 grid grid-cols-2 gap-2.5">
          <Button variant="outline" disabled>{t('topbar.notifications.archiveAll')}</Button>
          <Button variant="outline" disabled>{t('topbar.notifications.markAllAsRead')}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

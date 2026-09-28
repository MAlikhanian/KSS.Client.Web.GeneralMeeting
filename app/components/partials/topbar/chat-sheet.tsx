'use client';

import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCheck, Upload } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Message {
  avatar: string;
  text: string;
  time: string;
  in?: boolean;
  out?: boolean;
  read?: boolean;
}

export function ChatSheet({ trigger }: { trigger: ReactNode }) {
  const { t } = useTranslation();
  const [emailInput, setEmailInput] = useState('');

  const messages: Message[] = [];

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="p-0 gap-0 sm:w-[450px] sm:max-w-none inset-5 start-auto h-auto rounded-lg p-0 sm:max-w-none [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader>
          <div className="flex items-center justify-between p-3 border-b border-border">
            <SheetTitle>{t('topbar.chat.title')}</SheetTitle>
          </div>
        </SheetHeader>
        <SheetBody className="scrollable-y-auto grow space-y-3.5">
          {messages.map((message, index) =>
            message.out ? (
              <div
                key={index}
                className="flex items-end justify-end gap-3 px-5"
              >
                <div className="flex flex-col gap-1">
                  <div
                    className="bg-primary text-primary-foreground text-sm font-medium p-3 rounded-lg shadow-xs"
                    dangerouslySetInnerHTML={{ __html: message.text }}
                  />
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-xs text-secondary-foreground">
                      {message.time}
                    </span>
                    <CheckCheck
                      className={cn(
                        'w-4 h-4',
                        message.read
                          ? 'text-green-500'
                          : 'text-muted-foreground',
                      )}
                    />
                  </div>
                </div>
                <div className="relative">
                  <Avatar className="size-9">
                    <AvatarImage
                      src={toAbsoluteUrl('/media/avatars//300-2.png')}
                      alt=""
                    />
                    <AvatarFallback>CH</AvatarFallback>
                    <AvatarIndicator className="-end-2 -bottom-2">
                      <AvatarStatus variant="online" className="size-2.5" />
                    </AvatarIndicator>
                  </Avatar>
                </div>
              </div>
            ) : message.in ? (
              <div key={index} className="flex items-end gap-3 px-5">
                <Avatar className="size-9">
                  <AvatarImage src={toAbsoluteUrl(message.avatar)} alt="" />
                  <AvatarFallback>CH</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <div
                    className="bg-accent/50 text-secondary-foreground text-sm font-medium p-3 rounded-lg shadow-xs"
                    dangerouslySetInnerHTML={{ __html: message.text }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {message.time}
                  </span>
                </div>
              </div>
            ) : null,
          )}
        </SheetBody>
        <SheetFooter className="block p-0 sm:space-x-0">
          <div className="p-5 flex items-center gap-2 relative">
            <img
              src={toAbsoluteUrl('/media/avatars/300-2.png')}
              className="w-8 h-8 rounded-full absolute left-7 top-1/2 -translate-y-1/2"
              alt=""
            />
            <Input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={t('topbar.chat.writeMessage')}
              className="w-full ps-12 pe-24 py-4 h-auto"
            />
            <div className="absolute end-7 top-1/2 -translate-y-1/2 flex gap-2">
              <Button size="sm" variant="ghost" mode="icon">
                <Upload className="size-4!" />
              </Button>
              <Button size="sm" variant="mono">
                {t('topbar.chat.send')}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

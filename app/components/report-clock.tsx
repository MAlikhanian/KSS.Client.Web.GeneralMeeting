'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { useLanguage } from '@/providers/i18n-provider';

/** Live clock + today's date for the report pages (updates every second). */
export function ReportClock({ size, className }: { size?: string; className?: string }) {
  const { language } = useLanguage();
  const locale = language.code === 'en' ? 'en-US' : 'fa-IR';
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return <div className="h-6" />;

  const date = now.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 ${className ?? 'text-muted-foreground'} ${size ?? ''}`}>
      <span className="flex items-center gap-1.5">
        <CalendarDays className="size-4" />
        <span style={{ unicodeBidi: 'plaintext' }}>{date}</span>
      </span>
      <span className={`flex items-center gap-1.5 font-mono tabular-nums ${size ?? 'text-lg'}`}>
        <Clock className="size-4" />
        <span style={{ unicodeBidi: 'plaintext' }}>{time}</span>
      </span>
    </div>
  );
}

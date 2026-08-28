'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Clean, projector-friendly report shell. Renders as a full-screen fixed overlay
 * that covers the app sidebar/menu (no template changes), with a small Back
 * button pinned to the bottom-left of every report page.
 */
export function ReportShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { t } = useTranslation('general-meeting');

  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-background">
      <div className="min-h-full p-6 md:p-10">{children}</div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="fixed bottom-4 left-4 z-[101] shadow-lg"
      >
        <ArrowLeft className="size-4" />
        {t('back', { defaultValue: 'Back' })}
      </Button>
    </div>
  );
}

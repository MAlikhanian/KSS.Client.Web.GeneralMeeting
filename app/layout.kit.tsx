import { ReactNode } from 'react';
import { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/providers/auth-provider';
import { I18nProvider } from '@/providers/i18n-provider';
import { ModulesProvider } from '@/providers/modules-provider';
import { QueryProvider } from '@/providers/query-provider';
import { SettingsProvider } from '@/providers/settings-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { TooltipsProvider } from '@/providers/tooltips-provider';
import { Toaster } from '@/components/ui/sonner';
import { AppShell } from './app-shell';

import '@/css/fonts.css';
import '@/css/styles.css';
import '@/components/keenicons/assets/styles.css';

// Server component: metadata cannot be exported from a client file.
//
// This is the Shell's root layout and its (protected) layout merged. A domain
// app has no public area — every route in it is behind the session — so the
// two-layer split the Shell needs does not apply here.
export const metadata: Metadata = {
  title: {
    template: '%s | General Meeting',
    default: 'General Meeting',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          'antialiased flex h-full text-base text-foreground bg-background font-vazirmatn',
        )}
      >
        <QueryProvider>
          <AuthProvider>
            <SettingsProvider>
              <ThemeProvider>
                <I18nProvider>
                  <TooltipsProvider>
                    <ModulesProvider>
                      <AppShell>{children}</AppShell>
                      <Toaster />
                    </ModulesProvider>
                  </TooltipsProvider>
                </I18nProvider>
              </ThemeProvider>
            </SettingsProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

import { ReactNode } from 'react';
import { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/providers/auth-provider';
import { I18nProvider } from '@/providers/i18n-provider';
import { headers } from 'next/headers';
import { resolveTenant, tenantAssets } from '@/lib/tenants';
import { TenantProvider } from '@/providers/tenant-provider';
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

// Per-tenant tab icon and title, resolved from x-kss-host at REQUEST time —
// the same reason branding is a config change and not a rebuild. A host with
// no TENANTS entry falls back to this zone's own title and the stock favicon,
// so an unbranded host looks exactly as it did before tenant branding existed.
export async function generateMetadata(): Promise<Metadata> {
  const assets = tenantAssets(resolveTenant(await requestHost()));
  const name = assets.name ?? 'General Meeting';

  return {
    title: {
      template: `%s | ${name}`,
      default: name, // a default is required when creating a template
    },
    icons: { icon: assets.favicon },
  };
}

/**
 * The tenant hostname this request arrived on.
 *
 * x-kss-host ONLY, and deliberately no fallback. The Shell's middleware stamps
 * it as an unconditional overwrite from the real Host header; see the rule
 * written at that stamp. A zone must never read x-forwarded-host or any other
 * client-settable header, because the resolved tenant carries companyId, which
 * decides the x-company-id cookie.
 *
 * CONSEQUENCE, AND IT IS INTENDED: opening this app DIRECTLY on its own dev port
 * carries no stamp, so it renders the default branding - never a tenant logo or
 * tenant footer. Tenant branding is only visible through the Shell (manager
 * option 1 or 12), which stamps the header in dev exactly as in cluster. Do NOT
 * "fix" that by adding a fallback: putting a client-settable source back into
 * tenant resolution is the whole thing this prevents.
 */
async function requestHost(): Promise<string | null> {
  const headerList = await headers();
  return headerList.get('x-kss-host');
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Resolved once per request and handed to every branded surface through
  // context. Components must not re-read TENANTS themselves.
  const assets = tenantAssets(resolveTenant(await requestHost()));
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
                      <TenantProvider assets={assets}>
                        <AppShell>{children}</AppShell>
                        <Toaster />
                      </TenantProvider>
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

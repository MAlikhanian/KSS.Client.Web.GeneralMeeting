'use client';

import { ZoneLink } from '@/app/components/zone-link';

import { ChevronFirst } from 'lucide-react';
import { useTenant } from '@/providers/tenant-provider';
import { cn } from '@/lib/utils';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';

export function SidebarHeader() {
  const { settings, storeOption } = useSettings();
  // Tenant artwork, resolved once per request in app/layout.tsx from x-kss-host.
  // NOT passed through toAbsoluteUrl(): that prepends this zone's
  // NEXT_PUBLIC_BASE_PATH, and tenant asset paths are root-relative on purpose so
  // whichever host the visitor is on serves them. See lib/tenants.ts.
  const tenant = useTenant();

  const handleToggleClick = () => {
    storeOption(
      'layouts.demo1.sidebarCollapse',
      !settings.layouts.demo1.sidebarCollapse,
    );
  };

  return (
    <div className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0">
      <ZoneLink href="/">
        <div className="dark:hidden">
          <img
            src={tenant.logo}
            className="default-logo h-[22px] max-w-none"
            alt="Default Logo"
          />
          <img
            src={tenant.logoMini}
            className="small-logo h-[22px] max-w-none"
            alt="Mini Logo"
          />
        </div>
        <div className="hidden dark:block">
          <img
            src={tenant.logoDark}
            className="default-logo h-[22px] max-w-none"
            alt="Default Dark Logo"
          />
          <img
            src={tenant.logoMini}
            className="small-logo h-[22px] max-w-none"
            alt="Mini Logo"
          />
        </div>
      </ZoneLink>
      <Button
        onClick={handleToggleClick}
        size="sm"
        mode="icon"
        variant="outline"
        className={cn(
          'size-7 absolute start-full top-2/4 rtl:translate-x-2/4 -translate-x-2/4 -translate-y-2/4',
          settings.layouts.demo1.sidebarCollapse
            ? 'ltr:rotate-180'
            : 'rtl:rotate-180',
        )}
      >
        <ChevronFirst className="size-4!" />
      </Button>
    </div>
  );
}

'use client';

import { Fragment, ReactNode } from 'react';
import { ZoneLink } from '@/app/components/zone-link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { getTranslatedMenuSidebar } from '@/config/menu.config';
import { MenuItem } from '@/config/types';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';

export interface ToolbarHeadingProps {
  title?: string | ReactNode;
  description?: string | ReactNode;
}

function Toolbar({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-5 pb-7.5">
      {children}
    </div>
  );
}

function ToolbarActions({ children }: { children?: ReactNode }) {
  return <div className="flex items-center gap-2.5">{children}</div>;
}

function ToolbarBreadcrumbs() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { getBreadcrumb, isActive } = useMenu(pathname);
  const translatedMenu = getTranslatedMenuSidebar(t);
  const items: MenuItem[] = getBreadcrumb(translatedMenu);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex [.header_&]:below-lg:hidden items-center gap-1.25 text-xs lg:text-sm font-medium mb-2.5 lg:mb-0">
      <div className="breadcrumb flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const active = item.path ? isActive(item.path) : false;

          return (
            <Fragment key={index}>
              {item.path ? (
                <ZoneLink
                  href={item.path}
                  className={cn(
                    'flex items-center gap-1',
                    active
                      ? 'text-mono'
                      : 'text-muted-foreground hover:text-primary',
                  )}
                >
                  {item.title}
                </ZoneLink>
              ) : (
                <span
                  className={cn(isLast ? 'text-mono' : 'text-muted-foreground')}
                >
                  {item.title}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="size-3.5 muted-foreground" />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ToolbarHeading({ title = '', description }: ToolbarHeadingProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { getCurrentItem } = useMenu(pathname);
  const translatedMenu = getTranslatedMenuSidebar(t);
  const item = getCurrentItem(translatedMenu);

  return (
    <div className="flex flex-col justify-center gap-2">
      <h1 className="text-xl font-medium leading-none text-mono">
        {title || item?.title || 'Untitled'}
      </h1>
      {description && (
        <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
          {description}
        </div>
      )}
    </div>
  );
}

export { Toolbar, ToolbarActions, ToolbarBreadcrumbs, ToolbarHeading };

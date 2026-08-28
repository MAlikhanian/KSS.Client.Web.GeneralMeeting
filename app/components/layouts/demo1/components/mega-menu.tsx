'use client';

import { ZoneLink } from '@/app/components/zone-link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { getTranslatedMenuMega } from '@/config/menu.config';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

export function MegaMenu() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isActive } = useMenu(pathname);
  const translatedMegaMenu = getTranslatedMenuMega(t);
  const homeItem = translatedMegaMenu[0];
  const siteItem = translatedMegaMenu[1];
  const sazeshItem = translatedMegaMenu[2];
  const lmsItem = translatedMegaMenu[3];

  const linkClass = `
    text-sm text-secondary-foreground font-medium 
    hover:text-primary hover:bg-transparent 
    focus:text-primary focus:bg-transparent 
    data-[active=true]:text-primary data-[active=true]:bg-transparent 
    data-[state=open]:text-primary data-[state=open]:bg-transparent
  `;

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-0">
        {/* Home Item */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <ZoneLink
              href={homeItem.path || '/'}
              className={cn(linkClass)}
              data-active={isActive(homeItem.path) || undefined}
            >
              {homeItem.title}
            </ZoneLink>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Home Item */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <ZoneLink
              href={siteItem.path || '/'}
              className={cn(linkClass)}
              data-active={isActive(siteItem.path) || undefined}
            >
              {siteItem.title}
            </ZoneLink>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Home Item */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <ZoneLink
              href={sazeshItem.path || '/'}
              className={cn(linkClass)}
              data-active={isActive(sazeshItem.path) || undefined}
            >
              {sazeshItem.title}
            </ZoneLink>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Home Item */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <ZoneLink
              href={lmsItem.path || '/'}
              className={cn(linkClass)}
              data-active={isActive(lmsItem.path) || undefined}
            >
              {lmsItem.title}
            </ZoneLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

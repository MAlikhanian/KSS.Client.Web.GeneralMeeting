import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import {
  getTranslatedMenuSidebar,
  getTranslatedMenuSidebarCustom,
  getTranslatedMenuSidebarCompact,
  getTranslatedMenuMega,
  getTranslatedMenuMegaMobile,
  getTranslatedMenuHelp,
  getTranslatedMenuRoot,
} from '@/config/menu.config';
import { filterMenuByRole } from '@/lib/menu-translation-utils';

/**
 * Hook to get translated menu configurations, filtered by current user roles/permissions from Auth service.
 * Usage: const { menuSidebar, menuRoot, ... } = useTranslatedMenu();
 */
export function useTranslatedMenu() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const userRoles = session?.user?.roles ?? [];
  const userPermissions = session?.user?.permissions ?? [];

  return {
    menuSidebar: filterMenuByRole(getTranslatedMenuSidebar(t), userRoles, userPermissions),
    menuSidebarCustom: getTranslatedMenuSidebarCustom(t),
    menuSidebarCompact: getTranslatedMenuSidebarCompact(t),
    menuMega: getTranslatedMenuMega(t),
    menuMegaMobile: getTranslatedMenuMegaMobile(t),
    menuHelp: getTranslatedMenuHelp(t),
    menuRoot: filterMenuByRole(getTranslatedMenuRoot(t), userRoles, userPermissions),
  };
}

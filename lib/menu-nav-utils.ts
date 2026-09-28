import type { MenuConfig, MenuItem } from '@/config/types';

/**
 * Find, anywhere in the (translated, role-filtered) menu tree, the group whose
 * direct children include a path starting with `prefix`, and return those
 * children — the tab set for a section's secondary navbar.
 *
 * This replaces brittle positional indexing (e.g. menuSidebar[2].children[0])
 * and title-string matching: it's robust to menu reordering, nesting depth, and
 * translation, because it keys off the children's `path`. Because the input is
 * the already role/permission-filtered `menuSidebar` from useTranslatedMenu, the
 * returned children are automatically permission-gated and match the sidebar.
 */
export function navItemsForPathPrefix(
  items: MenuConfig | undefined,
  prefix: string,
): MenuItem[] | undefined {
  for (const item of items ?? []) {
    if (item.children?.some((c) => c.path?.startsWith(prefix))) {
      return item.children;
    }
    const nested = navItemsForPathPrefix(item.children, prefix);
    if (nested) return nested;
  }
  return undefined;
}

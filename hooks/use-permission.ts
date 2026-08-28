'use client';

import { useSession } from 'next-auth/react';

/**
 * Client-side role/permission checks, sourced from the next-auth session
 * (session.user.permissions / .roles — populated from the Auth service JWT).
 * Mirrors the menu gating in lib/menu-translation-utils.ts. UI convenience
 * only; the backend enforces the same permissions on every request.
 */
export function usePermission() {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? [];
  const roles = session?.user?.roles ?? [];

  const hasPermission = (required: string[]): boolean =>
    required.some((p) => permissions.includes(p));

  const hasRole = (required: string[]): boolean =>
    required.some((r) => roles.includes(r));

  const hasAny = (requiredPermissions: string[], requiredRoles: string[]): boolean =>
    hasPermission(requiredPermissions) || hasRole(requiredRoles);

  return { hasPermission, hasRole, hasAny, permissions, roles };
}

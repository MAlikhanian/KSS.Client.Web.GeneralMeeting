'use client';

import { createContext, useContext, ReactNode } from 'react';
import { tenantAssets, type TenantAssets } from '@/lib/tenants';

/**
 * Which tenant's branding this request is being served under.
 *
 * EVERY app needs this — the Shell and all twelve zones. Each is deployed once
 * behind several tenant hostnames, so the logo, favicon, sign-in banner and
 * footer cannot be decided at build time: the value comes from TENANTS at
 * REQUEST time, resolved in app/layout.tsx. Adding a tenant must stay a config
 * change, never a rebuild. Same pattern as ZonesProvider.
 *
 * (Until 2026-08-29 this said "Only the Shell needs this". That was true while
 * the Shell served every page; it stopped being true when the domains moved into
 * zones, and the result was that a tenant host showed its own logo on Shell
 * pages and the stock logo on every zone page.)
 *
 * WHERE THE HOST COMES FROM differs by app, and the difference is deliberate:
 *   Shell — reads the real Host header directly.
 *   Zone  — reads x-kss-host, which the Shell's middleware stamps on the rewrite.
 * A zone must never fall back to x-forwarded-host or any other client-settable
 * header; see the rule written at the stamp in the Shell's middleware.ts.
 *
 * The default is the fully-resolved stock artwork, so a component that renders
 * outside the provider (or on a host with no tenant entry) shows exactly what
 * the app showed before tenant branding existed.
 */
const TenantContext = createContext<TenantAssets>(tenantAssets(null));

export function TenantProvider({
  assets,
  children,
}: {
  assets: TenantAssets;
  children: ReactNode;
}) {
  return <TenantContext.Provider value={assets}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantAssets {
  return useContext(TenantContext);
}

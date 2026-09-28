'use client';

import { createContext, useContext, ReactNode } from 'react';

/**
 * Which first path segments are currently served by a SEPARATE zone app.
 *
 * Only the Shell needs this. A zone knows its own identity from
 * NEXT_PUBLIC_BASE_PATH, so anything outside that prefix is foreign to it by
 * definition. The Shell has no basePath, so it cannot tell its own /person
 * (which it still serves) from /spm (which it hands to another app) without
 * being told which slugs are live.
 *
 * The value comes from the Shell's ZONES env at REQUEST time, not build time —
 * adding a zone must stay a config change, never a rebuild. See the Shell's
 * app/layout.tsx.
 *
 * Default [] means "no zones", which makes ZoneLink behave exactly as plain
 * next/link. That is the correct default for every zone app, which never
 * renders this provider.
 */
const ZoneSlugsContext = createContext<string[]>([]);

export function ZonesProvider({
  slugs,
  children,
}: {
  slugs: string[];
  children: ReactNode;
}) {
  return (
    <ZoneSlugsContext.Provider value={slugs}>{children}</ZoneSlugsContext.Provider>
  );
}

export function useZoneSlugs(): string[] {
  return useContext(ZoneSlugsContext);
}

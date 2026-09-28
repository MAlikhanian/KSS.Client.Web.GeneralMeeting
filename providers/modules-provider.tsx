'use client';

import { ReactNode } from 'react';

/**
 * Kit version.
 *
 * In the Shell this provider wraps the app in the Metronic store-client cart
 * context (`StoreClientProvider` + `StoreClientWrapper`). A domain app has no
 * shop, and pulling that in would drag the whole store demo — its context, its
 * three sheets and their assets — into every business project.
 *
 * So here it is a pass-through. Keep it rather than deleting the provider, so
 * a domain app can mount its own cross-cutting providers in one known place
 * without touching `app/layout.tsx`.
 */
export function ModulesProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

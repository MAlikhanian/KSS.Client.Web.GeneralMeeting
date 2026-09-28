'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { ScreenLoader } from '@/components/common/screen-loader';
import { TokenExpiryGuard } from '@/components/common/token-expiry-guard';
import { CurrentCompanyProvider } from '@/providers/current-company-provider';
import { Demo1Layout } from '@/app/components/layouts/demo1/layout';

/**
 * Session guard + chrome for a domain app.
 *
 * The sign-in page lives ONLY in the Shell. A domain app must therefore send
 * the browser there with a full navigation:
 *
 *  - `router.push('/signin')` would resolve against this app's basePath and
 *    look for `/<domain>/signin`, which does not exist.
 *  - client-side routing cannot cross from one app to another anyway.
 *
 * Two guards below, both learned the hard way. Without them an unreachable
 * session endpoint produces an infinite redirect whose callbackUrl re-encodes
 * itself on every hop until the URL is thousands of characters long:
 *
 *  1. Never redirect when already heading to /signin. In a domain app that URL
 *     has no route, so Next renders not-found INSIDE this layout — which mounts
 *     this component again, still unauthenticated, and it redirects again.
 *  2. Redirect at most once per page load. `status` can settle to
 *     'unauthenticated' across more than one render.
 *
 * Running standalone (no Shell), /api/auth/session 404s and you land on one
 * dead /signin. That is expected: domain apps host no auth. Start the Shell and
 * sign in there.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const redirected = useRef(false);

  useEffect(() => {
    if (status !== 'unauthenticated') return;
    if (typeof window === 'undefined') return;
    if (redirected.current) return;

    const path = window.location.pathname;

    // Guard 1 - already at the Shell's sign-in; nothing left to do here.
    if (path === '/signin' || path.startsWith('/signin/')) return;

    redirected.current = true; // Guard 2

    const back = encodeURIComponent(path + window.location.search);
    window.location.href = `/signin?callbackUrl=${back}`;
  }, [status]);

  if (status === 'loading' || status === 'unauthenticated') {
    return <ScreenLoader />;
  }

  return session ? (
    <CurrentCompanyProvider>
      <TokenExpiryGuard />
      <Demo1Layout>{children}</Demo1Layout>
    </CurrentCompanyProvider>
  ) : null;
}

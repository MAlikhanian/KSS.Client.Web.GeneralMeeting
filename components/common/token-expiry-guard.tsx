'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';

/**
 * TokenExpiryGuard
 *
 * A global component that monitors the Auth service JWT token expiry.
 * When the token is expired (or about to expire within 60s),
 * it automatically signs the user out and redirects to the login page.
 *
 * It checks every 30 seconds and also when the browser tab regains focus.
 *
 * Place this inside the protected layout so it only runs for authenticated pages.
 */
export function TokenExpiryGuard() {
  const { data: session, status } = useSession();
  const isSigningOut = useRef(false);

  const checkTokenExpiry = useCallback(() => {
    if (status !== 'authenticated' || !session?.tokenExpires || isSigningOut.current) {
      return;
    }

    const expiresAt = new Date(session.tokenExpires).getTime();
    const now = Date.now();
    // Sign out 60 seconds before actual expiry to avoid mid-request failures
    const bufferMs = 60 * 1000;

    if (now >= expiresAt - bufferMs) {
      isSigningOut.current = true;
      signOut({ callbackUrl: '/signin', redirect: true });
    }
  }, [session, status]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    // Check immediately on mount
    checkTokenExpiry();

    // Check every 30 seconds
    const interval = setInterval(checkTokenExpiry, 30 * 1000);

    // Also check when the tab regains focus (user comes back after being away)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkTokenExpiry();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [status, checkTokenExpiry]);

  // This component renders nothing
  return null;
}

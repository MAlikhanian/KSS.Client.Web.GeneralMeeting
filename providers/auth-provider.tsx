'use client';

import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

interface AuthProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Kit version — the session lives in the SHELL, never in a domain app.
 *
 * The Shell's copy derives this from NEXT_PUBLIC_BASE_PATH. A domain app must
 * NOT: that would resolve to `/<domain>/api/auth`, and the app would try to own
 * the session, hosting its own NextAuth endpoints and issuing its own cookies.
 *
 * The Shell owns `/`, and the domain app is proxied onto the same origin, so
 * the Shell's endpoints are simply at `/api/auth` with no prefix.
 *
 * Server-side this matters far less: `getServerSession()` decrypts the cookie
 * locally and makes no HTTP call, so a domain app's BFF routes need only the
 * same NEXTAUTH_SECRET. This constant is for the client — refresh, signOut and
 * the session poll.
 */
const SHELL_AUTH_BASE_PATH = '/api/auth';

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session} basePath={SHELL_AUTH_BASE_PATH}>
      {children}
    </SessionProvider>
  );
}

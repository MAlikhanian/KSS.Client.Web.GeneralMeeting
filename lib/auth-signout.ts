/**
 * Sign out WITHOUT letting NextAuth choose the destination.
 *
 * This deployment serves every tenant hostname from one Shell, so NEXTAUTH_URL
 * is a single fixed origin (https://erp.seba.ir in production). NextAuth's
 * default `redirect` callback resolves every callbackUrl against that origin:
 * a relative '/signin' becomes `${NEXTAUTH_URL}/signin`, and an absolute URL on
 * any other origin is rejected and replaced by NEXTAUTH_URL itself. Either way a
 * user who signs out on spmoffice.ir lands on erp.seba.ir — another tenant's
 * brand. There is no `redirect` callback in auth-options.ts, so that default is
 * what runs.
 *
 * So the redirect is not handed to NextAuth at all. `redirect: false` clears the
 * session cookie and returns; the browser then resolves a ROOT-RELATIVE path
 * against whichever host the visitor is actually on. Same discipline, and the
 * same reason, as the root-relative tenant asset paths in lib/tenants.ts.
 *
 * Deliberately NOT fixed by widening NextAuth's redirect callback to accept
 * other hosts: that branch is its open-redirect guard, and every tenant host it
 * allowed would be one more thing to keep in step with TENANTS.
 *
 * NEXTAUTH_URL itself is correct and must stay one canonical value — it simply
 * must not be what decides where a signed-out user lands.
 */
export async function signOutToTenant(to = '/signin'): Promise<void> {
  if (typeof window === 'undefined') return;
  const { signOut } = await import('next-auth/react');
  await signOut({ redirect: false });
  window.location.href = to;
}

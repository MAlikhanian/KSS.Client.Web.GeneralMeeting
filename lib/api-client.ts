/**
 * Client-side API fetch wrapper that handles 401 errors
 * Redirects to login page when token expires
 *
 * Usage:
 *   import { apiClientFetch } from '@/lib/api-client';
 *   const response = await apiClientFetch('/api/users');
 */

export async function apiClientFetch(
  input: string | Request,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);

  // Handle 401 Unauthorized - token expired, redirect to login
  if (response.status === 401 && typeof window !== 'undefined') {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/signin', redirect: true });
    throw new Error('401 Unauthorized - session expired');
  }

  return response;
}

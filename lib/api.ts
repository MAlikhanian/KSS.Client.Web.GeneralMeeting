import { NextRequest } from 'next/server';

/**
 * apiFetch - universal fetch for dev/prod that prefixes API calls with the correct base URL
 * Handles 401 errors by redirecting to login page
 *
 * Usage:
 *   apiFetch('/users', { method: 'GET' })
 *   apiFetch('https://external.com/endpoint') // untouched
 */
export async function apiFetch(
  input: string | Request,
  init?: RequestInit,
): Promise<Response> {
  let url = input;

  // If input is a string and is a relative API path, prefix with base URL
  if (typeof input === 'string') {
    if (input.startsWith('/api/')) {
      // Remove leading slash to avoid double slashes
      url =
        process.env.NEXT_PUBLIC_BASE_PATH +
        (input.startsWith('/') ? input : '/' + input);
    }
  }
  // If input is a Request object, you could extend logic here if needed

  const response = await fetch(url as RequestInfo, init);

  // Handle 401 Unauthorized - token expired, redirect to login
  if (response.status === 401 && typeof window !== 'undefined') {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/signin', redirect: true });
  }

  return response;
}

export function getClientIP(request: NextRequest): string {
  // Cloudflare uses CF-Connecting-IP header
  // Fallback to other common headers
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    //|| request.socket.remoteAddress
    'unknown'
  );
}

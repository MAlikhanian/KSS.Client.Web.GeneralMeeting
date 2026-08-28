/** @type {import('next').NextConfig} */

// Every domain app owns one path prefix. `basePath` is what keeps two apps on
// the same origin from colliding: routes AND static assets are served under it,
// so this app's chunks live at /general-meeting/_next/* and can never overwrite the
// Shell's at /_next/*.
//
// It must match the ZONES key the Shell rewrites, and NEXT_PUBLIC_BASE_PATH in
// the environment — apiFetch() and toAbsoluteUrl() read that at runtime.

const SHELL_URL = process.env.SHELL_URL ?? 'http://localhost:3000';

const nextConfig = {
  basePath: '/general-meeting',
  output: 'standalone',
  images: {},

  async rewrites() {
    // DEV ONLY. In production every request reaches this app through the
    // Shell's middleware, so /api/auth/* never arrives here at all.
    if (process.env.NODE_ENV !== 'development') return [];

    // Opening http://localhost:3090 directly means NextAuth's client
    // calls /api/auth/session on THIS port. Nothing serves it — domain apps
    // host no auth endpoints — so Next returns its 404 HTML and next-auth
    // throws CLIENT_FETCH_ERROR: Unexpected token '<'.
    //
    // Forwarding to the Shell fixes it properly rather than hiding it: cookies
    // are NOT isolated by port, so the session cookie the Shell set on
    // localhost:3000 is sent to localhost:3090 too, and this rewrite
    // passes it upstream. You get the real session, signed in, standalone.
    //
    // `basePath: false` is required — without it the source would be matched as
    // /general-meeting/api/auth/*, which is not where next-auth is calling.
    return [
      {
        source: '/api/auth/:path*',
        destination: `${SHELL_URL}/api/auth/:path*`,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;

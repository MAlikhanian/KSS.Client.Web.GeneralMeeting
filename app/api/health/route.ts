import { NextResponse } from 'next/server';

/**
 * Liveness / readiness probe for this zone app.
 *
 * Deliberately has NO dependencies — no database, no backend call, no session.
 * Two reasons:
 *
 *  1. A probe that touches a backend kills the pod when the BACKEND is down.
 *     The app is not unhealthy in that case; its dependency is. Kubernetes
 *     would restart a perfectly good process in a loop and remove the only
 *     thing still able to render an error page.
 *
 *  2. It must answer without a session, or the kubelet (which carries no
 *     cookie) fails every check and the pod never becomes Ready.
 *
 * It also doubles as the zone-hop test. With basePath this is served at
 * /general-meeting/api/health, a path the Shell does not have — so a 200 there proves the
 * request genuinely reached THIS app rather than being answered by the Shell.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    app: 'general-meeting',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

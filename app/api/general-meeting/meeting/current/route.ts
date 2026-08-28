import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { apiErrorResponse } from '@/lib/api-error';
import { getCurrentMeeting } from '@/services/general-meeting-api';

// GET /api/general-meeting/meeting/current — the single IsCurrent meeting, or null
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    // The backend returns an empty body when no meeting is current; coerce the
    // resulting `undefined` to `null` so NextResponse.json can serialize it.
    const meeting = await getCurrentMeeting(session.accessToken);
    return NextResponse.json(meeting ?? null);
  } catch (error) {
    return apiErrorResponse(error, 'fetching current meeting');
  }
}

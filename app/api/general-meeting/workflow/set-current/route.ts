import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { apiErrorResponse } from '@/lib/api-error';
import { setCurrentMeeting } from '@/services/general-meeting-api';

// POST /api/general-meeting/workflow/set-current?meetingId=<guid>
// Makes an existing meeting the current/active one. The backend binds
// `Guid meetingId` from the query string.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const meetingId = new URL(req.url).searchParams.get('meetingId');
    if (!meetingId) {
      return NextResponse.json({ message: 'meetingId is required' }, { status: 400 });
    }
    await setCurrentMeeting(session.accessToken, meetingId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'setting current meeting');
  }
}

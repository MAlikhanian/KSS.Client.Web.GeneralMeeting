import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { apiErrorResponse } from '@/lib/api-error';
import { startNewMeeting } from '@/services/general-meeting-api';

// POST /api/general-meeting/workflow/start-new — create the Meeting row and
// move it into the attendance-taking stage. Body = StartMeetingDto. No
// meetingId — the backend creates one.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    return NextResponse.json(await startNewMeeting(session.accessToken, body));
  } catch (error) {
    return apiErrorResponse(error, 'starting new meeting');
  }
}

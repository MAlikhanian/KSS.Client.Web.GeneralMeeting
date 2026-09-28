import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { apiErrorResponse } from '@/lib/api-error';
import { closeAndTally } from '@/services/general-meeting-api';

// POST /api/general-meeting/workflow/close-and-tally?meetingId=<guid>
// The backend action binds `Guid meetingId` from the query string (no body),
// so this route reads meetingId from the incoming request's query string and
// forwards it the same way to /Api/MeetingElection/CloseAndTally.
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
    await closeAndTally(session.accessToken, meetingId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'closing and tallying meeting');
  }
}

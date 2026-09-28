import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { apiErrorResponse } from '@/lib/api-error';
import { castBallot } from '@/services/general-meeting-api';

// POST /api/general-meeting/workflow/cast-ballot?meetingId=<guid>
// The backend action binds `Guid meetingId` from the query string and the
// CastBallotDto from the body, so this route reads meetingId from the
// incoming request's query string and forwards the JSON body unchanged to
// /Api/MeetingElection/CastBallot.
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
    const body = await req.json();
    await castBallot(session.accessToken, meetingId, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'casting ballot');
  }
}

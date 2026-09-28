import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { apiErrorResponse } from '@/lib/api-error';
import { anonymousVote } from '@/services/general-meeting-api';

// POST /api/general-meeting/workflow/anonymous-vote?meetingId=<guid>&candidateId=<guid>&delta=<+1|-1>
// The backend action binds meetingId, candidateId and delta from the query
// string (no body), so this route forwards the three query params unchanged
// to /Api/MeetingElection/AnonymousVote.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const params = new URL(req.url).searchParams;
    const meetingId = params.get('meetingId');
    const candidateId = params.get('candidateId');
    const delta = Number(params.get('delta'));
    if (!meetingId || !candidateId || !Number.isFinite(delta) || delta === 0) {
      return NextResponse.json(
        { message: 'meetingId, candidateId and a non-zero delta are required' },
        { status: 400 },
      );
    }
    await anonymousVote(session.accessToken, meetingId, candidateId, delta);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'recording anonymous vote');
  }
}

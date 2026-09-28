import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { apiErrorResponse } from '@/lib/api-error';
import { listResults } from '@/services/general-meeting-api';

// GET /api/general-meeting/results — list all MeetingElectionResult rows (read only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(await listResults(session.accessToken));
  } catch (error) {
    return apiErrorResponse(error, 'listing meeting election results');
  }
}

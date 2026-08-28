import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { apiErrorResponse } from '@/lib/api-error';
import { listCandidates, addCandidate, removeCandidate } from '@/services/general-meeting-api';

// GET /api/general-meeting/candidates — list all MeetingCandidate rows
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(await listCandidates(session.accessToken));
  } catch (error) {
    return apiErrorResponse(error, 'listing meeting candidates');
  }
}

// POST /api/general-meeting/candidates — create a MeetingCandidate row
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    return NextResponse.json(await addCandidate(session.accessToken, body), { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'creating meeting candidate');
  }
}

// DELETE /api/general-meeting/candidates — remove a MeetingCandidate row (body = { id })
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    await removeCandidate(session.accessToken, body.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'deleting meeting candidate');
  }
}

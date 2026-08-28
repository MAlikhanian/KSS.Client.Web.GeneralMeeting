import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { apiErrorResponse } from '@/lib/api-error';
import { listMeetings, addMeeting, updateMeeting, removeMeeting } from '@/services/general-meeting-api';

// GET /api/general-meeting/meetings — list all meetings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(await listMeetings(session.accessToken));
  } catch (error) {
    return apiErrorResponse(error, 'listing meetings');
  }
}

// POST /api/general-meeting/meetings — create a meeting (seed: title + date; backend seeds Open/non-current)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    return NextResponse.json(await addMeeting(session.accessToken, body), { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'creating meeting');
  }
}

// PUT /api/general-meeting/meetings — edit a meeting's settings (title/date/seat counts)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    await updateMeeting(session.accessToken, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'updating meeting');
  }
}

// DELETE /api/general-meeting/meetings — remove a meeting (body = { id }); FK cascade removes its children
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    await removeMeeting(session.accessToken, body.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'deleting meeting');
  }
}

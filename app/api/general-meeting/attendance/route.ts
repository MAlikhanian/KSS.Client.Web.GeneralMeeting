import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { apiErrorResponse } from '@/lib/api-error';
import {
  listAttendance,
  addAttendance,
  updateAttendance,
  removeAttendance,
} from '@/services/general-meeting-api';

// GET /api/general-meeting/attendance — list all MeetingAttendance rows
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(await listAttendance(session.accessToken));
  } catch (error) {
    return apiErrorResponse(error, 'listing meeting attendance');
  }
}

// POST /api/general-meeting/attendance — create a MeetingAttendance row
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    return NextResponse.json(await addAttendance(session.accessToken, body), { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'creating meeting attendance');
  }
}

// PUT /api/general-meeting/attendance — update a MeetingAttendance row
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    await updateAttendance(session.accessToken, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'updating meeting attendance');
  }
}

// DELETE /api/general-meeting/attendance — remove a MeetingAttendance row (body = { id })
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    await removeAttendance(session.accessToken, body.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'deleting meeting attendance');
  }
}

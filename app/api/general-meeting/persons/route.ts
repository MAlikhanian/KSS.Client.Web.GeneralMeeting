import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { apiErrorResponse } from '@/lib/api-error';
import { listPersonDirectory } from '@/services/person-api';

/**
 * GET /api/general-meeting/persons
 * Person directory (id, nationalId, translation names) for the board-election
 * candidate picker. Any person can be nominated, so this is not access-scoped.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('query') || '').toLowerCase();

    let persons = await listPersonDirectory(session.accessToken);
    if (query) {
      persons = persons.filter((p) => {
        if (p.nationalId?.toLowerCase().includes(query)) return true;
        return p.translations?.some(
          (tr) =>
            tr.firstName?.toLowerCase().includes(query) ||
            tr.lastName?.toLowerCase().includes(query),
        );
      });
    }
    return NextResponse.json(persons);
  } catch (error) {
    return apiErrorResponse(error, 'listing persons');
  }
}

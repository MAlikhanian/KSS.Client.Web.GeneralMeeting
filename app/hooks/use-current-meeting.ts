import { useQuery } from '@tanstack/react-query';
import type { MeetingViewDto } from '@/services/general-meeting-api';

const fetchCurrentMeeting = async (): Promise<MeetingViewDto | null> => {
  const response = await fetch('/general-meeting/api/general-meeting/meeting/current');

  if (!response.ok) {
    throw new Error('Failed to load current meeting');
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

/**
 * Fetches the single General Meeting flagged IsCurrent (or null if none is
 * in progress) via the BFF proxy at /api/general-meeting/meeting/current.
 */
export function useCurrentMeeting() {
  const {
    data: meeting = null,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['gm-current-meeting'],
    queryFn: fetchCurrentMeeting,
    staleTime: 1000 * 30, // 30 seconds — meeting state changes drive workflow steps
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return { meeting, isLoading, refetch };
}

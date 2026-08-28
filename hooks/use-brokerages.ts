import { useQuery } from '@tanstack/react-query';

export interface BrokerageNameHistory {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface Brokerage {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  nationalId?: string;
  website?: string;
  ceo?: string;
  instituteKind?: string;
  seoRegisterNo?: number;
  nameHistory: BrokerageNameHistory[];
}

const fetchBrokerages = async (): Promise<Brokerage[]> => {
  const response = await fetch('/api/brokerages/select');
  
  if (!response.ok) {
    throw new Error('Failed to load brokerages');
  }
  
  return response.json();
};

export function useBrokerages() {
  const { data: brokerages = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['brokerages-select'],
    queryFn: fetchBrokerages,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  return {
    brokerages,
    loading,
    error: error ? (error instanceof Error ? error.message : 'An error occurred') : null,
    refetch,
  };
}

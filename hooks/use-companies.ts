import { useQuery } from '@tanstack/react-query';

export interface CompanyNameHistory {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  nationalId?: string;
  ceo?: string;
  instituteKind?: string;
  seoRegisterNo?: number;
  nameHistory: CompanyNameHistory[];
}

const fetchCompanies = async (): Promise<Company[]> => {
  const response = await fetch('/api/company/select');

  if (!response.ok) {
    throw new Error('Failed to load companies');
  }

  return response.json();
};

export function useCompanies() {
  const { data: companies = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['companies-select'],
    queryFn: fetchCompanies,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  return {
    companies,
    loading,
    error: error ? (error instanceof Error ? error.message : 'An error occurred') : null,
    refetch,
  };
}

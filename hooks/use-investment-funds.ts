import { useQuery } from '@tanstack/react-query';

export interface InvestmentFundNameHistory {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface InvestmentFund {
  // Company.Id — used by detail pages to look up the Fund via /api/funds/by-company/{id}.
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  nationalId?: string;
  website?: string;
  nameHistory: InvestmentFundNameHistory[];
}

const fetchInvestmentFunds = async (): Promise<InvestmentFund[]> => {
  const response = await fetch('/api/funds/select');
  if (!response.ok) {
    throw new Error('Failed to load investment funds');
  }
  return response.json();
};

export function useInvestmentFunds() {
  const { data: investmentFunds = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['investment-funds-select'],
    queryFn: fetchInvestmentFunds,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  return {
    investmentFunds,
    loading,
    error: error ? (error instanceof Error ? error.message : 'An error occurred') : null,
    refetch,
  };
}

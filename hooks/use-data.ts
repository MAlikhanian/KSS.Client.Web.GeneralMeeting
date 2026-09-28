import { useState, useEffect } from 'react';

export interface DataItem {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export function useData(dataType: string) {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lookups that have been migrated to the Members service backend.
    // The static JSON files in public/data/ still exist as a safety net but
    // these dataTypes now load fresh translations through the BFF.
    const API_BACKED: Record<string, string> = {
      'positions': '/api/members-lookups/positions',
      'work-locations': '/api/members-lookups/work-locations',
      'stock-exchanges': '/api/members-lookups/stock-exchanges',
      'person-statuses': '/api/members-lookups/person-statuses',
      // Shared labels from the Common service
      'address-labels': '/api/common/address-labels',
      'phone-labels': '/api/common/phone-labels',
      // Branch lookups from the Members service
      'branch-types': '/api/members-lookups/branch-types',
      'branch-activity-types': '/api/members-lookups/branch-activity-types',
      // Trading-station lookups from the Members service
      'trading-station-types': '/api/members-lookups/trading-station-types',
      'trading-station-activity-types': '/api/members-lookups/trading-station-activity-types',
      // Software product list (admin-managed flat lookup) from the Company service
      'software': '/api/company/software',
    };

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = API_BACKED[dataType] ?? `/data/${dataType}.json`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to load ${dataType}`);
        }

        const jsonData = await response.json();

        // Filter only active items
        const activeData = jsonData.filter((item: DataItem) => item.isActive);

        setData(activeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error(`Error loading ${dataType}:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dataType]);

  return {
    data,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      setData([]);
    }
  };
}

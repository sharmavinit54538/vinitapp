import { useCallback, useEffect, useState } from 'react';
import { triggerHaptic } from '@/services/nativeModules';

export function useDashboardData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      try {
        const res = await fetcher();
        setData(res);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load workforce data. Please try again.'
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [fetcher]
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  const onRefresh = useCallback(() => {
    void triggerHaptic('light');
    void load(true);
  }, [load]);

  const retry = useCallback(() => {
    void triggerHaptic('light');
    void load(false);
  }, [load]);

  return { data, setData, isLoading, isRefreshing, error, onRefresh, retry };
}

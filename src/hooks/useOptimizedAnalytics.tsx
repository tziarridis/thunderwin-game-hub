
import { useState, useEffect } from 'react';
import { optimizedAnalyticsService, OptimizedDashboardMetrics } from '@/services/optimizedAnalyticsService';
import { cacheService } from '@/services/cacheService';

export const useOptimizedAnalytics = (autoRefresh: boolean = true) => {
  const [data, setData] = useState<OptimizedDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async (useCache: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const metrics = await optimizedAnalyticsService.getDashboardMetrics(useCache);
      setData(metrics);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchData(false); // Force refresh without cache
  };

  const refreshMaterializedViews = async () => {
    try {
      await optimizedAnalyticsService.refreshMaterializedViews();
      // Refresh data after views are updated
      await fetchData(false);
    } catch (err: any) {
      console.error('Error refreshing materialized views:', err);
      setError(err.message || 'Failed to refresh analytics views');
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      // Auto-refresh every 2 minutes
      const interval = setInterval(() => {
        fetchData(true); // Use cache for auto-refresh
      }, 2 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    refreshData,
    refreshMaterializedViews,
    cacheStats: cacheService.getStats()
  };
};

export default useOptimizedAnalytics;

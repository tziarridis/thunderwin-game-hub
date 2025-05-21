
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { DatePickerWithRange } from '@/components/ui/date-range-picker'; 
import type { DateRange } from 'react-day-picker'; // Import DateRange type from react-day-picker
import { addDays, format } from 'date-fns';
import OverviewMetrics from '@/components/admin/dashboard/OverviewMetrics';
import RevenueChart from '@/components/admin/dashboard/RevenueChart';
import UserActivityChart from '@/components/admin/dashboard/UserActivityChart';
import TopGamesList from '@/components/admin/dashboard/TopGamesList';
import TransactionVolumeChart from '@/components/admin/dashboard/TransactionVolumeChart';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Define a more specific type for dashboard stats
interface DashboardStats {
  totalUsers?: number;
  totalRevenue?: number;
  activePlayers?: number;
  pendingWithdrawals?: number;
  revenueData?: Array<{ date: string; revenue: number }>;
  userActivityData?: Array<{ date: string; activeUsers: number }>;
  topGames?: Array<{ id: string; title: string; plays: number }>;
  transactionVolumeData?: Array<{ date: string; deposits: number; withdrawals?: number; }>; // Added withdrawals here to match usage
}

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardStats = async (currentDateRange: DateRange | undefined) => {
    if (!currentDateRange?.from || !currentDateRange?.to) {
      toast.error("Date range is not properly set.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // This is a placeholder. Replace with actual Supabase calls.
      // You'll need to create RPC functions or complex queries in Supabase
      // to aggregate this data efficiently.

      // Example: Fetch total users (adjust table/column names)
      const { count: totalUsers } = await supabase
        .from('users') // Assuming you have a 'users' table
        .select('*', { count: 'exact', head: true })
        .gte('created_at', format(currentDateRange.from, 'yyyy-MM-dd'))
        .lte('created_at', format(currentDateRange.to, 'yyyy-MM-dd'));
      
      // Simulate other data fetching
      const fetchedStats: DashboardStats = {
        totalUsers: totalUsers ?? 0,
        totalRevenue: Math.floor(Math.random() * 100000),
        activePlayers: Math.floor(Math.random() * 1000),
        pendingWithdrawals: Math.floor(Math.random() * 50),
        revenueData: Array.from({ length: 30 }, (_, i) => ({
          date: format(addDays(currentDateRange.from!, i), 'MMM dd'),
          revenue: Math.floor(Math.random() * 5000) + 1000,
        })),
        userActivityData: Array.from({ length: 30 }, (_, i) => ({
          date: format(addDays(currentDateRange.from!, i), 'MMM dd'),
          activeUsers: Math.floor(Math.random() * 200) + 50,
        })),
        topGames: [
          { id: '1', title: 'Game Alpha', plays: Math.floor(Math.random() * 1000) },
          { id: '2', title: 'Game Beta', plays: Math.floor(Math.random() * 800) },
          { id: '3', title: 'Game Gamma', plays: Math.floor(Math.random() * 600) },
        ],
        transactionVolumeData: Array.from({ length: 30 }, (_, i) => ({
            date: format(addDays(currentDateRange.from!, i), 'MMM dd'),
            deposits: Math.floor(Math.random() * 10000) + 2000,
            withdrawals: Math.floor(Math.random() * 5000) + 1000,
        })),
      };
      setStats(fetchedStats);

    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard data: " + error.message);
      setStats(null); // Clear stats on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchDashboardStats(dateRange);
    }
  }, [dateRange]);

  const handleDateChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
  };

  return (
    <AdminPageLayout title="Admin Dashboard">
      <div className="flex justify-end mb-6">
        <DatePickerWithRange
          date={dateRange}
          onDateChange={handleDateChange}
          // Removed align prop as it's not valid
        />
      </div>

      {isLoading && !stats ? (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <OverviewMetrics stats={stats} isLoading={isLoading && !stats?.totalUsers} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={stats?.revenueData || null} isLoading={isLoading && !stats?.revenueData} />
            <UserActivityChart data={stats?.userActivityData || null} isLoading={isLoading && !stats?.userActivityData} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <TopGamesList games={stats?.topGames || null} isLoading={isLoading && !stats?.topGames} />
             <TransactionVolumeChart data={stats?.transactionVolumeData || null} isLoading={isLoading && !stats?.transactionVolumeData} />
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
};

export default AdminDashboard;

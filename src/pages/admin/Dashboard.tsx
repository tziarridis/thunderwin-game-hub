import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker'; // Standard Shadcn component for range
import { OverviewData, RevenueDataPoint, UserActivityDataPoint, GamePopularityDataPoint, TransactionVolumeDataPoint, DashboardStats } from '@/types/analytics';
import { dashboardService } from '@/services/dashboardService'; // Assuming this service exists and is correctly set up
import { toast } from 'sonner';
import { DollarSign, Users, Gamepad2, BarChart, TrendingUp, TrendingDown, AlertCircle, Loader2, RefreshCcw } from 'lucide-react';
import OverviewMetrics from '@/components/admin/dashboard/OverviewMetrics';
import RevenueChart from '@/components/admin/dashboard/RevenueChart';
import UserActivityChart from '@/components/admin/dashboard/UserActivityChart';
import TopGamesList from '@/components/admin/dashboard/TopGamesList';
import TransactionVolumeChart from '@/components/admin/dashboard/TransactionVolumeChart';
// import RecentActivityFeed from '@/components/admin/dashboard/RecentActivityFeed'; // If you have this

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29); // Default to last 30 days
    return { from: startDate, to: endDate };
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Assuming dashboardService.getDashboardStats takes dateRange (or individual dates) as optional param
      const data = await dashboardService.getDashboardStats({ 
        from: dateRange?.from, 
        to: dateRange?.to 
      });
      setDashboardData(data);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(`Failed to load dashboard data: ${err.message}`);
      toast.error(`Failed to load dashboard data: ${err.message}`);
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]); // Refetch when dateRange changes

  const handleDateChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange); // This will trigger useEffect to refetch
  };
  
  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Dashboard Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={handleRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <p className="text-lg text-muted-foreground">No dashboard data available.</p>
        <p className="text-sm text-muted-foreground mb-4">Try adjusting the date range or check back later.</p>
        <Button onClick={handleRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>
    );
  }
  
  // Destructure for easier access, provide defaults for charts if parts of data are missing
  const { 
    overview = {}, 
    revenueOverTime = [], 
    userActivity = [], 
    topGames = [], 
    transactionVolume = [] 
  } = dashboardData;


  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <DatePickerWithRange 
            date={dateRange} 
            onDateChange={handleDateChange} // Corrected prop name, ensure DatePickerWithRange uses this
            align="end" 
          />
          <Button onClick={handleRefresh} variant="outline" size="icon" title="Refresh dashboard">
            <RefreshCcw className={`h-5 w-5 ${isLoading ? 'animate-spin':''}`} />
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <OverviewMetrics overviewData={overview as OverviewData} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><DollarSign className="mr-2 h-5 w-5 text-green-500" />Revenue Over Time</CardTitle>
            <CardDescription>Track your total revenue within the selected date range.</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueOverTime.length > 0 ? (
              <RevenueChart data={revenueOverTime} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No revenue data for this period.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-blue-500" />User Activity</CardTitle>
            <CardDescription>Monitor active users and new signups.</CardDescription>
          </CardHeader>
          <CardContent>
            {userActivity.length > 0 ? (
              <UserActivityChart data={userActivity} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No user activity data for this period.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart className="mr-2 h-5 w-5 text-indigo-500" />Transaction Volume</CardTitle>
            <CardDescription>Deposits vs. Withdrawals volume.</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionVolume.length > 0 ? (
              <TransactionVolumeChart data={transactionVolume} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No transaction volume data for this period.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Games List */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Gamepad2 className="mr-2 h-5 w-5 text-purple-500" />Top Performing Games</CardTitle>
          <CardDescription>Most popular games by bet count or volume.</CardDescription>
        </CardHeader>
        <CardContent>
          {topGames.length > 0 ? (
            <TopGamesList games={topGames} />
          ) : (
            <p className="text-muted-foreground text-center py-8">No game performance data available.</p>
          )}
        </CardContent>
      </Card>
      
      {/* {dashboardData.recentActivity && (
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent><RecentActivityFeed activities={dashboardData.recentActivity} /></CardContent>
        </Card>
      )} */}
    </div>
  );
};

export default AdminDashboard;

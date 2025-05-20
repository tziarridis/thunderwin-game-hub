
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Activity, AlertTriangle, Gamepad2, CreditCard, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { dashboardService, DashboardStats } from '@/services/dashboardService'; // DashboardStats is now exported
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: string; // e.g., "+5.2% from last month"
  trendColor?: string; // e.g., "text-green-500" or "text-red-500"
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, trend, trendColor, isLoading }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      {isLoading ? <Skeleton className="h-5 w-24" /> : <CardTitle className="text-sm font-medium">{title}</CardTitle>}
      {isLoading ? <Skeleton className="h-5 w-5 rounded-full" /> : <Icon className="h-5 w-5 text-muted-foreground" />}
    </CardHeader>
    <CardContent>
      {isLoading ? <Skeleton className="h-8 w-32 mb-1" /> : <div className="text-2xl font-bold">{value}</div>}
      {isLoading ? <Skeleton className="h-4 w-full" /> : description && <p className="text-xs text-muted-foreground">{description}</p>}
      {isLoading ? <Skeleton className="h-4 w-20 mt-1" /> : trend && <p className={`text-xs ${trendColor || 'text-muted-foreground'} pt-1`}>{trend}</p>}
    </CardContent>
  </Card>
);


const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getDashboardStats();
        setDashboardData(data);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "An unknown error occurred.");
        toast.error("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading && !dashboardData && !error) { // Show skeleton only on initial load
    return (
        <div className="p-6 space-y-6">
            <CMSPageHeader title="Admin Dashboard" description="Overview of platform activity and key metrics." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {['Total Users', 'Total Deposits', 'Active Sessions', 'Total Bets', 'Pending KYC', 'Active Promos', 'Withdrawals', 'Net Revenue'].map((title, i) => (
                    <StatCard key={i} title={title} value="" icon={Activity} isLoading={true} />
                ))}
            </div>
            {/* Further sections for charts could have skeletons too */}
        </div>
    );
  }

  if (error) { // Removed !dashboardData from here to allow showing partial data if some queries succeed
    return (
      <div className="p-6 text-center">
        <CMSPageHeader title="Admin Dashboard" description="Overview of platform activity and key metrics." />
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground">{error || "Dashboard data could not be retrieved."}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // Safely access dashboardData properties with fallbacks
  const totalUsers = dashboardData?.totalUsers ?? 0;
  const activeSessions = dashboardData?.activeSessions ?? 0;
  const totalDeposits = dashboardData?.totalDeposits?.amount ?? 0;
  const totalDepositsCurrency = dashboardData?.totalDeposits?.currency ?? 'USD';
  const totalWithdrawals = dashboardData?.totalWithdrawals?.amount ?? 0;
  const totalWithdrawalsCurrency = dashboardData?.totalWithdrawals?.currency ?? 'USD';
  const totalBets = dashboardData?.totalBetsPlaced ?? 0;
  const openKycRequests = dashboardData?.pendingKycRequests ?? 0;
  const activePromotions = dashboardData?.activePromotions ?? 0;
  const netGamingRevenue = dashboardData?.netGamingRevenue?.amount ?? 0;
  const netGamingRevenueCurrency = dashboardData?.netGamingRevenue?.currency ?? 'USD';

  return (
    <div className="p-6 space-y-6">
      <CMSPageHeader title="Admin Dashboard" description="Overview of platform activity and key metrics." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard title="Total Users" value={totalUsers.toLocaleString()} icon={Users} description="Registered users" isLoading={isLoading} />
        <StatCard title="Total Deposits" value={`${totalDeposits.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} ${totalDepositsCurrency}`} icon={DollarSign} description="Sum of deposits" trend="+2.5% this month" trendColor="text-green-500" isLoading={isLoading} />
        <StatCard title="Total Withdrawals" value={`${totalWithdrawals.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} ${totalWithdrawalsCurrency}`} icon={TrendingUp} description="Sum of withdrawals" isLoading={isLoading} />
        <StatCard title="Net Gaming Revenue" value={`${netGamingRevenue.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} ${netGamingRevenueCurrency}`} icon={DollarSign} description="Wagered - Won" isLoading={isLoading} />
        <StatCard title="Active Player Sessions" value={(activeSessions || 0).toLocaleString()} icon={Activity} description="Current live sessions" isLoading={isLoading} />
        <StatCard title="Total Bets Placed" value={(totalBets || 0).toLocaleString()} icon={Gamepad2} description="Number of bets" isLoading={isLoading} />
        <StatCard title="Pending KYC Requests" value={openKycRequests.toLocaleString()} icon={ShieldCheck} description="Awaiting review" isLoading={isLoading} />
        <StatCard title="Active Promotions" value={activePromotions.toLocaleString()} icon={CreditCard} description="Currently running" isLoading={isLoading} />
      </div>

      {/* Placeholder for charts and recent activity sections */}
      {/* 
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
          <CardContent className="h-72">{isLoading ? <Skeleton className="w-full h-full" /> : <p className="text-center text-muted-foreground">Chart Placeholder</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Financial Overview</CardTitle></CardHeader>
          <CardContent className="h-72">{isLoading ? <Skeleton className="w-full h-full" /> : <p className="text-center text-muted-foreground">Chart Placeholder</p>}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>{isLoading ? <Skeleton className="w-full h-32" /> : <p className="text-center text-muted-foreground">Activity Feed Placeholder</p>}</CardContent>
      </Card>
      */}
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescription removed as it's not used
import { Users, DollarSign, Activity, AlertTriangle, Gamepad2, CreditCard, ShieldCheck } from 'lucide-react';
import { dashboardService, DashboardStats } from '@/services/dashboardService'; // Use DashboardStats
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: string;
  trendColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, trend, trendColor }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {trend && <p className={`text-xs ${trendColor || 'text-muted-foreground'} pt-1`}>{trend}</p>}
    </CardContent>
  </Card>
);


const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null); // Use DashboardStats
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getDashboardStats(); // Use getDashboardStats
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

  // ... keep existing code (isLoading and error states)
  if (isLoading) {
    return (
        <div className="p-6 space-y-6">
            <CMSPageHeader title="Admin Dashboard" description="Overview of platform activity and key metrics." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(6)].map((_, i) => ( // Increased skeleton count to 6 for more stat cards
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32 mb-1" />
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            {/* Placeholder for charts skeletons if re-enabled 
            <div className="grid gap-4 md:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
            </div>
            */}
        </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-6 text-center">
        <CMSPageHeader title="Admin Dashboard" description="Overview of platform activity and key metrics." />
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground">{error || "Dashboard data could not be retrieved."}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
          Try Again
        </button>
      </div>
    );
  }
  
  const totalUsers = dashboardData.totalUsers ?? 0;
  const activeSessions = dashboardData.activeSessions ?? 0; // Assuming activeSessions is part of DashboardStats
  const totalDeposits = dashboardData.totalDeposits?.amount ?? 0;
  const totalDepositsCurrency = dashboardData.totalDeposits?.currency ?? 'USD';
  const totalBets = dashboardData.totalBetsPlaced ?? 0; // Assuming totalBetsPlaced is part of DashboardStats
  const openKycRequests = dashboardData.pendingKycRequests ?? 0;
  const activePromotions = dashboardData.activePromotions ?? 0;

  return (
    <div className="p-6 space-y-6">
      <CMSPageHeader title="Admin Dashboard" description="Overview of platform activity and key metrics." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard title="Total Users" value={totalUsers.toLocaleString()} icon={Users} description="Registered users on the platform" />
        <StatCard title="Total Deposits" value={`${totalDeposits.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} ${totalDepositsCurrency}`} icon={DollarSign} description="Sum of all successful deposits" />
        <StatCard title="Active Player Sessions" value={(activeSessions || 0).toLocaleString()} icon={Activity} description="Current concurrent player sessions" />
        <StatCard title="Total Bets Placed" value={(totalBets || 0).toLocaleString()} icon={Gamepad2} description="Number of bets across all games" />
        <StatCard title="Pending KYC Requests" value={openKycRequests.toLocaleString()} icon={ShieldCheck} description="KYC submissions awaiting review" />
        <StatCard title="Active Promotions" value={activePromotions.toLocaleString()} icon={CreditCard} description="Currently running promotions" />
      </div>

      {/* Charts and Recent Activity sections commented out as before */}
    </div>
  );
};

export default AdminDashboard;

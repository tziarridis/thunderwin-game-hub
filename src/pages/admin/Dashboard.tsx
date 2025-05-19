
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, DollarSign, Activity, AlertTriangle, Gamepad2, CreditCard, ShieldCheck } from 'lucide-react';
import { dashboardService, DashboardData } from '@/services/dashboardService'; // Assuming service exists
import { toast } from 'sonner';
// import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, LineChart, Line } from 'recharts'; // If charts are needed
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; description?: string; trend?: string; trendColor?: string; }> = ({ title, value, icon: Icon, description, trend, trendColor }) => (
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getDashboardData();
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

  if (isLoading) {
    return (
        <div className="p-6 space-y-6">
            <CMSPageHeader title="Admin Dashboard" description="Overview of platform activity and key metrics." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
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
            <div className="grid gap-4 md:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
            </div>
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
  
  // Use optional chaining and provide default values
  const totalUsers = dashboardData.totalUsers ?? 0;
  const activeSessions = dashboardData.activeSessions ?? 0;
  const totalDeposits = dashboardData.totalDeposits?.amount ?? 0;
  const totalDepositsCurrency = dashboardData.totalDeposits?.currency ?? 'USD';
  const totalBets = dashboardData.totalBetsPlaced ?? 0;
  const openKycRequests = dashboardData.pendingKycRequests ?? 0;
  const activePromotions = dashboardData.activePromotions ?? 0;

  return (
    <div className="p-6 space-y-6">
      <CMSPageHeader title="Admin Dashboard" description="Overview of platform activity and key metrics." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard title="Total Users" value={totalUsers.toLocaleString()} icon={Users} description="Registered users on the platform" />
        <StatCard title="Total Deposits" value={`${totalDeposits.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} ${totalDepositsCurrency}`} icon={DollarSign} description="Sum of all successful deposits" />
        <StatCard title="Active Player Sessions" value={activeSessions.toLocaleString()} icon={Activity} description="Current concurrent player sessions" />
        <StatCard title="Total Bets Placed" value={totalBets.toLocaleString()} icon={Gamepad2} description="Number of bets across all games" />
        {/* Add more StatCards as needed based on DashboardData */}
        <StatCard title="Pending KYC Requests" value={openKycRequests.toLocaleString()} icon={ShieldCheck} description="KYC submissions awaiting review" />
        <StatCard title="Active Promotions" value={activePromotions.toLocaleString()} icon={CreditCard} description="Currently running promotions" />

      </div>

      {/* Placeholder for charts - Uncomment and configure if Recharts is used */}
      {/* <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Registrations</CardTitle>
            <CardDescription>New users over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {dashboardData.userRegistrationChartData && dashboardData.userRegistrationChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.userRegistrationChartData}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center pt-10">No registration data available.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Deposits vs. Withdrawals over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             {dashboardData.revenueChartData && dashboardData.revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.revenueChartData}>
                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`}/>
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="deposits" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="withdrawals" fill="#fa8072" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             ) : <p className="text-muted-foreground text-center pt-10">No revenue data available.</p>}
          </CardContent>
        </Card>
      </div> */}
      
      {/* Placeholder for recent activity feed or important alerts */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
            <ul className="space-y-2">
              {dashboardData.recentActivities.slice(0,5).map((activity, index) => (
                <li key={index} className="text-sm text-muted-foreground border-b pb-1 mb-1">
                  {activity.timestamp}: {activity.description}
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-muted-foreground">No recent activities to display.</p>
          )}
        </CardContent>
      </Card> */}

    </div>
  );
};

export default AdminDashboard;


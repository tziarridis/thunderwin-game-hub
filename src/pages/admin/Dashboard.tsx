import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, Activity, CreditCard, AlertTriangle, Gamepad2, Gift } from 'lucide-react';
// import { LineChart, BarChart } from '@/components/ui/dashboard-charts'; // Assuming these are custom chart components
import { ResponsiveContainer, LineChart as ReLineChart, BarChart as ReBarChart, XAxis, YAxis, Tooltip, Legend, Line, Bar, CartesianGrid } from 'recharts';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { dashboardService } from '@/services/dashboardService';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { OverviewData, RevenueDataPoint, UserStatsDataPoint, GamePopularityDataPoint, TransactionVolumeDataPoint } from '@/types/analytics'; // Ensure these types are defined
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [userStatsData, setUserStatsData] = useState<UserStatsDataPoint[]>([]);
  const [gamePopularityData, setGamePopularityData] = useState<GamePopularityDataPoint[]>([]);
  const [transactionVolumeData, setTransactionVolumeData] = useState<TransactionVolumeDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return { from: startDate, to: endDate };
  });
  const [timePeriod, setTimePeriod] = useState<string>('last30days');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const from = dateRange?.from;
        const to = dateRange?.to;

        if (!from || !to) {
            toast.error("Date range is required to fetch dashboard data.");
            setIsLoading(false);
            return;
        }

        const [
          overview, 
          revenue, 
          userStats, 
          gamePopularity, 
          transactionVolume
        ] = await Promise.all([
          dashboardService.getOverviewData({from, to}),
          dashboardService.getRevenueData({from, to, granularity: 'daily'}), // Adjust granularity as needed
          dashboardService.getUserStatsData({from, to, granularity: 'daily'}),
          dashboardService.getGamePopularityData({from, to, limit: 5}),
          dashboardService.getTransactionVolumeData({from, to, granularity: 'daily'})
        ]);
        
        setOverviewData(overview);
        setRevenueData(revenue);
        setUserStatsData(userStats);
        setGamePopularityData(gamePopularity);
        setTransactionVolumeData(transactionVolume);

      } catch (err: any) {
        console.error("Failed to load dashboard data:", err);
        setError(err.message || 'Failed to load dashboard data. Please try again.');
        toast.error(err.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);
  
  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value);
    const to = new Date();
    let from = new Date();
    switch (value) {
      case 'last7days': from.setDate(to.getDate() - 7); break;
      case 'last30days': from.setDate(to.getDate() - 30); break;
      case 'last90days': from.setDate(to.getDate() - 90); break;
      case 'thisMonth': 
        from = new Date(to.getFullYear(), to.getMonth(), 1);
        break;
      case 'lastMonth':
        from = new Date(to.getFullYear(), to.getMonth() - 1, 1);
        to.setDate(0); // End of last month
        break;
      default: from.setDate(to.getDate() - 30); 
    }
    setDateRange({ from, to });
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-theme(space.24))]"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <span className="ml-3 text-lg">Loading Dashboard Data...</span></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }


  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
            <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="last90days">Last 90 Days</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                </SelectContent>
            </Select>
            <DateRangePicker 
                initialDateFrom={dateRange?.from} 
                initialDateTo={dateRange?.to}
                onUpdate={values => setDateRange(values.range)} 
                align="end"
            />
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overviewData?.totalRevenue?.toLocaleString() || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              {overviewData?.revenueChange !== undefined ? `${overviewData.revenueChange >= 0 ? '+' : ''}${overviewData.revenueChange.toFixed(1)}% from last period` : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData?.activeUsers?.toLocaleString() || '0'}</div>
             <p className="text-xs text-muted-foreground">
              {overviewData?.activeUsersChange !== undefined ? `${overviewData.activeUsersChange >= 0 ? '+' : ''}${overviewData.activeUsersChange.toFixed(1)}% from last period` : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData?.newSignups?.toLocaleString() || '0'}</div>
             <p className="text-xs text-muted-foreground">
              {overviewData?.newSignupsChange !== undefined ? `${overviewData.newSignupsChange >= 0 ? '+' : ''}${overviewData.newSignupsChange.toFixed(1)}% from last period` : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bets Placed</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData?.totalBets?.toLocaleString() || '0'}</div>
             <p className="text-xs text-muted-foreground">
              {overviewData?.totalBetsChange !== undefined ? `${overviewData.totalBetsChange >= 0 ? '+' : ''}${overviewData.totalBetsChange.toFixed(1)}% from last period` : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Daily revenue for the selected period.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <ReLineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', {month:'short', day:'numeric'})} />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </ReLineChart>
                </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-10">No revenue data available for this period.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Daily active users (DAU) and new signups.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             {userStatsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <ReLineChart data={userStatsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', {month:'short', day:'numeric'})} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="activeUsers" name="Active Users" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="newSignups" name="New Signups" stroke="#ffc658" />
                    </ReLineChart>
                </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-10">No user activity data available.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Games by Bets</CardTitle>
            <CardDescription>Most popular games by number of bets placed.</CardDescription>
          </CardHeader>
          <CardContent>
            {gamePopularityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <ReBarChart data={gamePopularityData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="gameName" type="category" width={100} tick={{fontSize: 12}}/>
                        <Tooltip formatter={(value:number) => value.toLocaleString()} />
                        <Legend />
                        <Bar dataKey="betCount" name="Number of Bets" fill="#8884d8" />
                    </ReBarChart>
                </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-10">No game popularity data available.</p>}
          </CardContent>
        </Card>
      </div>
      
      {/* More stats if available */}
      <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Daily deposit and withdrawal volume.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {transactionVolumeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <ReBarChart data={transactionVolumeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', {month:'short', day:'numeric'})} />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="depositVolume" name="Deposits" stackId="a" fill="#82ca9d" />
                        <Bar dataKey="withdrawalVolume" name="Withdrawals" stackId="a" fill="#ff7300" />
                    </ReBarChart>
                </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-10">No transaction volume data available for this period.</p>}
          </CardContent>
        </Card>
    </div>
  );
};

export default AdminDashboard;

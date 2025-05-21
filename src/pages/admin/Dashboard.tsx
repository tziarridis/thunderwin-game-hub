import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, Gamepad2, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, LineChart as ReLineChart, BarChart as ReBarChart, XAxis, YAxis, Tooltip, Legend, Line, Bar, CartesianGrid } from 'recharts';
// Corrected: Use assumed props for DateRangePicker value/onValueChange
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker'; 
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { OverviewData, RevenueDataPoint, UserStatsDataPoint, GamePopularityDataPoint, TransactionVolumeDataPoint, DashboardStats } from '@/types/analytics';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Mock dashboardService to unblock build, replace with actual service later
const mockDashboardService = {
  async getDashboardStats(filters: { from: Date; to: Date }): Promise<DashboardStats> {
    console.log('Mock getDashboardStats called with filters:', filters);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return mock data structure matching DashboardStats
    return {
      overview: {
        totalRevenue: Math.random() * 100000,
        revenueChange: (Math.random() - 0.5) * 20,
        activeUsers: Math.floor(Math.random() * 1000),
        activeUsersChange: (Math.random() - 0.5) * 15,
        newSignups: Math.floor(Math.random() * 200),
        newSignupsChange: (Math.random() - 0.5) * 25,
        totalBets: Math.floor(Math.random() * 50000),
        totalBetsChange: (Math.random() - 0.5) * 10,
      },
      revenueOverTime: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: Math.random() * 1000,
      })),
      userActivity: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        activeUsers: Math.floor(Math.random() * 100),
        newSignups: Math.floor(Math.random() * 10),
      })),
      topGames: [
        { gameName: 'Game A', betCount: Math.floor(Math.random() * 500) },
        { gameName: 'Game B', betCount: Math.floor(Math.random() * 400) },
        { gameName: 'Game C', betCount: Math.floor(Math.random() * 300) },
      ],
      transactionVolume: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        depositVolume: Math.random() * 5000,
        withdrawalVolume: Math.random() * 3000,
      })),
    };
  },
  // Keep other methods if they exist, or add stubs if dashboard uses them individually
  // For now, assuming getDashboardStats is primary and returns all data needed.
};


const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
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
        
        // Using the mock service that returns DashboardStats
        const data = await mockDashboardService.getDashboardStats({from, to});
        setDashboardData(data);

      } catch (err: any) {
        console.error("Failed to load dashboard data:", err);
        setError(err.message || 'Failed to load dashboard data. Please try again.');
        toast.error(err.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (dateRange?.from && dateRange?.to) {
        fetchData();
    }
  }, [dateRange]);
  
  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value);
    const toDate = new Date();
    let fromDate = new Date();
    switch (value) {
      case 'last7days': fromDate.setDate(toDate.getDate() - 7); break;
      case 'last30days': fromDate.setDate(toDate.getDate() - 30); break;
      case 'last90days': fromDate.setDate(toDate.getDate() - 90); break;
      case 'thisMonth': 
        fromDate = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
        break;
      case 'lastMonth':
        fromDate = new Date(toDate.getFullYear(), toDate.getMonth() - 1, 1);
        // End of last month: set to day 0 of current month.
        toDate.setDate(0); 
        break;
      default: fromDate.setDate(toDate.getDate() - 30); 
    }
    setDateRange({ from: fromDate, to: toDate });
  };
  
  if (isLoading && !dashboardData) { // Show loader if loading and no data yet
    return <div className="flex items-center justify-center h-[calc(100vh-theme(space.24))]"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <span className="ml-3 text-lg">Loading Dashboard Data...</span></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => { if (dateRange?.from && dateRange?.to) { /* fetchData(); */ setIsLoading(true); mockDashboardService.getDashboardStats({from:dateRange.from, to:dateRange.to}).then(setDashboardData).finally(()=>setIsLoading(false)); } }}>Try Again</Button>
      </div>
    );
  }

  // Destructure from dashboardData for easier use in JSX
  const overviewData = dashboardData?.overview;
  const revenueData = dashboardData?.revenueOverTime || [];
  const userStatsData = dashboardData?.userActivity || [];
  const gamePopularityData = dashboardData?.topGames || [];
  const transactionVolumeData = dashboardData?.transactionVolume || [];


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
            {/* Corrected DateRangePicker props */}
            <DateRangePicker 
                value={dateRange} 
                onValueChange={(newRange) => setDateRange(newRange)} 
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
            <div className="text-2xl font-bold">${overviewData?.totalRevenue?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              {overviewData?.revenueChange !== undefined ? `${overviewData.revenueChange >= 0 ? '+' : ''}${overviewData.revenueChange.toFixed(1)}% from last period` : 'N/A'}
            </p>
          </CardContent>
        </Card>
        {/* ... keep existing code (other overview cards, use overviewData directly) */}
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
      {/* ... keep existing code (chart rendering, using revenueData, userStatsData, etc.) */}
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

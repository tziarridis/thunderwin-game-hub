import React from 'react';
import { BarChart, LineChart, PieChart, Users, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Activity, ShoppingCart, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// Ensure these types are correctly defined and exported from your types file
import { AnalyticsData, GameAnalytics, UserGrowthData, OverviewData, RevenueDataPoint } from '@/types/analytics'; 
import AdminPageLayout from '@/components/layout/AdminPageLayout';

// Mock data - replace with actual data fetching logic
const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalRevenue: 125000,
    activeUsers: 1500,
    newSignups: 350,
    revenueChange: 5.2, // percentage
    activeUsersChange: -1.5,
    newSignupsChange: 10,
  },
  revenueOverTime: [
    { date: 'Jan', revenue: 10000 },
    { date: 'Feb', revenue: 12000 },
    { date: 'Mar', revenue: 15000 },
    { date: 'Apr', revenue: 13000 },
    { date: 'May', revenue: 18000 },
  ],
  userActivity: [
    { date: 'Week 1', activeUsers: 1200, newSignups: 50 },
    { date: 'Week 2', activeUsers: 1300, newSignups: 60 },
    { date: 'Week 3', activeUsers: 1250, newSignups: 55 },
    { date: 'Week 4', activeUsers: 1500, newSignups: 70 },
  ],
  topGames: [
    { gameName: 'Slot Masters', betCount: 50000, totalWagered: 250000 },
    { gameName: 'Blackjack Pro', betCount: 30000, totalWagered: 600000 },
    { gameName: 'Roulette Royale', betCount: 25000, totalWagered: 400000 },
  ],
  transactionVolume: [
    { date: 'Mon', depositVolume: 5000, withdrawalVolume: 2000 },
    { date: 'Tue', depositVolume: 6000, withdrawalVolume: 2500 },
    { date: 'Wed', depositVolume: 5500, withdrawalVolume: 1500 },
  ],
};

const mockGameAnalytics: GameAnalytics = {
  topGames: mockAnalyticsData.topGames || [],
  // ... other game specific mock data
};

const mockUserGrowth: UserGrowthData = {
  userActivity: mockAnalyticsData.userActivity || [],
  // ... other user growth mock data
};


const AnalyticsDashboard: React.FC = () => {
  const analyticsData: AnalyticsData = mockAnalyticsData; // Replace with actual fetched data
  const gameAnalytics: GameAnalytics = mockGameAnalytics;
  const userGrowth: UserGrowthData = mockUserGrowth;

  const renderMetricCard = (title: string, value: string | number, change?: number, icon?: React.ReactNode, unit: string = '') => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' && (title.toLowerCase().includes('revenue') || title.toLowerCase().includes('wagered')) ? `$${value.toLocaleString()}` : value.toLocaleString()}{unit}</div>
        {change !== undefined && (
          <p className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {change >= 0 ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
            {change.toFixed(1)}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminPageLayout title="Analytics Dashboard">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        
        {/* Overview Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {renderMetricCard("Total Revenue", analyticsData.overview.totalRevenue || 0, analyticsData.overview.revenueChange, <DollarSign className="h-5 w-5 text-muted-foreground" />)}
          {renderMetricCard("Active Users", analyticsData.overview.activeUsers || 0, analyticsData.overview.activeUsersChange, <Users className="h-5 w-5 text-muted-foreground" />)}
          {renderMetricCard("New Signups", analyticsData.overview.newSignups || 0, analyticsData.overview.newSignupsChange, <Activity className="h-5 w-5 text-muted-foreground" />)}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Monthly revenue trends.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {/* Replace with actual chart component */}
              <LineChart className="h-full w-full text-primary" /> 
              <p className="text-sm text-muted-foreground">Chart: Revenue data ({analyticsData.revenueOverTime?.length} points)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Active users and new signups weekly.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {/* Replace with actual chart component */}
              <BarChart className="h-full w-full text-secondary" />
              <p className="text-sm text-muted-foreground">Chart: User activity data ({userGrowth.userActivity?.length} points)</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Games by Wagered Amount</CardTitle>
            <CardDescription>Most popular games based on total amount wagered.</CardDescription>
          </CardHeader>
          <CardContent>
            {gameAnalytics.topGames && gameAnalytics.topGames.length > 0 ? (
              <ul className="space-y-2">
                {gameAnalytics.topGames.map((game, index) => (
                  <li key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <span>{index + 1}. {game.gameName}</span>
                    <span className="font-semibold">${(game.totalWagered || 0).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No game data available.</p>
            )}
          </CardContent>
        </Card>
        
        {/* Placeholder for more advanced charts or data tables */}
        <Card>
           <CardHeader><CardTitle>Transaction Volume</CardTitle></CardHeader>
           <CardContent className="h-[300px] flex items-center justify-center">
                <BarChart2 className="h-full w-full text-accent" />
                <p className="text-sm text-muted-foreground">Chart: Transaction volume ({analyticsData.transactionVolume?.length} points)</p>
           </CardContent>
        </Card>
        
        {/* Alert for data interpretation */}
        <Card className="border-yellow-500 bg-yellow-500/10">
          <CardHeader className="flex flex-row items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <CardTitle className="text-yellow-700">Data Interpretation Note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-600">
              This is mock data for demonstration purposes. Ensure your analytics tracking is properly configured to get accurate insights.
              Actual chart components and data fetching logic need to be implemented.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
};

export default AnalyticsDashboard;

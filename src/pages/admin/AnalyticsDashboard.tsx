
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, 
  BarChart, 
  PieChart,
  DonutChart, 
  AreaChart 
} from "@/components/ui/dashboard-charts";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  RefreshCw, 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Percent,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Clock,
  ChevronDown,
  Laptop
} from "lucide-react";
import { toast } from "sonner";
import { analyticsService } from "@/services/analyticsService";

const AnalyticsDashboard = () => {
  const [timeframe, setTimeframe] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Analytics data states
  const [overviewData, setOverviewData] = useState({
    totalRevenue: 0,
    activeUsers: 0,
    newUsers: 0,
    conversionRate: 0,
    revenueTrend: 0,
    userTrend: 0
  });
  
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userActivityData, setUserActivityData] = useState<any[]>([]);
  const [topGames, setTopGames] = useState<any[]>([]);
  const [bonusAnalytics, setBonusAnalytics] = useState<any[]>([]);
  const [playerRetention, setPlayerRetention] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // In a real scenario, these would be actual API calls
      // For this example, we're using the mock data from our service
      
      // Get user activity data
      const userActivity = await analyticsService.getUserActivityData(timeframe as any);
      setUserActivityData(userActivity);
      
      // Get top games
      const games = await analyticsService.getTopGames(10);
      setTopGames(games);
      
      // Get bonus analytics
      const bonuses = await analyticsService.getBonusAnalytics();
      setBonusAnalytics(bonuses);
      
      // Get player retention
      const retention = await analyticsService.getPlayerRetentionData();
      setPlayerRetention(retention);
      
      // Get payment methods distribution
      const payments = await analyticsService.getPaymentMethodDistribution();
      setPaymentMethods(payments);
      
      // Calculate overview metrics from the data
      calculateOverviewMetrics(userActivity);
      
      // Transform user activity data for revenue chart
      const transformedRevenueData = userActivity.map((item, index) => ({
        name: timeframe === 'day' ? `Hour ${index+1}` : 
              timeframe === 'week' ? `Day ${index+1}` : 
              timeframe === 'month' ? `Day ${index+1}` : 
              `Month ${index+1}`,
        revenue: item.revenue,
        users: item.activeUsers
      }));
      
      setRevenueData(transformedRevenueData);
      
      toast.success('Analytics data loaded successfully');
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateOverviewMetrics = (data: any[]) => {
    if (data.length === 0) return;
    
    // Calculate averages and totals
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const avgActiveUsers = Math.floor(data.reduce((sum, item) => sum + item.activeUsers, 0) / data.length);
    const totalNewUsers = data.reduce((sum, item) => sum + item.newRegistrations, 0);
    const avgConversion = data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length;
    
    // Calculate trends (comparing with previous period)
    const revenueTrend = 8.5; // Mock trend data
    const userTrend = 12.3; // Mock trend data
    
    setOverviewData({
      totalRevenue,
      activeUsers: avgActiveUsers,
      newUsers: totalNewUsers,
      conversionRate: avgConversion,
      revenueTrend,
      userTrend
    });
  };

  const handleExport = () => {
    toast.success('Exporting analytics data...');
    // In a real scenario, this would trigger a data export
  };
  
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };
  
  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };
  
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive casino performance metrics and insights</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="mb-8 flex items-center gap-4">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {timeframe === 'day' ? 'Data shown hourly' : 
           timeframe === 'week' ? 'Data shown daily' : 
           timeframe === 'month' ? 'Data shown daily' : 
           'Data shown monthly'}
        </div>
      </div>
      
      {/* KPI overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : formatCurrency(overviewData.totalRevenue)}
            </div>
            <div className="flex items-center mt-1">
              <div className={`flex items-center text-sm ${overviewData.revenueTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${overviewData.revenueTrend < 0 ? 'transform rotate-180' : ''}`} />
                <span>
                  {isLoading ? '...' : `${Math.abs(overviewData.revenueTrend).toFixed(1)}% from previous period`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : formatNumber(overviewData.activeUsers)}
            </div>
            <div className="flex items-center mt-1">
              <div className={`flex items-center text-sm ${overviewData.userTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${overviewData.userTrend < 0 ? 'transform rotate-180' : ''}`} />
                <span>
                  {isLoading ? '...' : `${Math.abs(overviewData.userTrend).toFixed(1)}% from previous period`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : formatNumber(overviewData.newUsers)}
            </div>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>During selected period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${overviewData.conversionRate.toFixed(1)}%`}
            </div>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Laptop className="h-4 w-4 mr-1" />
              <span>Registration to deposit</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="games">Game Performance</TabsTrigger>
          <TabsTrigger value="retention">Player Retention</TabsTrigger>
          <TabsTrigger value="bonuses">Bonus Analytics</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Revenue Over Time
              </CardTitle>
              <CardDescription>Total revenue during selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <LineChart
                  data={revenueData}
                  categories={["revenue"]}
                  index="name"
                  valueFormatter={formatCurrency}
                  colors={["#10b981"]}
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                User Activity
              </CardTitle>
              <CardDescription>Active users during selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <AreaChart
                  data={revenueData}
                  categories={["users"]}
                  index="name"
                  valueFormatter={formatNumber}
                  colors={["#6366f1"]}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Performing Games</CardTitle>
              <CardDescription>Games with highest revenue in selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <DataTable
                  data={topGames.slice(0, 5)}
                  columns={[
                    { header: "Game", accessorKey: "gameName" },
                    { header: "Provider", accessorKey: "provider" },
                    { 
                      header: "NGR", 
                      accessorKey: "netGamingRevenue", 
                      cell: (row) => formatCurrency(row.netGamingRevenue) 
                    },
                    { 
                      header: "Players", 
                      accessorKey: "playerCount", 
                      cell: (row) => formatNumber(row.playerCount) 
                    },
                    { 
                      header: "RTP", 
                      accessorKey: "rtp", 
                      cell: (row) => `${row.rtp}%` 
                    }
                  ]}
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="mr-2 h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Deposits by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <DonutChart
                  data={paymentMethods}
                  valueFormatter={(value) => `${value}%`}
                  colors={["#10b981", "#6366f1", "#f59e0b", "#ef4444"]}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="revenue" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Gross Gaming Revenue</CardTitle>
              <CardDescription>Total bets - total wins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overviewData.totalRevenue)}</div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+8.5% from previous period</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Net Revenue</CardTitle>
              <CardDescription>After bonuses & costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overviewData.totalRevenue * 0.7)}</div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+5.2% from previous period</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Average Revenue per User</CardTitle>
              <CardDescription>Total revenue / active users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overviewData.totalRevenue / (overviewData.activeUsers || 1))}
              </div>
              <div className="flex items-center text-red-500 text-sm">
                <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />
                <span>-2.1% from previous period</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown by Game Category</CardTitle>
            <CardDescription>Distribution of revenue across different game types</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <BarChart
                data={[
                  { name: "Slots", revenue: overviewData.totalRevenue * 0.5 },
                  { name: "Table Games", revenue: overviewData.totalRevenue * 0.2 },
                  { name: "Live Casino", revenue: overviewData.totalRevenue * 0.15 },
                  { name: "Video Poker", revenue: overviewData.totalRevenue * 0.08 },
                  { name: "Other", revenue: overviewData.totalRevenue * 0.07 }
                ]}
                categories={["revenue"]}
                index="name"
                valueFormatter={formatCurrency}
                colors={["#10b981"]}
              />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Time of Day</CardTitle>
            <CardDescription>Hourly revenue distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <AreaChart
                data={Array(24).fill(0).map((_, i) => ({
                  hour: `${i}:00`,
                  revenue: Math.random() * overviewData.totalRevenue * 0.1
                }))}
                categories={["revenue"]}
                index="hour"
                valueFormatter={formatCurrency}
                colors={["#6366f1"]}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="users" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Users</CardTitle>
              <CardDescription>Daily active users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overviewData.activeUsers)}</div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+12.3% from previous period</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">New Users</CardTitle>
              <CardDescription>New registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overviewData.newUsers)}</div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+8.2% from previous period</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Conversion</CardTitle>
              <CardDescription>Registration to deposit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercent(overviewData.conversionRate)}</div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+2.1% from previous period</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User Sessions Over Time</CardTitle>
            <CardDescription>Number of user sessions during selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <LineChart
                data={revenueData}
                categories={["users"]}
                index="name"
                valueFormatter={formatNumber}
                colors={["#6366f1"]}
              />
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Device Distribution</CardTitle>
              <CardDescription>Sessions by device type</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PieChart
                  data={[
                    { name: "Mobile", value: 65 },
                    { name: "Desktop", value: 30 },
                    { name: "Tablet", value: 5 },
                  ]}
                  valueFormatter={(value) => `${value}%`}
                  colors={["#10b981", "#6366f1", "#f59e0b"]}
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Geography</CardTitle>
              <CardDescription>Top countries by user count</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <BarChart
                  data={[
                    { name: "United States", users: Math.round(overviewData.activeUsers * 0.3) },
                    { name: "Canada", users: Math.round(overviewData.activeUsers * 0.15) },
                    { name: "Germany", users: Math.round(overviewData.activeUsers * 0.12) },
                    { name: "United Kingdom", users: Math.round(overviewData.activeUsers * 0.1) },
                    { name: "Australia", users: Math.round(overviewData.activeUsers * 0.08) },
                  ]}
                  categories={["users"]}
                  index="name"
                  valueFormatter={formatNumber}
                  colors={["#6366f1"]}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="games" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Games by NGR</CardTitle>
            <CardDescription>Best performing games by Net Gaming Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable
                data={topGames}
                columns={[
                  { header: "Game", accessorKey: "gameName" },
                  { header: "Provider", accessorKey: "provider" },
                  { 
                    header: "NGR", 
                    accessorKey: "netGamingRevenue", 
                    cell: (row) => formatCurrency(row.netGamingRevenue) 
                  },
                  { 
                    header: "Total Bets", 
                    accessorKey: "totalBets", 
                    cell: (row) => formatCurrency(row.totalBets) 
                  },
                  { 
                    header: "Players", 
                    accessorKey: "playerCount", 
                    cell: (row) => formatNumber(row.playerCount) 
                  },
                  { 
                    header: "Avg. Bet", 
                    accessorKey: "averageBet", 
                    cell: (row) => formatCurrency(row.averageBet) 
                  },
                  { 
                    header: "RTP", 
                    accessorKey: "rtp", 
                    cell: (row) => `${row.rtp}%` 
                  }
                ]}
              />
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Category Distribution</CardTitle>
              <CardDescription>Plays by game category</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <DonutChart
                  data={[
                    { name: "Slots", value: 60 },
                    { name: "Table Games", value: 20 },
                    { name: "Live Casino", value: 15 },
                    { name: "Other", value: 5 }
                  ]}
                  valueFormatter={(value) => `${value}%`}
                  colors={["#10b981", "#6366f1", "#f59e0b", "#ef4444"]}
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Providers by Revenue</CardTitle>
              <CardDescription>Game providers with highest revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <BarChart
                  data={[
                    { name: "Evolution", revenue: overviewData.totalRevenue * 0.25 },
                    { name: "Pragmatic Play", revenue: overviewData.totalRevenue * 0.2 },
                    { name: "NetEnt", revenue: overviewData.totalRevenue * 0.15 },
                    { name: "Play'n GO", revenue: overviewData.totalRevenue * 0.12 },
                    { name: "Microgaming", revenue: overviewData.totalRevenue * 0.1 }
                  ]}
                  categories={["revenue"]}
                  index="name"
                  valueFormatter={formatCurrency}
                  colors={["#10b981"]}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="retention" className="space-y-6">
        {playerRetention && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Day 1 Retention</CardTitle>
                  <CardDescription>Players returning after first day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">70.0%</div>
                  <div className="flex items-center text-green-500 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+2.5% from previous period</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Day 7 Retention</CardTitle>
                  <CardDescription>Players returning after first week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45.0%</div>
                  <div className="flex items-center text-green-500 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+1.8% from previous period</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Day 30 Retention</CardTitle>
                  <CardDescription>Players returning after first month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28.0%</div>
                  <div className="flex items-center text-red-500 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />
                    <span>-0.5% from previous period</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Retention Curve</CardTitle>
                <CardDescription>Player retention over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <LineChart
                    data={playerRetention.labels.map((label: string, i: number) => ({
                      day: label,
                      retention: playerRetention.retentionRate[i] || 0
                    }))}
                    categories={["retention"]}
                    index="day"
                    valueFormatter={(value) => `${value}%`}
                    colors={["#10b981"]}
                  />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Player Cohort Analysis</CardTitle>
                <CardDescription>New players and retention by cohort</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <BarChart
                    data={playerRetention.labels.map((label: string, i: number) => ({
                      day: label,
                      newPlayers: playerRetention.newPlayers[i] || 0,
                      retainedPlayers: playerRetention.retainedPlayers[i] || 0,
                      churnedPlayers: playerRetention.churnedPlayers[i] || 0
                    }))}
                    categories={["newPlayers", "retainedPlayers", "churnedPlayers"]}
                    index="day"
                    valueFormatter={formatNumber}
                    colors={["#6366f1", "#10b981", "#ef4444"]}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </TabsContent>
      
      <TabsContent value="bonuses" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bonus Usage Report</CardTitle>
            <CardDescription>Effectiveness of different bonus types</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DataTable
                data={bonusAnalytics}
                columns={[
                  { header: "Bonus Type", accessorKey: "bonusType" },
                  { 
                    header: "Total Given", 
                    accessorKey: "totalGiven", 
                    cell: (row) => formatCurrency(row.totalGiven) 
                  },
                  { 
                    header: "Users", 
                    accessorKey: "userCount", 
                    cell: (row) => formatNumber(row.userCount) 
                  },
                  { 
                    header: "Avg. Value", 
                    accessorKey: "averageValue", 
                    cell: (row) => formatCurrency(row.averageValue) 
                  },
                  { 
                    header: "Wagering Complete %", 
                    accessorKey: "wageringCompletePercentage", 
                    cell: (row) => `${row.wageringCompletePercentage}%` 
                  },
                  { 
                    header: "ROI", 
                    accessorKey: "roi", 
                    cell: (row) => `${row.roi}%` 
                  }
                ]}
              />
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bonus ROI by Type</CardTitle>
              <CardDescription>Return on investment for different bonus types</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <BarChart
                  data={bonusAnalytics.map(bonus => ({
                    name: bonus.bonusType,
                    roi: bonus.roi
                  }))}
                  categories={["roi"]}
                  index="name"
                  valueFormatter={(value) => `${value}%`}
                  colors={["#10b981"]}
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Bonus Distribution</CardTitle>
              <CardDescription>Total bonus value by type</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PieChart
                  data={bonusAnalytics.map(bonus => ({
                    name: bonus.bonusType,
                    value: bonus.totalGiven
                  }))}
                  valueFormatter={formatCurrency}
                  colors={["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6"]}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Wagering Completion Rate</CardTitle>
            <CardDescription>Percentage of bonuses with completed wagering requirements</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <BarChart
                data={bonusAnalytics.map(bonus => ({
                  name: bonus.bonusType,
                  completed: bonus.wageringCompletePercentage,
                  incomplete: 100 - bonus.wageringCompletePercentage
                }))}
                categories={["completed", "incomplete"]}
                index="name"
                valueFormatter={(value) => `${value}%`}
                colors={["#10b981", "#ef4444"]}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
};

export default AnalyticsDashboard;

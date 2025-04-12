
import { useState, useEffect } from "react";
import { 
  Users, 
  DollarSign, 
  ShoppingBag,
  Loader2,
  TrendingUp,
  TrendingDown,
  UserPlus,
  UserCheck,
  Gift,
  ArrowUpDown,
  Calendar
} from "lucide-react";
import { 
  getDashboardStats, 
  getGameStats, 
  getProviderStats, 
  getRegionStats,
  getTransactionHistory
} from "@/services/dashboardService";
import { 
  DashboardStats, 
  GameStats, 
  ProviderStats, 
  RegionStats
} from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  AreaChart 
} from "@/components/ui/dashboard-charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState("overview");
  const { toast } = useToast();
  
  // State for all dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const stats = await getDashboardStats();
        const games = await getGameStats();
        const providers = await getProviderStats();
        const regions = await getRegionStats();
        
        // Get time period based on selection
        const days = timeRange === "today" ? 1 : 
                      timeRange === "yesterday" ? 2 :
                      timeRange === "7days" ? 7 :
                      timeRange === "30days" ? 30 : 90;
        
        const history = await getTransactionHistory(days);
        
        setDashboardStats(stats);
        setGameStats(games);
        setProviderStats(providers);
        setRegionStats(regions);
        setTimeSeriesData(history);
        
        toast({
          title: "Success",
          description: "Dashboard data loaded successfully",
          variant: "default"
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [timeRange, toast]);
  
  // Prepare data for charts
  const revenueChartData = timeSeriesData.map(item => ({
    date: item.date,
    GGR: item.bets - item.wins,
    Deposits: item.deposits,
    Withdrawals: item.withdrawals
  }));
  
  const usersChartData = timeSeriesData.map(item => ({
    date: item.date,
    "New Users": item.newUsers
  }));
  
  const transactionPieData = dashboardStats ? [
    { name: "Deposits", value: dashboardStats.totalDeposits },
    { name: "Withdrawals", value: dashboardStats.totalWithdrawals },
    { name: "Bonuses", value: dashboardStats.bonusAmount },
    { name: "GGR", value: dashboardStats.ggr }
  ] : [];
  
  const providerPieData = providerStats
    .slice(0, 5)
    .map(provider => ({
      name: provider.providerName,
      value: provider.netProfit
    }));
  
  const gamesPieData = gameStats
    .slice(0, 5)
    .map(game => ({
      name: game.gameName,
      value: game.netProfit
    }));
  
  const getPercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="py-8 px-4 bg-[#1A1F2C]">
      <div className="md:flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        
        <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-[#222333] border-gray-700 text-white">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent className="bg-[#222333] border-gray-700 text-white">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal bg-[#222333] border-gray-700 text-white",
                  !date && "text-gray-400"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <CalendarUI
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Tabs value={viewTab} onValueChange={setViewTab} className="space-y-4">
        <TabsList className="bg-[#222333]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
        </TabsList>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-casino-thunder-green" />
          </div>
        ) : (
          <>
            <TabsContent value="overview">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-[#222333] border-gray-700 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">GGR</CardTitle>
                    <CardDescription className="text-gray-400">Gross Gaming Revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(dashboardStats?.ggr || 0)}</div>
                    {dashboardStats && (
                      <div className="flex items-center text-green-500 text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+6.2% from previous period</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-[#222333] border-gray-700 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">NGR</CardTitle>
                    <CardDescription className="text-gray-400">Net Gaming Revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(dashboardStats?.ngr || 0)}</div>
                    {dashboardStats && (
                      <div className="flex items-center text-green-500 text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+4.8% from previous period</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-[#222333] border-gray-700 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Users</CardTitle>
                    <CardDescription className="text-gray-400">Registered users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats?.totalUsers || 0}</div>
                    {dashboardStats && (
                      <div className="flex items-center text-green-500 text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+3.5% from previous period</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-[#222333] border-gray-700 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Available Balance</CardTitle>
                    <CardDescription className="text-gray-400">Total user balances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(dashboardStats?.availableBalance || 0)}</div>
                    {dashboardStats && (
                      <div className="flex items-center text-green-500 text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+2.8% from previous period</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <Card className="bg-[#222333] border-gray-700 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active & New Users</CardTitle>
                    <CardDescription className="text-gray-400">User activity metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center">
                          <div className="bg-white/10 p-2 rounded-full mr-3">
                            <UserCheck className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Active Users</p>
                            <p className="text-xl font-semibold">{dashboardStats?.activeUsers || 0}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <div className="bg-white/10 p-2 rounded-full mr-3">
                            <UserPlus className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">New Users</p>
                            <p className="text-xl font-semibold">{dashboardStats?.newUsers || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <LineChart 
                      data={usersChartData}
                      categories={["New Users"]}
                      index="date"
                      height={200}
                      colors={['#00C49F']}
                      valueFormatter={(value) => `${value} users`}
                    />
                  </CardContent>
                </Card>
                
                <Card className="bg-[#222333] border-gray-700 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Transactions</CardTitle>
                    <CardDescription className="text-gray-400">Deposits, withdrawals and bonuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Deposits</p>
                        <p className="text-xl font-semibold">{formatCurrency(dashboardStats?.totalDeposits || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Withdrawals</p>
                        <p className="text-xl font-semibold">{formatCurrency(dashboardStats?.totalWithdrawals || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Bonuses</p>
                        <p className="text-xl font-semibold">{formatCurrency(dashboardStats?.bonusAmount || 0)}</p>
                      </div>
                    </div>
                    
                    <PieChart 
                      data={transactionPieData}
                      height={200}
                      valueFormatter={(value) => formatCurrency(value)}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-[#222333] border-gray-700 text-white mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Revenue Overview</CardTitle>
                  <CardDescription className="text-gray-400">GGR, deposits and withdrawals over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <AreaChart 
                    data={revenueChartData}
                    categories={["GGR", "Deposits", "Withdrawals"]}
                    index="date"
                    valueFormatter={(value) => formatCurrency(value)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="games">
              <Card className="bg-[#222333] border-gray-700 text-white mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Top Games Performance</CardTitle>
                  <CardDescription className="text-gray-400">Breakdown by net profit</CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChart 
                    data={gamesPieData}
                    valueFormatter={(value) => formatCurrency(value)}
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-[#222333] border-gray-700 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Game Performance Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Game</TableHead>
                        <TableHead className="text-gray-300">Provider</TableHead>
                        <TableHead className="text-gray-300">Total Bets</TableHead>
                        <TableHead className="text-gray-300">Total Wins</TableHead>
                        <TableHead className="text-gray-300">Net Profit</TableHead>
                        <TableHead className="text-gray-300">Players</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gameStats.map((game) => (
                        <TableRow key={game.gameId} className="border-gray-700">
                          <TableCell className="font-medium">{game.gameName}</TableCell>
                          <TableCell>{game.provider}</TableCell>
                          <TableCell>{formatCurrency(game.totalBets)}</TableCell>
                          <TableCell>{formatCurrency(game.totalWins)}</TableCell>
                          <TableCell className={game.netProfit >= 0 ? "text-green-500" : "text-red-500"}>
                            {formatCurrency(game.netProfit)}
                          </TableCell>
                          <TableCell>{game.uniquePlayers}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="providers">
              <Card className="bg-[#222333] border-gray-700 text-white mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Top Providers Performance</CardTitle>
                  <CardDescription className="text-gray-400">Breakdown by net profit</CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChart 
                    data={providerPieData}
                    valueFormatter={(value) => formatCurrency(value)}
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-[#222333] border-gray-700 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Provider Performance Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Provider</TableHead>
                        <TableHead className="text-gray-300">Total Games</TableHead>
                        <TableHead className="text-gray-300">Total Bets</TableHead>
                        <TableHead className="text-gray-300">Total Wins</TableHead>
                        <TableHead className="text-gray-300">Net Profit</TableHead>
                        <TableHead className="text-gray-300">Players</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {providerStats.map((provider) => (
                        <TableRow key={provider.providerId} className="border-gray-700">
                          <TableCell className="font-medium">{provider.providerName}</TableCell>
                          <TableCell>{provider.totalGames}</TableCell>
                          <TableCell>{formatCurrency(provider.totalBets)}</TableCell>
                          <TableCell>{formatCurrency(provider.totalWins)}</TableCell>
                          <TableCell className={provider.netProfit >= 0 ? "text-green-500" : "text-red-500"}>
                            {formatCurrency(provider.netProfit)}
                          </TableCell>
                          <TableCell>{provider.uniquePlayers}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="regions">
              <Card className="bg-[#222333] border-gray-700 text-white mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Regional Performance</CardTitle>
                  <CardDescription className="text-gray-400">Activity by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={regionStats.slice(0, 6).map(region => ({
                      region: region.region,
                      "Net Profit": region.netProfit,
                      "Bet Amount": region.betAmount,
                      "User Count": region.userCount * 100 // Scale for visualization
                    }))}
                    categories={["Net Profit", "Bet Amount", "User Count"]}
                    index="region"
                    valueFormatter={(value) => region.toString().includes("User") ? 
                      `${value / 100} users` : formatCurrency(value)}
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-[#222333] border-gray-700 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Region Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Region</TableHead>
                        <TableHead className="text-gray-300">Users</TableHead>
                        <TableHead className="text-gray-300">Deposits</TableHead>
                        <TableHead className="text-gray-300">Bets</TableHead>
                        <TableHead className="text-gray-300">Wins</TableHead>
                        <TableHead className="text-gray-300">Net Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regionStats.map((region) => (
                        <TableRow key={region.region} className="border-gray-700">
                          <TableCell className="font-medium">{region.region}</TableCell>
                          <TableCell>{region.userCount}</TableCell>
                          <TableCell>{formatCurrency(region.depositAmount)}</TableCell>
                          <TableCell>{formatCurrency(region.betAmount)}</TableCell>
                          <TableCell>{formatCurrency(region.winAmount)}</TableCell>
                          <TableCell className={region.netProfit >= 0 ? "text-green-500" : "text-red-500"}>
                            {formatCurrency(region.netProfit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default AdminDashboard;

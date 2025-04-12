import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  Package, 
  UserPlus, 
  ArrowUpDown,
  Percent,
  Award,
  Globe,
  BarChart as BarChartIcon,
  ListFilter
} from "lucide-react";
import { DashboardStats, GameStats, ProviderStats, RegionStats } from "@/types";
import { 
  getDashboardStats, 
  getGameStats, 
  getProviderStats, 
  getRegionStats, 
  getTransactionHistory, 
  getBonusStats
} from "@/services/dashboardService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  PieChart,
  LineChart,
  AreaChart
} from "@/components/ui/dashboard-charts";
import { DataTable } from "@/components/ui/data-table";

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [bonusStats, setBonusStats] = useState<any[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
    to: new Date(),
  })
  const [timeFrame, setTimeFrame] = useState<string>("Last Month");
  const [activeTab, setActiveTab] = useState("overview");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"charts" | "numbers">("charts");

  useEffect(() => {
    fetchDashboardStats();
    fetchGameStatistics();
    fetchProviderStatistics();
    fetchRegionStatistics();
    fetchBonusStatistics();
    fetchTimeSeriesData();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const stats = await getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const fetchGameStatistics = async () => {
    try {
      const gameData = await getGameStats();
      setGameStats(gameData);
    } catch (error) {
      console.error("Error fetching game statistics:", error);
    }
  };

  const fetchProviderStatistics = async () => {
    try {
      const providerData = await getProviderStats();
      setProviderStats(providerData);
    } catch (error) {
      console.error("Error fetching provider statistics:", error);
    }
  };

  const fetchRegionStatistics = async () => {
    try {
      const regionData = await getRegionStats();
      setRegionStats(regionData);
    } catch (error) {
      console.error("Error fetching region statistics:", error);
    }
  };

  const fetchBonusStatistics = async () => {
    try {
      const bonusData = await getBonusStats();
      setBonusStats(bonusData);
    } catch (error) {
      console.error("Error fetching bonus statistics:", error);
    }
  };

  const fetchTimeSeriesData = async () => {
    try {
      const data = await getTransactionHistory(30);
      setTimeSeriesData(data);
    } catch (error) {
      console.error("Error fetching time series data:", error);
    }
  };

  const handleTimeFrameChange = (value: string) => {
    setTimeFrame(value);
    const today = new Date();
    let fromDate: Date;

    switch (value) {
      case "Today":
        fromDate = today;
        setDate({ from: fromDate, to: today });
        break;
      case "Yesterday":
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 1);
        setDate({ from: fromDate, to: fromDate });
        break;
      case "Last 7 Days":
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 7);
        setDate({ from: fromDate, to: today });
        break;
      case "Last 30 Days":
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 30);
        setDate({ from: fromDate, to: today });
        break;
      case "This Month":
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        setDate({ from: fromDate, to: today });
        break;
      case "Last Month":
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        setDate({ from: fromDate, to: lastDayOfMonth });
        break;
      case "This Year":
        fromDate = new Date(today.getFullYear(), 0, 1);
        setDate({ from: fromDate, to: today });
        break;
      default:
        break;
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "$0";
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const renderDashboardSummary = () => {
    if (!dashboardStats) {
      return <div>Loading dashboard summary...</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Gaming Revenue (GGR)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats.ggr)}</div>
            <p className="text-xs text-muted-foreground">
              Total bets minus total wins
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Gaming Revenue (NGR)</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats.ngr)}</div>
            <p className="text-xs text-muted-foreground">
              GGR minus bonuses and taxes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats.volume)}</div>
            <p className="text-xs text-muted-foreground">
              Total amount wagered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonuses</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats.bonusAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Total bonus amount given to players
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxes</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats.taxes)}</div>
            <p className="text-xs text-muted-foreground">
              Total taxes paid on gaming revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats.totalDeposits)}</div>
            <p className="text-xs text-muted-foreground">
              All successful deposits made by users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats.totalWithdrawals)}</div>
            <p className="text-xs text-muted-foreground">
              All successful withdrawals made by users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats.availableBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Total player account balances
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Total number of registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.newUsers}</div>
            <p className="text-xs text-muted-foreground">
              Users registered in the last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Users with activity in the last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regionStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Total number of active regions
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Data table columns definition for numerical view
  const gameColumns = [
    { header: "Game", accessorKey: "gameName" },
    { header: "Provider", accessorKey: "provider" },
    { header: "Bets", accessorKey: "totalBets", cell: (row: GameStats) => formatCurrency(row.totalBets) },
    { header: "Wins", accessorKey: "totalWins", cell: (row: GameStats) => formatCurrency(row.totalWins) },
    { header: "NGR", accessorKey: "netProfit", cell: (row: GameStats) => formatCurrency(row.netProfit) },
    { header: "Players", accessorKey: "uniquePlayers" }
  ];

  const providerColumns = [
    { header: "Provider", accessorKey: "providerName" },
    { header: "Games", accessorKey: "totalGames" },
    { header: "Bets", accessorKey: "totalBets", cell: (row: ProviderStats) => formatCurrency(row.totalBets) },
    { header: "Wins", accessorKey: "totalWins", cell: (row: ProviderStats) => formatCurrency(row.totalWins) },
    { header: "NGR", accessorKey: "netProfit", cell: (row: ProviderStats) => formatCurrency(row.netProfit) },
    { header: "Players", accessorKey: "uniquePlayers" }
  ];

  const regionColumns = [
    { header: "Region", accessorKey: "region" },
    { header: "Players", accessorKey: "userCount" },
    { header: "Deposits", accessorKey: "depositAmount", cell: (row: RegionStats) => formatCurrency(row.depositAmount) },
    { header: "Bets", accessorKey: "betAmount", cell: (row: RegionStats) => formatCurrency(row.betAmount) },
    { header: "GGR", accessorKey: "netProfit", cell: (row: RegionStats) => formatCurrency(row.netProfit) }
  ];

  const bonusColumns = [
    { header: "Bonus Type", accessorKey: "type" },
    { header: "Count", accessorKey: "count" },
    { header: "Amount", accessorKey: "amount", cell: (row: any) => formatCurrency(row.amount) },
    { header: "Unique Users", accessorKey: "uniqueUsers" }
  ];

  const renderRevenueTimeData = () => {
    const data = prepareRevenueChartData();
    
    if (viewMode === "charts") {
      return (
        <AreaChart 
          data={data} 
          categories={["GGR", "NGR", "Bets"]} 
          index="name"
          stacked={false}
          valueFormatter={(value) => `$${value.toLocaleString()}`}
          height={350}
        />
      );
    } else {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Bets</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Wins</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">GGR</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">NGR</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((day, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{day.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(day.Bets)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(day.Wins)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(day.GGR)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(day.NGR)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  const prepareRevenueChartData = () => {
    if (!timeSeriesData.length) return [];
    
    return timeSeriesData.map(day => ({
      name: day.date,
      GGR: day.bets - day.wins,
      NGR: day.bets - day.wins - (day.bonuses || 0) - ((day.bets - day.wins) * 0.05), // Assuming 5% tax
      Bets: day.bets,
      Wins: day.wins
    }));
  };

  const prepareGameChartData = () => {
    return gameStats.slice(0, 5).map(game => ({
      name: game.gameName,
      NGR: game.netProfit,
      Bets: game.totalBets,
      Players: game.uniquePlayers
    }));
  };

  const prepareProviderChartData = () => {
    return providerStats.slice(0, 5).map(provider => ({
      name: provider.providerName,
      NGR: provider.netProfit,
      Games: provider.totalGames,
      Players: provider.uniquePlayers
    }));
  };

  const prepareRegionChartData = () => {
    return regionStats.slice(0, 5).map(region => ({
      name: region.region,
      NGR: region.netProfit,
      Users: region.userCount,
      Deposits: region.depositAmount
    }));
  };

  const prepareBonusPieData = () => {
    return bonusStats.map(bonus => ({
      name: bonus.type,
      value: bonus.amount
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="flex items-center space-x-2">
          <div className="flex bg-white/5 rounded-md p-1 mr-2">
            <Button
              variant={viewMode === "charts" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("charts")}
              className="flex items-center"
            >
              <BarChartIcon className="h-4 w-4 mr-1" />
              Charts
            </Button>
            <Button
              variant={viewMode === "numbers" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("numbers")}
              className="flex items-center"
            >
              <ListFilter className="h-4 w-4 mr-1" />
              Numbers
            </Button>
          </div>
          
          <Select value={timeFrame} onValueChange={handleTimeFrameChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Yesterday">Yesterday</SelectItem>
              <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
              <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
              <SelectItem value="Last Month">Last Month</SelectItem>
              <SelectItem value="This Year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                onClick={() => setIsCalendarOpen(true)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    `${format(date.from, "MMM dd, yyyy")} - ${format(date.to, "MMM dd, yyyy")}`
                  ) : (
                    format(date.from, "MMM dd, yyyy")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  if (newDate?.from && newDate?.to) {
                    setIsCalendarOpen(false);
                  }
                }}
                numberOfMonths={2}
                pagedNavigation
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {renderDashboardSummary()}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {renderRevenueTimeData()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Weekly Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {viewMode === "charts" ? (
                  <LineChart 
                    data={prepareRevenueChartData().slice(-7)}
                    categories={["GGR", "NGR", "Bets", "Wins"]}
                    index="name"
                    valueFormatter={(value) => `$${value.toLocaleString()}`}
                    height={350}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Bets</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Wins</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">GGR</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">NGR</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {prepareRevenueChartData().slice(-7).map((day, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{day.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(day.Bets)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(day.Wins)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(day.GGR)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(day.NGR)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="games">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top Games by NGR</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {viewMode === "charts" ? (
                  <BarChart 
                    data={prepareGameChartData()}
                    categories={["NGR"]}
                    index="name"
                    valueFormatter={(value) => `$${value.toLocaleString()}`}
                    height={350}
                  />
                ) : (
                  <DataTable data={gameStats.slice(0, 10)} columns={gameColumns} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Game Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable data={gameStats} columns={gameColumns} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="providers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top Providers by NGR</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {viewMode === "charts" ? (
                  <BarChart 
                    data={prepareProviderChartData()}
                    categories={["NGR"]}
                    index="name"
                    valueFormatter={(value) => `$${value.toLocaleString()}`}
                    height={350}
                  />
                ) : (
                  <DataTable data={providerStats.slice(0, 10)} columns={providerColumns} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Provider Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable data={providerStats} columns={providerColumns} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="regions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top Regions by NGR</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {viewMode === "charts" ? (
                  <BarChart 
                    data={prepareRegionChartData()}
                    categories={["NGR"]}
                    index="name"
                    valueFormatter={(value) => `$${value.toLocaleString()}`}
                    height={350}
                  />
                ) : (
                  <DataTable data={regionStats.slice(0, 10)} columns={regionColumns} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Region Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable data={regionStats} columns={regionColumns} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="bonuses">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Bonus Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {viewMode === "charts" ? (
                  <PieChart 
                    data={prepareBonusPieData()}
                    valueFormatter={(value) => `$${value.toLocaleString()}`}
                    height={350}
                  />
                ) : (
                  <DataTable data={bonusStats} columns={bonusColumns} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Bonus Details</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable data={bonusStats} columns={bonusColumns} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, ShoppingCart, CreditCard, BarChart, Package, UserPlus } from "lucide-react";
import { DashboardStats, GameStats, ProviderStats, RegionStats } from "@/types";
import { getDashboardStats, getGameStats, getProviderStats, getRegionStats } from "@/services/apiService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
    to: new Date(),
  })
  const [timeFrame, setTimeFrame] = useState<string>("Last Month");

  useEffect(() => {
    fetchDashboardStats();
    fetchGameStatistics();
    fetchProviderStatistics();
    fetchRegionStatistics();
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
              Total revenue from all bets
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
              Revenue after deducting bonuses and taxes
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
              Number of users registered in the selected period
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGameStatsTable = () => {
    return (
      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Game</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Provider</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Bets</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Wins</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Net Profit</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {gameStats.map(game => (
              <tr key={game.gameId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{game.gameName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{game.provider}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{game.totalBets}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{game.totalWins}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{game.netProfit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderProviderStatsTable = () => {
    return (
      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Provider</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Games</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Bets</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Wins</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Net Profit</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {providerStats.map(provider => (
              <tr key={provider.providerId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{provider.providerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{provider.totalGames}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{provider.totalBets}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{provider.totalWins}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{provider.netProfit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRegionStatsTable = () => {
    return (
      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Region</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Players</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Deposits</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">GGR</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {regionStats.map((regionStat) => (
              <tr key={regionStat.region}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{regionStat.region}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{regionStat.userCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${regionStat.depositAmount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${regionStat.netProfit.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const gameChartData = {
    labels: gameStats.map(game => game.gameName),
    datasets: [
      {
        label: 'Net Profit',
        data: gameStats.map(game => game.netProfit),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
    ],
  };

  const providerChartData = {
    labels: providerStats.map(provider => provider.providerName),
    datasets: [
      {
        label: 'Net Profit',
        data: providerStats.map(provider => provider.netProfit),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff'
        }
      },
      title: {
        display: true,
        text: 'Game and Provider Performance',
        color: '#fff'
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="flex items-center space-x-2">
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
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
                onSelect={setDate}
                numberOfMonths={2}
                pagedNavigation
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {renderDashboardSummary()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Game Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={gameChartData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provider Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={providerChartData} options={chartOptions} />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Top Performing Games</h2>
        {renderGameStatsTable()}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Top Performing Providers</h2>
        {renderProviderStatsTable()}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Regional Performance</h2>
        {renderRegionStatsTable()}
      </div>
    </div>
  );
};

export default Dashboard;

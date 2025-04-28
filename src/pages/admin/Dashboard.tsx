import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Users, TrendingUp, DollarSign } from "lucide-react";
import { 
  Chart, 
  LineChart, 
  BarChart, 
  PieChart 
} from "@/components/ui/dashboard-charts";
import { 
  getDashboardStats, 
  getGameStats, 
  getProviderStats, 
  getRegionStats,
  getTransactionHistory,
  getBonusStats
} from "@/services/dashboardService";
import { DashboardStats, GameStats, ProviderStats, RegionStats } from "@/types";

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [bonusStats, setBonusStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
        
        const games = await getGameStats();
        setGameStats(games);
        
        const providers = await getProviderStats();
        setProviderStats(providers);
        
        const regions = await getRegionStats();
        setRegionStats(regions);
        
        // Fetch transaction history for charts
        const history = await getTransactionHistory(30);
        setTransactionHistory(history);
        
        // Fetch bonus stats
        const bonuses = await getBonusStats();
        setBonusStats(bonuses);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-t-primary border-slate-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your casino performance</p>
      </div>
      
      {/* Key metrics section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 10) + 1}% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 15) + 5}% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBets?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 20) + 10}% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AVG Bet Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.avgBetSize?.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 8) + 2}% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Revenue Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Daily revenue for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionHistory.length > 0 && (
            <Chart>
              <LineChart 
                data={transactionHistory.map(day => ({
                  name: day.date,
                  Deposits: day.deposits,
                  Withdrawals: -day.withdrawals,
                  Net: day.deposits - day.withdrawals
                }))}
                categories={["Deposits", "Withdrawals", "Net"]}
                index="name"
                colors={["green", "red", "blue"]}
                valueFormatter={(value) => `$${Math.abs(value).toLocaleString()}`}
              />
            </Chart>
          )}
        </CardContent>
      </Card>
      
      {/* Tabs for different insights */}
      <Tabs defaultValue="games" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
        </TabsList>
        
        {/* Games Tab */}
        <TabsContent value="games" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Most Played Games</CardTitle>
                <CardDescription>Top 5 games by play count</CardDescription>
              </CardHeader>
              <CardContent>
                {gameStats.length > 0 && gameStats[0].mostPlayed.length > 0 && (
                  <Chart>
                    <BarChart
                      data={gameStats[0].mostPlayed.map(game => ({
                        name: game.name,
                        value: game.count
                      }))}
                      categories={["value"]}
                      index="name"
                      colors={["blue"]}
                      valueFormatter={(value) => `${value.toLocaleString()} plays`}
                    />
                  </Chart>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Highest Wins</CardTitle>
                <CardDescription>Games with highest win amounts</CardDescription>
              </CardHeader>
              <CardContent>
                {gameStats.length > 0 && gameStats[0].highestWin.length > 0 && (
                  <Chart>
                    <BarChart
                      data={gameStats[0].highestWin.map(game => ({
                        name: game.name,
                        value: game.amount
                      }))}
                      categories={["value"]}
                      index="name"
                      colors={["green"]}
                      valueFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                  </Chart>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Popular Categories</CardTitle>
                <CardDescription>Game categories by popularity</CardDescription>
              </CardHeader>
              <CardContent>
                {gameStats.length > 0 && gameStats[0].popularCategories.length > 0 && (
                  <Chart>
                    <PieChart
                      data={gameStats[0].popularCategories.map(category => ({
                        name: category.name,
                        value: category.count
                      }))}
                    />
                  </Chart>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gameStats[0]?.totalBets?.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gameStats[0]?.totalWins?.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${gameStats[0]?.netProfit?.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unique Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gameStats[0]?.uniquePlayers?.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Provider Revenue</CardTitle>
                <CardDescription>Top providers by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {providerStats.length > 0 && providerStats[0].revenue.length > 0 && (
                  <Chart>
                    <BarChart
                      data={providerStats[0].revenue.map(provider => ({
                        name: provider.name,
                        value: provider.amount
                      }))}
                      categories={["value"]}
                      index="name"
                      colors={["blue"]}
                      valueFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                  </Chart>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Provider Bet Count</CardTitle>
                <CardDescription>Number of bets by provider</CardDescription>
              </CardHeader>
              <CardContent>
                {providerStats.length > 0 && providerStats[0].bets.length > 0 && (
                  <Chart>
                    <BarChart
                      data={providerStats[0].bets.map(provider => ({
                        name: provider.name,
                        value: provider.count
                      }))}
                      categories={["value"]}
                      index="name"
                      colors={["purple"]}
                      valueFormatter={(value) => `${value.toLocaleString()} bets`}
                    />
                  </Chart>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Provider Win Rate</CardTitle>
                <CardDescription>RTP percentage by provider</CardDescription>
              </CardHeader>
              <CardContent>
                {providerStats.length > 0 && providerStats[0].winRate.length > 0 && (
                  <Chart>
                    <BarChart
                      data={providerStats[0].winRate.map(provider => ({
                        name: provider.name,
                        value: provider.rate
                      }))}
                      categories={["value"]}
                      index="name"
                      colors={["green"]}
                      valueFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                  </Chart>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{providerStats[0]?.totalGames?.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{providerStats[0]?.totalBets?.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{providerStats[0]?.totalWins?.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${providerStats[0]?.netProfit?.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Regions Tab */}
        <TabsContent value="regions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Users by Country</CardTitle>
                <CardDescription>User distribution by country</CardDescription>
              </CardHeader>
              <CardContent>
                {regionStats.length > 0 && regionStats[0].usersByCountry.length > 0 && (
                  <Chart>
                    <PieChart
                      data={regionStats[0].usersByCountry.map(country => ({
                        name: country.country,
                        value: country.users
                      }))}
                    />
                  </Chart>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Revenue by Country</CardTitle>
                <CardDescription>Revenue distribution by country</CardDescription>
              </CardHeader>
              <CardContent>
                {regionStats.length > 0 && regionStats[0].revenueByCountry.length > 0 && (
                  <Chart>
                    <BarChart
                      data={regionStats[0].revenueByCountry.map(country => ({
                        name: country.country,
                        value: country.revenue
                      }))}
                      categories={["value"]}
                      index="name"
                      colors={["blue"]}
                      valueFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                  </Chart>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Sessions by region</CardDescription>
              </CardHeader>
              <CardContent>
                {regionStats.length > 0 && regionStats[0].activeSessionsByRegion.length > 0 && (
                  <Chart>
                    <PieChart
                      data={regionStats[0].activeSessionsByRegion.map(region => ({
                        name: region.region,
                        value: region.sessions
                      }))}
                    />
                  </Chart>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{regionStats[0]?.userCount?.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Deposit Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${regionStats[0]?.depositAmount?.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Bet Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${regionStats[0]?.betAmount?.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${regionStats[0]?.netProfit?.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Bonuses Tab */}
        <TabsContent value="bonuses" className="space-y-4">
          {bonusStats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Bonus Distribution</CardTitle>
                  <CardDescription>Bonus amounts by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart>
                    <PieChart
                      data={bonusStats.bonusByType}
                      category="value"
                      index="name"
                      valueFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                  </Chart>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Active Bonuses</CardTitle>
                  <CardDescription>Currently active bonuses</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-center">{bonusStats.activeBonuses}</div>
                  <p className="text-center text-muted-foreground mt-2">active bonuses</p>
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Conversion Rate:</span>
                      <span className="font-medium">{bonusStats.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Awarded:</span>
                      <span className="font-medium">${bonusStats.totalAwarded}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average Value:</span>
                      <span className="font-medium">${bonusStats.averageBonusValue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Recent Bonuses</CardTitle>
                  <CardDescription>Recently awarded bonuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bonusStats.recentBonuses.map((bonus: any) => (
                      <div key={bonus.id} className="flex justify-between items-center border-b border-slate-700 pb-2 last:border-0">
                        <div>
                          <div className="capitalize font-medium">{bonus.type} Bonus</div>
                          <div className="text-xs text-muted-foreground">User: {bonus.userId}</div>
                        </div>
                        <div className="text-green-500 font-medium">${bonus.amount}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

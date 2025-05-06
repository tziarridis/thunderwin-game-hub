
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import analyticsService from "@/services/analyticsService";
import { AnalyticsData, GameAnalytics, UserGrowthData } from "@/types/analytics";

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dailyStats, setDailyStats] = useState<AnalyticsData[]>([]);
  const [gameStats, setGameStats] = useState<GameAnalytics[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [bonusStats, setBonusStats] = useState({
    totalBonusesIssued: 0,
    bonusAmountAwarded: 0,
    bonusTurnoverGenerated: 0,
    wageringCompleted: 0
  });

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        // Fetch all analytics data on component mount
        const dailyData = await analyticsService.fetchDailyAnalytics();
        setDailyStats(dailyData);
        
        const gameData = await analyticsService.fetchGameAnalytics();
        setGameStats(gameData);
        
        const userData = await analyticsService.fetchUserGrowthData();
        setUserGrowth(userData);
        
        const bonusData = await analyticsService.fetchBonusAnalytics();
        setBonusStats(bonusData);
      } catch (error) {
        console.error("Error loading analytics data:", error);
      }
    };
    
    loadAnalyticsData();
  }, []);

  // Format data for the user growth chart with revenue data
  const userGrowthData = userGrowth.map(day => ({
    date: day.date,
    active: day.active,
    new: day.new
  }));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-4 mb-6 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Key metrics cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Revenue</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${dailyStats.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Players</CardTitle>
                <CardDescription>Unique players yesterday</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{dailyStats.length > 0 ? dailyStats[dailyStats.length - 1].activeUsers : 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">New Registrations</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{dailyStats.reduce((sum, day) => sum + day.newUsers, 0)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Profit Margin</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyStats.length > 0 ? (
                  <p className="text-2xl font-bold">
                    {((dailyStats.reduce((sum, day) => sum + (day.bets - day.wins), 0) / 
                    dailyStats.reduce((sum, day) => sum + day.bets, 0)) * 100).toFixed(1)}%
                  </p>
                ) : (
                  <p className="text-2xl font-bold">0%</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Revenue chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Revenue & Player Activity</CardTitle>
              <CardDescription>Daily revenue vs active players</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="activeUsers" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="players">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Player Growth</CardTitle>
                <CardDescription>Active and new players over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="active" stroke="#8884d8" />
                      <Line type="monotone" dataKey="new" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Deposit & Withdrawal Analysis</CardTitle>
                <CardDescription>Financial transactions overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="deposits" fill="#8884d8" />
                      <Bar dataKey="withdrawals" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="games">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Game Performance</CardTitle>
                <CardDescription>Top games by bets and player count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gameStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="gameName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalBets" fill="#8884d8" />
                      <Bar dataKey="uniquePlayers" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="bonuses">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Bonuses</CardTitle>
                <CardDescription>Issued this month</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{bonusStats.totalBonusesIssued}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Bonus Value</CardTitle>
                <CardDescription>Total awarded</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${bonusStats.bonusAmountAwarded.toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Wagering Generated</CardTitle>
                <CardDescription>From bonuses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${bonusStats.bonusTurnoverGenerated.toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Wagering Completed</CardTitle>
                <CardDescription>Percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {bonusStats.bonusTurnoverGenerated ? 
                    `${((bonusStats.wageringCompleted / bonusStats.bonusTurnoverGenerated) * 100).toFixed(1)}%` : 
                    '0%'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;

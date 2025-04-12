
import { useState } from "react";
import { Affiliate } from "@/types";
import { 
  BarChart, 
  PieChart
} from "@/components/ui/chart";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Calendar, 
  TrendingUp, 
  User, 
  DollarSign,
  Users,
  Clock 
} from "lucide-react";

interface AffiliateStatsProps {
  affiliate?: Affiliate;
}

// Generate sample historical data for the charts
const generateMonthlyData = (affiliate?: Affiliate) => {
  const today = new Date();
  const months = [];
  const signupsBase = affiliate?.signups || 30;
  const revenueBase = affiliate?.totalRevenue || 5000;
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const signups = Math.max(0, Math.floor(signupsBase / 6) + Math.floor(Math.random() * 10) - 5);
    const revenue = Math.max(0, Math.floor(revenueBase / 6) + Math.floor(Math.random() * 300) - 150);
    
    months.push({
      name: month.toLocaleString('default', { month: 'short' }),
      signups: signups,
      revenue: revenue,
      commission: Math.floor(revenue * ((affiliate?.commission || 20) / 100))
    });
  }
  return months;
};

const generateTrafficSourceData = () => {
  return [
    { name: 'Blog', value: 35 },
    { name: 'Social', value: 25 },
    { name: 'Email', value: 20 },
    { name: 'Direct', value: 15 },
    { name: 'Other', value: 5 },
  ];
};

const generateDailyData = (affiliate?: Affiliate) => {
  const days = [];
  const today = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    
    days.push({
      name: day.getDate().toString(),
      clicks: Math.floor(Math.random() * 50),
      signups: Math.floor(Math.random() * 5),
      revenue: Math.floor(Math.random() * 200)
    });
  }
  
  return days;
};

const AffiliateStats = ({ affiliate }: AffiliateStatsProps) => {
  const [timeframe, setTimeframe] = useState<"daily" | "monthly">("monthly");
  
  const monthlyData = generateMonthlyData(affiliate);
  const dailyData = generateDailyData(affiliate);
  const trafficSourceData = generateTrafficSourceData();
  
  const data = timeframe === "monthly" ? monthlyData : dailyData;
  
  const signups = affiliate?.signups || affiliate?.referredUsers || 0;
  const totalRevenue = affiliate?.totalRevenue || 0;
  const commission = affiliate?.commission || 20;
  
  const conversionRate = signups > 0 
    ? ((totalRevenue / signups)).toFixed(2)
    : "0.00";
  
  const commissionEarned = (totalRevenue * (commission / 100)).toFixed(2);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{affiliate?.name || "Affiliate Overview"}</h2>
          <p className="text-muted-foreground">{affiliate?.email || "All affiliates"} • {affiliate?.joinedDate ? `Joined ${affiliate.joinedDate}` : "Overview"}</p>
        </div>
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as "daily" | "monthly")}>
          <TabsList>
            <TabsTrigger value="daily">
              <Clock className="h-4 w-4 mr-2" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="monthly">
              <Calendar className="h-4 w-4 mr-2" />
              Monthly
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{signups}</div>
            <p className="text-xs text-muted-foreground mt-1">Referred players</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total player deposits</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">${commissionEarned}</div>
            <p className="text-xs text-muted-foreground mt-1">At {commission}% rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">${conversionRate}</div>
            <p className="text-xs text-muted-foreground mt-1">Revenue per signup</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="performance">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="performance">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="traffic">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Traffic Sources
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Signups Over Time</CardTitle>
              <CardDescription>Number of new players referred</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart 
                data={data}
                index="name"
                categories={["signups"]}
                colors={["#8884d8"]}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Commission</CardTitle>
              <CardDescription>Revenue generated and commission earned over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart
                data={data}
                index="name"
                categories={["revenue", "commission"]}
                colors={["#8884d8", "#82ca9d"]}
                valueFormatter={(value) => `$${value}`}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where affiliate traffic is coming from</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <PieChart data={trafficSourceData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateStats;

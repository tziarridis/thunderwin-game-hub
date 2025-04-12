
import { useState } from "react";
import { Affiliate } from "@/types";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
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
  affiliate: Affiliate;
}

// Generate sample historical data for the charts
const generateMonthlyData = (affiliate: Affiliate) => {
  const today = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const signups = Math.max(0, Math.floor(affiliate.signups / 6) + Math.floor(Math.random() * 10) - 5);
    const revenue = Math.max(0, Math.floor(affiliate.totalRevenue / 6) + Math.floor(Math.random() * 300) - 150);
    
    months.push({
      name: month.toLocaleString('default', { month: 'short' }),
      signups: signups,
      revenue: revenue,
      commission: Math.floor(revenue * (affiliate.commission / 100))
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

const generateDailyData = (affiliate: Affiliate) => {
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
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const data = timeframe === "monthly" ? monthlyData : dailyData;
  
  const conversionRate = affiliate.signups > 0 
    ? ((affiliate.totalRevenue / affiliate.signups)).toFixed(2)
    : "0.00";
  
  const commissionEarned = (affiliate.totalRevenue * (affiliate.commission / 100)).toFixed(2);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{affiliate.name}</h2>
          <p className="text-muted-foreground">{affiliate.email} • Joined {affiliate.joinedDate}</p>
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
            <div className="text-2xl font-bold">{affiliate.signups}</div>
            <p className="text-xs text-muted-foreground mt-1">Referred players</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">${affiliate.totalRevenue.toLocaleString()}</div>
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
            <p className="text-xs text-muted-foreground mt-1">At {affiliate.commission}% rate</p>
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
              <CardDescription>Number of new players referred by {affiliate.name}</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="signups" name="Signups" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#8884d8" />
                  <Line type="monotone" dataKey="commission" name="Commission" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {trafficSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateStats;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, TrendingUp, DollarSign } from "lucide-react";
import { 
  Chart as ChartComponent, 
  LineChart, 
  BarChart, 
  PieChart,
  DonutChart,
  AreaChart 
} from "@/components/ui/dashboard-charts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataItem {
  name: string;
  value: number;
}

const Dashboard = () => {
  const [timeFrame, setTimeFrame] = useState("7d");
  const [revenueData, setRevenueData] = useState<DataItem[]>([
    { name: "Mon", value: 2400 },
    { name: "Tue", value: 1398 },
    { name: "Wed", value: 9800 },
    { name: "Thu", value: 3908 },
    { name: "Fri", value: 4800 },
    { name: "Sat", value: 3800 },
    { name: "Sun", value: 4300 },
  ]);

  const [trafficData, setTrafficData] = useState<DataItem[]>([
    { name: "Mon", value: 1400 },
    { name: "Tue", value: 2398 },
    { name: "Wed", value: 8800 },
    { name: "Thu", value: 2908 },
    { name: "Fri", value: 3800 },
    { name: "Sat", value: 2800 },
    { name: "Sun", value: 3300 },
  ]);

  const [depositMethodsData, setDepositMethodsData] = useState<DataItem[]>([
    { name: "Credit Card", value: 4500 },
    { name: "PayPal", value: 2300 },
    { name: "Bank Transfer", value: 1500 },
    { name: "Crypto", value: 1200 },
  ]);

  const [userActivityData, setUserActivityData] = useState<DataItem[]>([
    { name: "Page A", value: 4000 },
    { name: "Page B", value: 3000 },
    { name: "Page C", value: 2000 },
    { name: "Page D", value: 2780 },
    { name: "Page E", value: 1890 },
    { name: "Page F", value: 2390 },
    { name: "Page G", value: 3490 },
  ]);

  const handleTimeFrameChange = (value: string) => {
    setTimeFrame(value);
    // In a real application, you would fetch data based on the selected time frame
    // For this example, we'll just log the selected time frame
    console.log(`Time frame changed to: ${value}`);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-md rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bets</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$32,231.89</div>
            <p className="text-xs text-muted-foreground">
              +12.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <Select onValueChange={handleTimeFrameChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md rounded-md">
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={revenueData} 
                  categories={["value"]} 
                  index="name" 
                  valueFormatter={(value) => `$${value.toLocaleString()}`} 
                />
              </CardContent>
            </Card>
            <Card className="shadow-md rounded-md">
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={trafficData} 
                  categories={["value"]} 
                  index="name" 
                  valueFormatter={(value) => `${value.toLocaleString()} visits`} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md rounded-md">
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={userActivityData}
                  categories={["value"]}
                  index="name"
                  valueFormatter={(value) => `${value.toLocaleString()} activities`}
                />
              </CardContent>
            </Card>
            <Card className="shadow-md rounded-md">
              <CardHeader>
                <CardTitle>Deposit Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={depositMethodsData}
                  colors={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-4">Reports</h2>
            <p>This is where you can generate custom reports.</p>
            <Button>Generate Report</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

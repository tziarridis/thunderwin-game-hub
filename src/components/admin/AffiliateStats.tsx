
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Affiliate } from "@/types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { LineChart, Line } from 'recharts';
import { DollarSign, Users, TrendingUp, Activity } from "lucide-react";

interface AffiliateStatsProps {
  affiliates: Affiliate[];
}

const AffiliateStats = ({ affiliates }: AffiliateStatsProps) => {
  const [totalSignups, setTotalSignups] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [performance, setPerformance] = useState<any[]>([]);
  
  useEffect(() => {
    if (affiliates.length > 0) {
      // Calculate total signups
      const signups = affiliates.reduce((sum, affiliate) => sum + (affiliate.signups || 0), 0);
      setTotalSignups(signups);
      
      // Calculate total commission
      const commission = affiliates.reduce((sum, affiliate) => sum + (affiliate.totalCommissions || 0), 0);
      setTotalCommission(commission);
      
      // Calculate conversion rate
      const visits = 1000; // Mock data for total visits
      setConversionRate(signups > 0 ? Math.round((signups / visits) * 100) : 0);
      
      // Create performance data
      const topPerformers = affiliates
        .sort((a, b) => (b.totalCommissions || 0) - (a.totalCommissions || 0))
        .slice(0, 5)
        .map(affiliate => ({
          name: affiliate.name,
          commission: affiliate.totalCommissions || 0,
          signups: affiliate.signups || 0
        }));
        
      setPerformance(topPerformers);
    }
  }, [affiliates]);
  
  // Create trend data (mock for now)
  const trendData = [
    { name: 'Jan', signups: 10, commission: 800 },
    { name: 'Feb', signups: 15, commission: 1200 },
    { name: 'Mar', signups: 25, commission: 2000 },
    { name: 'Apr', signups: 30, commission: 2400 },
    { name: 'May', signups: 40, commission: 3200 },
    { name: 'Jun', signups: 50, commission: 4000 },
  ];
  
  const pieData = [
    { name: 'Facebook', value: 35 },
    { name: 'Google', value: 25 },
    { name: 'Direct', value: 20 },
    { name: 'Bloggers', value: 15 },
    { name: 'Other', value: 5 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };
  
  // Helper to safely check if value is number
  const isNumber = (value: any): value is number => {
    return typeof value === 'number';
  };
  
  // Helper to get growth percentage
  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };
  
  // Get growth for signups - mocked previous value for demonstration
  const signupsGrowth = getGrowthPercentage(totalSignups, 45);
  
  // Get growth for commission - mocked previous value for demonstration
  const commissionGrowth = getGrowthPercentage(totalCommission, 3200);
  
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliates.length}</div>
            <p className="text-xs text-muted-foreground">
              {isNumber(signupsGrowth) ? (
                <>
                  <span className={signupsGrowth > 0 ? "text-green-500" : signupsGrowth < 0 ? "text-red-500" : ""}>
                    {signupsGrowth > 0 ? `+${signupsGrowth}%` : `${signupsGrowth}%`}
                  </span>
                  {" from last month"}
                </>
              ) : "No growth data"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSignups}</div>
            <p className="text-xs text-muted-foreground">
              {isNumber(signupsGrowth) ? (
                <>
                  <span className={signupsGrowth > 0 ? "text-green-500" : signupsGrowth < 0 ? "text-red-500" : ""}>
                    {signupsGrowth > 0 ? `+${signupsGrowth}%` : `${signupsGrowth}%`}
                  </span>
                  {" from last month"}
                </>
              ) : "No growth data"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
            <p className="text-xs text-muted-foreground">
              {isNumber(commissionGrowth) ? (
                <>
                  <span className={commissionGrowth > 0 ? "text-green-500" : commissionGrowth < 0 ? "text-red-500" : ""}>
                    {commissionGrowth > 0 ? `+${commissionGrowth}%` : `${commissionGrowth}%`}
                  </span>
                  {" from last month"}
                </>
              ) : "No growth data"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              From total site visitors
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Trends and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Commission Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Commission Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Commission']} />
                  <Line type="monotone" dataKey="commission" stroke="#0ea5e9" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Affiliates Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Affiliates Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#0ea5e9" />
                <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
                <Tooltip formatter={(value, name) => [name === 'commission' ? formatCurrency(Number(value)) : value, name === 'commission' ? 'Commission' : 'Signups']} />
                <Bar yAxisId="left" dataKey="commission" fill="#0ea5e9" name="Commission" />
                <Bar yAxisId="right" dataKey="signups" fill="#22c55e" name="Signups" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateStats;

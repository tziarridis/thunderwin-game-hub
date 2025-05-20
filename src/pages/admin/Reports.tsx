import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, BarChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Bar } from 'recharts';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { dashboardService } from '@/services/dashboardService'; // Assuming this service provides report data
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RevenueDataPoint, UserStatsDataPoint, GamePopularityDataPoint, TransactionVolumeDataPoint, TopPerformingDataPoint, PlayerActivityDataPoint, PromotionEffectivenessDataPoint, RegionalPerformanceDataPoint } from '@/types/analytics'; // Ensure these types are defined

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9d'];

const AdminReports: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return { from: startDate, to: endDate };
  });
  const [timePeriod, setTimePeriod] = useState<string>('last30days');

  // State for various report data
  const [revenueReport, setRevenueReport] = useState<RevenueDataPoint[]>([]);
  const [userAcquisitionReport, setUserAcquisitionReport] = useState<UserStatsDataPoint[]>([]);
  const [gamePerformanceReport, setGamePerformanceReport] = useState<GamePopularityDataPoint[]>([]);
  const [transactionAnalysis, setTransactionAnalysis] = useState<TransactionVolumeDataPoint[]>([]);
  const [topPerformingAffiliates, setTopPerformingAffiliates] = useState<TopPerformingDataPoint[]>([]);
  const [playerActivityBySegment, setPlayerActivityBySegment] = useState<PlayerActivityDataPoint[]>([]);
  const [promotionEffectiveness, setPromotionEffectiveness] = useState<PromotionEffectivenessDataPoint[]>([]);
  const [regionalPerformance, setRegionalPerformance] = useState<RegionalPerformanceDataPoint[]>([]);


  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const from = dateRange?.from;
        const to = dateRange?.to;
        if (!from || !to) {
          toast.warn("Please select a valid date range.");
          setIsLoading(false);
          return;
        }

        const [
            revenue, userAcq, gamePerf, transAnalysis, affiliates, playerActivity, promoEffective, regionalPerf
        ] = await Promise.all([
          dashboardService.getRevenueData({from, to, granularity: 'daily'}),
          dashboardService.getUserStatsData({from, to, granularity: 'daily'}),
          dashboardService.getGamePopularityData({from, to, limit: 10}),
          dashboardService.getTransactionVolumeData({from, to, granularity: 'daily'}),
          dashboardService.getTopAffiliates({from, to, limit: 5}),
          dashboardService.getPlayerActivitySegments({from, to}),
          dashboardService.getPromotionEffectiveness({from, to, limit: 5}),
          dashboardService.getRegionalPerformance({from, to, limit: 5}),
        ]);
        
        setRevenueReport(revenue);
        setUserAcquisitionReport(userAcq);
        setGamePerformanceReport(gamePerf);
        setTransactionAnalysis(transAnalysis);
        setTopPerformingAffiliates(affiliates);
        setPlayerActivityBySegment(playerActivity);
        setPromotionEffectiveness(promoEffective);
        setRegionalPerformance(regionalPerf);

      } catch (err: any) {
        console.error("Failed to load report data:", err);
        setError(err.message || 'Failed to load reports. Please try again.');
        toast.error(err.message || 'Failed to load reports.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [dateRange]);
  
  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value);
    const to = new Date();
    let from = new Date();
    switch (value) {
      case 'last7days': from.setDate(to.getDate() - 7); break;
      case 'last30days': from.setDate(to.getDate() - 30); break;
      case 'lastQuarter': from.setMonth(to.getMonth() - 3); break;
      case 'thisYear': from = new Date(to.getFullYear(), 0, 1); break;
      default: from.setDate(to.getDate() - 30); 
    }
    setDateRange({ from, to });
  };

  const handleExport = (data: any[], reportName: string) => {
    if (!data || data.length === 0) {
      toast.info(`No data to export for ${reportName}.`);
      return;
    }
    // Basic CSV export
    const headers = Object.keys(data[0]).join(',');
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers + "\n"
        + data.map(e => Object.values(e).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName.toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${reportName} exported successfully.`);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-theme(space.24))]"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <span className="ml-3 text-lg">Generating Reports...</span></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Generating Reports</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Comprehensive Reports</h1>
        <div className="flex items-center space-x-2">
            <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                    <SelectItem value="thisYear">This Year</SelectItem>
                </SelectContent>
            </Select>
            <DateRangePicker 
                initialDateFrom={dateRange?.from} 
                initialDateTo={dateRange?.to}
                onUpdate={values => setDateRange(values.range)} 
                align="end"
            />
        </div>
      </div>

      {/* Revenue Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Revenue Report</CardTitle>
            <CardDescription>Total revenue generated over the selected period.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleExport(revenueReport, "Revenue Report")} disabled={revenueReport.length === 0}>
            <Download className="mr-2 h-4 w-4"/> Export
          </Button>
        </CardHeader>
        <CardContent className="pl-2">
          {revenueReport.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={revenueReport}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', {month:'short', day:'numeric'})} />
                <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Total Revenue" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (<p className="text-muted-foreground text-center py-10">No revenue data for this period.</p>)}
        </CardContent>
      </Card>

      {/* User Acquisition Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Acquisition & Activity</CardTitle>
            <CardDescription>New user signups and daily active users.</CardDescription>
          </div>
           <Button variant="outline" size="sm" onClick={() => handleExport(userAcquisitionReport, "User Acquisition Report")} disabled={userAcquisitionReport.length === 0}>
            <Download className="mr-2 h-4 w-4"/> Export
          </Button>
        </CardHeader>
        <CardContent className="pl-2">
          {userAcquisitionReport.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={userAcquisitionReport}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', {month:'short', day:'numeric'})} />
                <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                <YAxis yAxisId="right" orientation="right" stroke="#ffc658" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="activeUsers" name="Active Users" stroke="#82ca9d" />
                <Line yAxisId="right" type="monotone" dataKey="newSignups" name="New Signups" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          ) : (<p className="text-muted-foreground text-center py-10">No user acquisition data for this period.</p>)}
        </CardContent>
      </Card>
      
      {/* Game Performance Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Game Performance</CardTitle>
            <CardDescription>Most popular games by bet count or revenue.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleExport(gamePerformanceReport, "Game Performance Report")} disabled={gamePerformanceReport.length === 0}>
            <Download className="mr-2 h-4 w-4"/> Export
          </Button>
        </CardHeader>
        <CardContent>
          {gamePerformanceReport.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={gamePerformanceReport} layout="vertical" margin={{left: 50, right: 20}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="gameName" type="category" width={120} interval={0} tick={{fontSize: 12}}/>
                <Tooltip formatter={(value:number) => value.toLocaleString()} />
                <Legend />
                <Bar dataKey="betCount" name="Bets Count" fill="#8884d8" />
                {/* <Bar dataKey="revenue" name="Revenue" fill="#82ca9d" /> */}
              </BarChart>
            </ResponsiveContainer>
          ) : (<p className="text-muted-foreground text-center py-10">No game performance data for this period.</p>)}
        </CardContent>
      </Card>

      {/* Transaction Analysis */}
       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction Analysis</CardTitle>
            <CardDescription>Volume of deposits and withdrawals.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleExport(transactionAnalysis, "Transaction Analysis")} disabled={transactionAnalysis.length === 0}>
            <Download className="mr-2 h-4 w-4"/> Export
          </Button>
        </CardHeader>
        <CardContent className="pl-2">
          {transactionAnalysis.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={transactionAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', {month:'short', day:'numeric'})} />
                <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="depositVolume" name="Deposits" stackId="a" fill="#82ca9d" />
                <Bar dataKey="withdrawalVolume" name="Withdrawals" stackId="a" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          ) : (<p className="text-muted-foreground text-center py-10">No transaction analysis data for this period.</p>)}
        </CardContent>
      </Card>
      
      {/* Top Performing Affiliates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Performing Affiliates</CardTitle>
            <CardDescription>Affiliates generating the most signups or revenue.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleExport(topPerformingAffiliates, "Top Affiliates Report")} disabled={topPerformingAffiliates.length === 0}>
            <Download className="mr-2 h-4 w-4"/> Export
          </Button>
        </CardHeader>
        <CardContent>
          {topPerformingAffiliates.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPerformingAffiliates} layout="vertical" margin={{left: 50, right: 20}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} interval={0} tick={{fontSize: 12}}/>
                <Tooltip formatter={(value:number) => value.toLocaleString()} />
                <Legend />
                <Bar dataKey="value" name="Signups/Revenue" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          ) : (<p className="text-muted-foreground text-center py-10">No affiliate performance data available.</p>)}
        </CardContent>
      </Card>
      
      {/* Promotion Effectiveness */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Promotion Effectiveness</CardTitle>
            <CardDescription>Performance of various promotions (claims, revenue generated).</CardDescription>
          </div>
           <Button variant="outline" size="sm" onClick={() => handleExport(promotionEffectiveness, "Promotion Effectiveness Report")} disabled={promotionEffectiveness.length === 0}>
            <Download className="mr-2 h-4 w-4"/> Export
          </Button>
        </CardHeader>
        <CardContent>
          {promotionEffectiveness.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={promotionEffectiveness} layout="vertical" margin={{left: 70, right: 20}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} interval={0} tick={{fontSize: 12}}/>
                <Tooltip formatter={(value:number) => value.toLocaleString()} />
                <Legend />
                <Bar dataKey="value" name="Claims/Revenue" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          ) : (<p className="text-muted-foreground text-center py-10">No promotion effectiveness data available.</p>)}
        </CardContent>
      </Card>

      {/* Regional Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Regional Performance</CardTitle>
            <CardDescription>User activity or revenue by region/country.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleExport(regionalPerformance, "Regional Performance Report")} disabled={regionalPerformance.length === 0}>
            <Download className="mr-2 h-4 w-4"/> Export
          </Button>
        </CardHeader>
        <CardContent>
          {regionalPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionalPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {regionalPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (<p className="text-muted-foreground text-center py-10">No regional performance data available.</p>)}
        </CardContent>
      </Card>

    </div>
  );
};

export default AdminReports;

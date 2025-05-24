
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Shield, 
  AlertTriangle,
  Activity,
  FileBarChart,
  Download
} from 'lucide-react';
import { LineChart, BarChart, PieChart } from '@/components/ui/dashboard-charts';
import { analyticsService, RealtimePlayerStats, RevenueAnalytics } from '@/services/analyticsService';
import { riskManagementService, FraudAlert } from '@/services/riskManagementService';
import { reportingService } from '@/services/reportingService';

const EnhancedDashboard = () => {
  const [realtimeStats, setRealtimeStats] = useState<RealtimePlayerStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch realtime stats
        const stats = await analyticsService.getRealtimePlayerStats();
        setRealtimeStats(stats);
        
        // Fetch revenue analytics
        const revenue = await analyticsService.getRevenueAnalytics({
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        });
        setRevenueData(revenue);
        
        // Fetch fraud alerts
        const alerts = await riskManagementService.detectFraud();
        setFraudAlerts(alerts);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleGenerateReport = async (reportType: string) => {
    try {
      if (reportType === 'financial') {
        await reportingService.generateFinancialReport('monthly', '2024-01');
      } else if (reportType === 'regulatory') {
        await reportingService.generateRegulatoryReport('aml', 'US', '2024-Q1');
      }
      // Handle success feedback
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Players Online</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats?.totalOnline.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {realtimeStats?.totalPlaying} actively playing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData?.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              GGR: ${revenueData?.ggr.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats?.newSignups}</div>
            <p className="text-xs text-muted-foreground">
              Today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fraudAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {fraudAlerts.filter(a => a.severity === 'critical').length} critical
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Alerts */}
      {fraudAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Active Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fraudAlerts.slice(0, 3).map((alert) => (
                <Alert key={alert.id} className={
                  alert.severity === 'critical' ? 'border-red-500' :
                  alert.severity === 'high' ? 'border-orange-500' :
                  'border-yellow-500'
                }>
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'high' ? 'default' : 'secondary'
                        }>
                          {alert.severity}
                        </Badge>
                        <span className="font-medium">{alert.alertType.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm mt-1">{alert.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Investigate
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={revenueData?.revenueByProvider || []}
                  colors={['#0088FE', '#00C49F', '#FFBB28', '#FF8042']}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Games by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={revenueData?.revenueByGame || []}
                  categories={['revenue']}
                  index="gameName"
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart 
                data={revenueData?.revenueByDate || []}
                categories={['revenue']}
                index="date"
                valueFormatter={(value) => `$${value.toLocaleString()}`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={[
                    { name: 'Low Risk', value: 65 },
                    { name: 'Medium Risk', value: 25 },
                    { name: 'High Risk', value: 8 },
                    { name: 'Critical', value: 2 }
                  ]}
                  colors={['#10B981', '#F59E0B', '#EF4444', '#7C2D12']}
                  valueFormatter={(value) => `${value}%`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Types</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={[
                    { name: 'Suspicious Betting', count: 12 },
                    { name: 'Unusual Deposits', count: 8 },
                    { name: 'Bonus Abuse', count: 5 },
                    { name: 'Account Sharing', count: 3 }
                  ]}
                  categories={['count']}
                  index="name"
                  valueFormatter={(value) => `${value} alerts`}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="h-5 w-5" />
                  Financial Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleGenerateReport('financial')}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Monthly Report
                </Button>
                <Button 
                  onClick={() => handleGenerateReport('financial')}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Quarterly Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Regulatory Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleGenerateReport('regulatory')}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  AML Compliance Report
                </Button>
                <Button 
                  onClick={() => handleGenerateReport('regulatory')}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  KYC Status Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Operational Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleGenerateReport('operational')}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Player Activity Report
                </Button>
                <Button 
                  onClick={() => handleGenerateReport('operational')}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Provider Performance
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDashboard;

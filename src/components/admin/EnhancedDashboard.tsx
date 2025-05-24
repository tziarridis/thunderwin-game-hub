
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart, PieChart, DonutChart } from '@/components/ui/dashboard-charts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Shield, 
  FileText,
  Eye,
  Clock,
  UserCheck
} from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { riskManagementService } from '@/services/riskManagementService';
import { reportingService } from '@/services/reportingService';

const EnhancedDashboard = () => {
  const [realtimeStats, setRealtimeStats] = useState<any>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<any>(null);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [suspiciousTransactions, setSuspiciousTransactions] = useState<any[]>([]);
  const [conversionAnalytics, setConversionAnalytics] = useState<any>(null);
  const [playerLTV, setPlayerLTV] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [
          statsData,
          revenueData,
          alertsData,
          transactionsData,
          conversionData,
          ltvData
        ] = await Promise.all([
          analyticsService.getRealtimePlayerStats(),
          analyticsService.getRevenueAnalytics({ start: '2023-01-01', end: '2023-12-31' }),
          riskManagementService.detectFraud(),
          riskManagementService.flagSuspiciousTransactions(),
          analyticsService.getConversionAnalytics(),
          analyticsService.getPlayerLifetimeValue()
        ]);

        setRealtimeStats(statsData);
        setRevenueAnalytics(revenueData);
        setFraudAlerts(alertsData);
        setSuspiciousTransactions(transactionsData);
        setConversionAnalytics(conversionData);
        setPlayerLTV(ltvData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Set up refresh interval
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const generateReport = async (type: string) => {
    try {
      const report = await reportingService.generateFinancialReport('monthly', '2023-12');
      console.log('Report generated:', report);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Players Online</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats?.totalOnline || 0}</div>
            <p className="text-xs text-muted-foreground">
              {realtimeStats?.totalPlaying || 0} playing now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats?.newSignups || 0}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deposits</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${realtimeStats?.totalDeposits || 0}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground">Live sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Alerts */}
      {fraudAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Fraud Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fraudAlerts.slice(0, 3).map((alert) => (
              <Alert key={alert.id} className="border-red-200">
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                      <p className="mt-1">{alert.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Risk Score: {alert.riskScore}/100
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Investigate
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                {conversionAnalytics && (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Registration to Deposit</span>
                      <span>{conversionAnalytics.registrationToDeposit}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Visit to Registration</span>
                      <span>{conversionAnalytics.visitToRegistration}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deposit to 2nd Deposit</span>
                      <span>{conversionAnalytics.depositToSecondDeposit}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus Conversion</span>
                      <span>{conversionAnalytics.bonusConversion}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Player Lifetime Value</CardTitle>
              </CardHeader>
              <CardContent>
                {playerLTV && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">${playerLTV.averageLTV}</div>
                      <p className="text-muted-foreground">Average LTV</p>
                    </div>
                    <div className="space-y-2">
                      {playerLTV.ltpBySegment.map((segment: any) => (
                        <div key={segment.segment} className="flex justify-between">
                          <span>{segment.segment}</span>
                          <span>${segment.ltv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Provider</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueAnalytics && (
                  <BarChart
                    data={revenueAnalytics.revenueByProvider.map((item: any) => ({
                      name: item.providerName,
                      value: item.revenue
                    }))}
                    categories={['value']}
                    index="name"
                    valueFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Game</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueAnalytics && (
                  <PieChart
                    data={revenueAnalytics.revenueByGame.map((item: any) => ({
                      name: item.gameName,
                      value: item.revenue
                    }))}
                    valueFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">${revenueAnalytics.totalRevenue.toLocaleString()}</div>
                    <p className="text-muted-foreground">Total Revenue</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">${revenueAnalytics.ggr.toLocaleString()}</div>
                    <p className="text-muted-foreground">GGR</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">${revenueAnalytics.ngr.toLocaleString()}</div>
                    <p className="text-muted-foreground">NGR</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Suspicious Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suspiciousTransactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">${transaction.amount}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.type} - User: {transaction.userId}
                        </div>
                        <div className="text-sm">
                          Reasons: {transaction.suspicionReasons.join(', ')}
                        </div>
                      </div>
                      <Badge variant={transaction.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                        {transaction.riskLevel} risk
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Financial Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => generateReport('financial')}
                  >
                    Generate Monthly Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    Download Annual Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regulatory Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    AML Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    KYC Compliance
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Player Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Activity Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    Retention Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDashboard;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Target,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { advancedAnalyticsService } from '@/services/advancedAnalyticsService';

const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<any>({});
  const [playerSegments, setPlayerSegments] = useState<any[]>([]);
  const [abTests, setAbTests] = useState<any[]>([]);
  const [ltvData, setLtvData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const [metricsData, segments, tests, ltv] = await Promise.all([
        advancedAnalyticsService.getDashboardMetrics(),
        advancedAnalyticsService.getPlayerSegments(),
        advancedAnalyticsService.getActiveABTests(),
        advancedAnalyticsService.getPlayerLTVAnalysis()
      ]);

      setMetrics(metricsData);
      setPlayerSegments(segments);
      setAbTests(tests);
      setLtvData(ltv);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Analytics Dashboard</h2>
        <Button onClick={loadAnalyticsData} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics.revenueGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Players</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activePlayers?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics.playerGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average LTV</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.avgLTV?.toFixed(2) || 0}</div>
            <p className="text-xs text-muted-foreground">
              Player lifetime value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Visitor to player conversion
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="segments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="segments">Player Segments</TabsTrigger>
          <TabsTrigger value="abtests">A/B Tests</TabsTrigger>
          <TabsTrigger value="ltv">LTV Analysis</TabsTrigger>
          <TabsTrigger value="churn">Churn Prediction</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Player Segmentation</CardTitle>
              <CardDescription>Player segments based on behavior and value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {playerSegments.map((segment) => (
                  <div key={segment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{segment.segment_type}</Badge>
                        <span className="font-medium">{segment.segment_value}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {(segment.confidence_score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {new Date(segment.calculated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {playerSegments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No player segments available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active A/B Tests</CardTitle>
              <CardDescription>Running experiments and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {abTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{test.test_name}</span>
                        <Badge className={`${
                          test.status === 'active' ? 'bg-green-100 text-green-800' : 
                          test.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {String(test.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {test.description || 'No description available'}
                      </p>
                      <div className="flex space-x-4 text-xs text-muted-foreground">
                        <span>Start: {new Date(test.start_date).toLocaleDateString()}</span>
                        {test.end_date && (
                          <span>End: {new Date(test.end_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {String(test.participants || 0)} participants
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {String(test.conversion_rate || 0)}% conversion
                      </div>
                    </div>
                  </div>
                ))}
                {abTests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No active A/B tests
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ltv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lifetime Value Analysis</CardTitle>
              <CardDescription>Player value predictions and segments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ltvData.map((ltv) => (
                  <div key={ltv.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{ltv.ltv_segment}</Badge>
                        <span className="font-medium">User {ltv.user_id.slice(0, 8)}...</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Method: {ltv.calculation_method}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ${ltv.predicted_ltv.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current: ${ltv.current_value.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                {ltvData.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No LTV data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Churn Prediction</CardTitle>
              <CardDescription>Players at risk of churning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {metrics.highRiskChurn || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">High Risk</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {metrics.mediumRiskChurn || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Medium Risk</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.lowRiskChurn || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Low Risk</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;

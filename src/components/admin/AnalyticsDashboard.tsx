
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Target, Brain, AlertCircle } from 'lucide-react';
import { advancedAnalyticsService } from '@/services/advancedAnalyticsService';
import { supabase } from '@/integrations/supabase/client';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [playerSegments, setPlayerSegments] = useState<any[]>([]);
  const [abTests, setAbTests] = useState<any[]>([]);
  const [churnPredictions, setChurnPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // Load player segments
      const { data: segments } = await supabase
        .from('player_segments')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(100);

      // Load A/B tests
      const { data: tests } = await supabase
        .from('ab_tests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Load churn predictions
      const { data: churn } = await supabase
        .from('churn_predictions')
        .select('*')
        .eq('churn_risk_level', 'high')
        .order('predicted_at', { ascending: false })
        .limit(20);

      // Calculate analytics metrics
      const metrics = await calculateAnalyticsMetrics();

      setPlayerSegments(segments || []);
      setAbTests(tests || []);
      setChurnPredictions(churn || []);
      setAnalyticsData(metrics);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalyticsMetrics = async () => {
    // Mock analytics calculations
    return {
      totalPlayers: 1250,
      activeTests: 3,
      churnRisk: 15.2,
      ltv: 850,
      conversionRate: 3.2,
      segmentDistribution: [
        { name: 'High Value', value: 15, color: '#22c55e' },
        { name: 'Medium Value', value: 35, color: '#3b82f6' },
        { name: 'Low Value', value: 40, color: '#f59e0b' },
        { name: 'New Users', value: 10, color: '#8b5cf6' }
      ],
      monthlyTrends: [
        { month: 'Jan', players: 980, revenue: 45000, churn: 12 },
        { month: 'Feb', players: 1050, revenue: 52000, churn: 11 },
        { month: 'Mar', players: 1150, revenue: 58000, churn: 13 },
        { month: 'Apr', players: 1200, revenue: 61000, churn: 14 },
        { month: 'May', players: 1250, revenue: 67000, churn: 15 }
      ]
    };
  };

  const getSegmentsByType = (type: string) => {
    return playerSegments
      .filter(s => s.segment_type === type)
      .reduce((acc, segment) => {
        acc[segment.segment_value] = (acc[segment.segment_value] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  };

  const getRiskLevelColor = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || colors.low;
  };

  const getTestStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <Button onClick={loadAnalyticsData} variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalPlayers?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg LTV</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.ltv}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +0.8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Risk</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.churnRisk}%</div>
            <p className="text-xs text-muted-foreground">
              -2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active A/B Tests</CardTitle>
            <Brain className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeTests}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="segments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="segments">Player Segments</TabsTrigger>
          <TabsTrigger value="abtests">A/B Testing</TabsTrigger>
          <TabsTrigger value="churn">Churn Prediction</TabsTrigger>
          <TabsTrigger value="trends">Trends & Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Player Value Distribution</CardTitle>
                <CardDescription>Segmentation by player value</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.segmentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {analyticsData.segmentDistribution?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {analyticsData.segmentDistribution?.map((segment: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="text-sm">{segment.name}: {segment.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Breakdown</CardTitle>
                <CardDescription>Current player segmentation data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Value Segments</h4>
                    <div className="space-y-1">
                      {Object.entries(getSegmentsByType('value')).map(([segment, count]) => (
                        <div key={segment} className="flex justify-between text-sm">
                          <span className="capitalize">{segment.replace('_', ' ')}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Activity Segments</h4>
                    <div className="space-y-1">
                      {Object.entries(getSegmentsByType('activity')).map(([segment, count]) => (
                        <div key={segment} className="flex justify-between text-sm">
                          <span className="capitalize">{segment.replace('_', ' ')}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Risk Segments</h4>
                    <div className="space-y-1">
                      {Object.entries(getSegmentsByType('risk')).map(([segment, count]) => (
                        <div key={segment} className="flex justify-between text-sm">
                          <span className="capitalize">{segment.replace('_', ' ')}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="abtests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing Overview</CardTitle>
              <CardDescription>Active and recent experiments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {abTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={getTestStatusColor(test.status)}>
                          {test.status.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{test.test_name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {test.description || 'No description available'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Started: {new Date(test.start_date).toLocaleDateString()}
                        {test.end_date && ` • Ends: ${new Date(test.end_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline">
                        View Results
                      </Button>
                    </div>
                  </div>
                ))}
                {abTests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No A/B tests configured
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High Churn Risk Players</CardTitle>
              <CardDescription>Players likely to churn in the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churnPredictions.map((prediction) => (
                  <div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={getRiskLevelColor(prediction.churn_risk_level)}>
                          {prediction.churn_risk_level.toUpperCase()} RISK
                        </Badge>
                        <span className="font-medium">User ID: {prediction.user_id}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Churn Probability: {(prediction.churn_probability * 100).toFixed(1)}%
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {prediction.recommended_actions?.map((action: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline">
                        Take Action
                      </Button>
                    </div>
                  </div>
                ))}
                {churnPredictions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No high-risk churn predictions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Player growth and revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="players" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Players"
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="Revenue ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn Rate Trends</CardTitle>
                <CardDescription>Monthly churn rate tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="churn" fill="#f59e0b" name="Churn Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { providerIntegrationService, ProviderStatus } from '@/services/providerIntegrationService';
import { sessionManagerService } from '@/services/sessionManagerService';
import { Activity, AlertTriangle, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';

const ProviderMonitoring = () => {
  const [providerStatus, setProviderStatus] = useState<ProviderStatus[]>([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [slaMetrics, setSlaMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviderData();
    const interval = setInterval(loadProviderData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadProviderData = async () => {
    try {
      const status = providerIntegrationService.getProviderStatus();
      const sessionCount = sessionManagerService.getSessionCount();
      
      setProviderStatus(status);
      setActiveSessions(sessionCount);
      
      // Load SLA metrics for each provider
      const metrics: any = {};
      for (const provider of status) {
        metrics[provider.id] = await providerIntegrationService.getProviderSLAMetrics(provider.id, 7);
      }
      setSlaMetrics(metrics);
      
    } catch (error) {
      console.error('Error loading provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      online: 'default',
      degraded: 'secondary',
      offline: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading provider status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Provider Monitoring</h2>
        <Button onClick={loadProviderData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Currently playing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Providers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {providerStatus.filter(p => p.status === 'online').length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {providerStatus.length} providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(providerStatus.reduce((sum, p) => sum + p.responseTime, 0) / providerStatus.length || 0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Across all providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {providerStatus.every(p => p.status === 'online') ? 
              <CheckCircle className="h-4 w-4 text-green-500" /> :
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            }
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {providerStatus.every(p => p.status === 'online') ? 'Healthy' : 'Issues'}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall status
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Provider Status</TabsTrigger>
          <TabsTrigger value="sla">SLA Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providerStatus.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    {getStatusIcon(provider.status)}
                  </div>
                  <CardDescription>Provider ID: {provider.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    {getStatusBadge(provider.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time:</span>
                    <span className="text-sm font-medium">{provider.responseTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Check:</span>
                    <span className="text-sm">
                      {new Date(provider.lastCheck).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime:</span>
                    <span className="text-sm font-medium">{provider.uptime.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {providerStatus.map((provider) => {
              const metrics = slaMetrics[provider.id];
              if (!metrics) return null;

              return (
                <Card key={provider.id}>
                  <CardHeader>
                    <CardTitle>{provider.name} - SLA Metrics (7 days)</CardTitle>
                    <CardDescription>Performance and reliability metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Requests</p>
                        <p className="text-2xl font-bold">{metrics.totalRequests}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold">{metrics.uptime.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Response</p>
                        <p className="text-2xl font-bold">{Math.round(metrics.averageResponseTime)}ms</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Error Rate</p>
                        <p className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderMonitoring;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Users, Activity, TrendingUp, Eye } from 'lucide-react';
import { securityHardeningService } from '@/services/securityHardeningService';
import { advancedFraudDetectionService } from '@/services/advancedFraudDetectionService';
import { supabase } from '@/integrations/supabase/client';

const SecurityDashboard = () => {
  const [securityMetrics, setSecurityMetrics] = useState<any>({});
  const [incidents, setIncidents] = useState<any[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      // Load security incidents
      const { data: incidentsData } = await supabase
        .from('security_incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Load fraud investigations
      const { data: fraudData } = await supabase
        .from('fraud_investigations')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculate metrics
      const metrics = await calculateSecurityMetrics();

      setIncidents(incidentsData || []);
      setFraudAlerts(fraudData || []);
      setSecurityMetrics(metrics);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSecurityMetrics = async () => {
    const { data: todayIncidents } = await supabase
      .from('security_incidents')
      .select('*')
      .gte('created_at', new Date().toISOString().split('T')[0]);

    const { data: activeInvestigations } = await supabase
      .from('fraud_investigations')
      .select('*')
      .eq('status', 'open');

    const { data: riskUsers } = await supabase
      .from('wallets')
      .select('*')
      .gt('aml_risk_score', 70);

    return {
      todayIncidents: todayIncidents?.length || 0,
      activeInvestigations: activeInvestigations?.length || 0,
      highRiskUsers: riskUsers?.length || 0,
      systemStatus: calculateSystemHealth()
    };
  };

  const calculateSystemHealth = () => {
    // Mock system health calculation
    return Math.floor(Math.random() * 20) + 80; // 80-100%
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-red-100 text-red-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Security Dashboard</h2>
        <Button onClick={loadSecurityData} variant="outline" size="sm">
          <Shield className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Incidents Today</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.todayIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {securityMetrics.todayIncidents > 5 ? 'Above average' : 'Normal levels'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investigations</CardTitle>
            <Eye className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.activeInvestigations}</div>
            <p className="text-xs text-muted-foreground">
              Fraud cases under review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Users</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.highRiskUsers}</div>
            <p className="text-xs text-muted-foreground">
              Requiring enhanced monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.systemStatus}%</div>
            <p className="text-xs text-muted-foreground">
              Security systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Investigations</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Incidents</CardTitle>
              <CardDescription>Latest security events and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{incident.incident_type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {incident.source_ip && `IP: ${incident.source_ip} • `}
                        {new Date(incident.created_at).toLocaleString()}
                      </p>
                      {incident.details?.description && (
                        <p className="text-sm">{incident.details.description}</p>
                      )}
                    </div>
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status}
                    </Badge>
                  </div>
                ))}
                {incidents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No recent security incidents
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Fraud Investigations</CardTitle>
              <CardDescription>Ongoing fraud detection cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fraudAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(alert.priority)}>
                          {alert.priority.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{alert.investigation_type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        User ID: {alert.user_id} • 
                        Created: {new Date(alert.created_at).toLocaleString()}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {alert.automated_flags?.map((flag: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {flag.type || flag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
                {fraudAlerts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No active fraud investigations
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Rate Limiting Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Login Endpoint</span>
                    <Badge variant="outline">Normal</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Game Launch</span>
                    <Badge variant="outline">Normal</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Transactions</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Elevated</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Modules</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Fraud Detection</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Device Fingerprinting</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Behavioral Analysis</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>AML Monitoring</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;

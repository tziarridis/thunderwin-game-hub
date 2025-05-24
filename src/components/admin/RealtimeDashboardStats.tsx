
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, TrendingUp, Clock } from 'lucide-react';
import { realtimeDataService, RealtimeStats } from '@/services/realtimeDataService';

const RealtimeDashboardStats = () => {
  const [stats, setStats] = useState<RealtimeStats>({
    totalOnline: 0,
    totalPlaying: 0,
    activeSessions: 0,
    lastUpdated: new Date().toISOString()
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize realtime service
    const initializeRealtime = async () => {
      try {
        await realtimeDataService.initialize();
        setIsConnected(true);
        
        // Get initial stats
        const currentStats = realtimeDataService.getCurrentStats();
        setStats(currentStats);
      } catch (error) {
        console.error('Error initializing realtime service:', error);
        setIsConnected(false);
      }
    };

    initializeRealtime();

    // Subscribe to player stats updates
    const subscription = realtimeDataService.subscribe('player_stats', (newStats: RealtimeStats) => {
      setStats(newStats);
    });

    return () => {
      realtimeDataService.unsubscribe(subscription);
    };
  }, []);

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Players Online</CardTitle>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
              {isConnected ? "LIVE" : "OFFLINE"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOnline.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Updated {formatLastUpdated(stats.lastUpdated)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Currently Playing</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPlaying.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalOnline > 0 ? ((stats.totalPlaying / stats.totalOnline) * 100).toFixed(1) : 0}% conversion
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSessions.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Live game sessions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "ONLINE" : "OFFLINE"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Real-time updates {isConnected ? "active" : "disabled"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeDashboardStats;

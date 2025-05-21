
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'; // Example icons

interface OverviewMetricsProps {
  stats: {
    totalUsers?: number;
    totalRevenue?: number;
    activePlayers?: number;
    pendingWithdrawals?: number;
  } | null;
  isLoading: boolean;
}

const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ stats, isLoading }) => {
  const metrics = [
    { title: "Total Users", value: stats?.totalUsers, icon: Users, currency: false },
    { title: "Total Revenue", value: stats?.totalRevenue, icon: DollarSign, currency: true },
    { title: "Active Players", value: stats?.activePlayers, icon: TrendingUp, currency: false },
    { title: "Pending Withdrawals", value: stats?.pendingWithdrawals, icon: AlertCircle, currency: false, warn: true },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!stats) {
    return <p>No overview data available.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.warn ? 'text-orange-400' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metric.currency && '$'}
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : 'N/A'}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OverviewMetrics;

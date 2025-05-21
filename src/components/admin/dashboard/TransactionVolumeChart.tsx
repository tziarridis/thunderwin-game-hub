
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface TransactionVolumeChartProps {
  data: Array<{ date: string; deposits: number; withdrawals?: number }> | null;
  isLoading: boolean;
}

const TransactionVolumeChart: React.FC<TransactionVolumeChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Card className="h-[350px] flex items-center justify-center"><p>Loading transaction data...</p></Card>;
  }
  if (!data || data.length === 0) {
    return <Card className="h-[350px] flex items-center justify-center"><p>No transaction volume data available.</p></Card>;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Volume</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              {data[0]?.withdrawals !== undefined && (
                <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Area type="monotone" dataKey="deposits" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorDeposits)" name="Deposits" />
            {data[0]?.withdrawals !== undefined && (
                <Area type="monotone" dataKey="withdrawals" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorWithdrawals)" name="Withdrawals" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TransactionVolumeChart;

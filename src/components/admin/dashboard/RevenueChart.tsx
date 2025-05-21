
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'; // Assuming recharts is used

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number; expenses?: number }> | null; // Example data structure
  isLoading: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Card className="h-[350px] flex items-center justify-center"><p>Loading chart data...</p></Card>;
  }
  if (!data || data.length === 0) {
    return <Card className="h-[350px] flex items-center justify-center"><p>No revenue data available for the selected period.</p></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" activeDot={{ r: 6 }} strokeWidth={2} name="Revenue" />
            {data[0]?.expenses !== undefined && (
               <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={2} name="Expenses" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;

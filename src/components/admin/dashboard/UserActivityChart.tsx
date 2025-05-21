
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface UserActivityChartProps {
  data: Array<{ date: string; activeUsers: number; newUsers?: number }> | null;
  isLoading: boolean;
}

const UserActivityChart: React.FC<UserActivityChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
    return <Card className="h-[350px] flex items-center justify-center"><p>Loading activity data...</p></Card>;
  }
  if (!data || data.length === 0) {
    return <Card className="h-[350px] flex items-center justify-center"><p>No user activity data available.</p></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Bar dataKey="activeUsers" fill="hsl(var(--primary))" name="Active Users" />
            {data[0]?.newUsers !== undefined && (
                <Bar dataKey="newUsers" fill="hsl(var(--secondary))" name="New Users" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default UserActivityChart;

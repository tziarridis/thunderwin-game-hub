
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Zap, Activity } from 'lucide-react';

const UserStats = () => {
  // Mock data for now
  const stats = [
    { title: "Games Played", value: "125", icon: <TrendingUp className="h-5 w-5 text-muted-foreground" />, trend: "+12%" },
    { title: "Total Wagered", value: "$5,870", icon: <Zap className="h-5 w-5 text-muted-foreground" />, trend: "+8%" },
    { title: "Active Sessions", value: "2", icon: <Activity className="h-5 w-5 text-muted-foreground" />, trend: "" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Gaming Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                {stat.icon}
              </div>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.trend && <p className="ml-2 text-xs text-green-500">{stat.trend}</p>}
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStats;

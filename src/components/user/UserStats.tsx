import React from 'react';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface UserStatsProps {
  user: User | null;
}

const UserStats: React.FC<UserStatsProps> = ({ user }) => {
  if (!user) {
    return <p>Loading stats...</p>; // Or some skeleton loader
  }

  // Use optional chaining and provide default values
  const totalBets = user.stats?.totalBets || 0;
  const totalWagered = user.stats?.totalWagered || 0;
  const totalWins = user.stats?.totalWins || 0;

  const stats = [
    { title: 'Total Bets Placed', value: totalBets.toLocaleString(), icon: <TrendingUp className="h-5 w-5 text-blue-500" /> },
    { title: 'Total Wagered', value: `$${totalWagered.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: <DollarSign className="h-5 w-5 text-green-500" /> },
    { title: 'Total Wins', value: `$${totalWins.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: <TrendingDown className="h-5 w-5 text-red-500" /> }, // Example, might be winnings
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserStats;

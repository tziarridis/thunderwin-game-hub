
import React from 'react';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Zap, Award } from 'lucide-react'; // Example icons

export interface UserStatsProps {
  user: User | null;
}

const UserStats: React.FC<UserStatsProps> = ({ user }) => {
  if (!user) {
    return <div>Loading stats...</div>;
  }

  // Dummy data or calculations based on user prop
  const gamesPlayed = user.vipLevel ? user.vipLevel * 5 + 10 : 10; // Example calculation
  const totalWagered = user.balance ? user.balance * 3.5 : 0; // Example calculation
  const vipStatus = user.vipLevel ? `VIP Level ${user.vipLevel}` : 'Standard Member';

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Games Played</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{gamesPlayed}</div>
          <p className="text-xs text-muted-foreground">Keep playing to unlock more!</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Wagered</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalWagered.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Based on your activity</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">VIP Status</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{vipStatus}</div>
          <p className="text-xs text-muted-foreground">Current loyalty tier</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStats;

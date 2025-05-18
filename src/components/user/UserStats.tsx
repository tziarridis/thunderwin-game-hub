
import React from 'react';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Target } from 'lucide-react'; // Example icons

export interface UserStatsProps {
  user: User | null; // Make user prop explicit
}

const UserStats: React.FC<UserStatsProps> = ({ user }) => {
  // Mock stats if not available in user object, or fetch them
  const stats = {
    gamesPlayed: user?.stats?.gamesPlayed || 125, // Example: user.stats.gamesPlayed if structure exists
    totalWagered: user?.stats?.totalWagered || 5600,
    winRate: user?.stats?.winRate || 55, // Example
  };

  if (!user) {
    // Optionally return null or a loading state if user is null and stats depend on it
    return (
        <Card>
            <CardHeader>
                <CardTitle>Player Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p>Loading stats...</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-primary" />
            Player Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" /> Games Played
          </span>
          <span className="font-semibold">{stats.gamesPlayed}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground flex items-center">
            <Target className="mr-2 h-4 w-4" /> Total Wagered
          </span>
          <span className="font-semibold">${stats.totalWagered.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground flex items-center">
            {/* Replace with actual stat icon and label */}
            <Star className="mr-2 h-4 w-4" /> Win Rate (Example) 
          </span>
          <span className="font-semibold">{stats.winRate}%</span>
        </div>
        {/* Add more relevant stats here */}
      </CardContent>
    </Card>
  );
};

export default UserStats;

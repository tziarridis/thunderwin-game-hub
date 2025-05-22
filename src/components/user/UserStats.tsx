
import React from 'react';
import { User as UserType } from '@/types'; // Renamed to avoid conflict
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Star, Clock } from 'lucide-react';

interface UserStatsProps {
  user: UserType;
  // Additional stats can be passed as props if not directly on User object
  totalWagered?: number;
  totalWins?: number;
  winLossRatio?: number;
  favoriteGame?: string;
  lastLogin?: string;
}

const UserStats: React.FC<UserStatsProps> = ({ 
    user, 
    totalWagered = 1250.75, // Example data
    totalWins = 850.25, 
    winLossRatio = 0.68, 
    favoriteGame = "Starburst",
    lastLogin = user.last_sign_in_at 
}) => {
  
  const stats = [
    { label: 'Total Wagered', value: `$${totalWagered.toFixed(2)}`, icon: <TrendingUp className="h-5 w-5 text-green-500" /> },
    { label: 'Total Wins', value: `$${totalWins.toFixed(2)}`, icon: <Star className="h-5 w-5 text-yellow-500" /> },
    { label: 'Win/Loss Ratio', value: `${(winLossRatio * 100).toFixed(0)}%`, icon: <TrendingDown className="h-5 w-5 text-red-500" /> }, // Example icon
    { label: 'Favorite Game', value: favoriteGame, icon: <Star className="h-5 w-5 text-blue-500" /> }, // Example, might need different icon
    { label: 'Member Since', value: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A', icon: <Clock className="h-5 w-5 text-gray-500" /> },
    { label: 'Last Login', value: lastLogin ? new Date(lastLogin).toLocaleString() : 'N/A', icon: <Clock className="h-5 w-5 text-gray-500" /> },
  ];

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Player Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="p-3 bg-background/30 rounded-lg flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-semibold truncate">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStats;


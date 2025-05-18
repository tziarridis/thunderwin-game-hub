
import React from 'react';
import { User } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export interface VipProgressProps {
  user: User | null;
}

const VipProgress: React.FC<VipProgressProps> = ({ user }) => {
  if (!user) {
    return <div>Loading VIP progress...</div>;
  }

  const currentLevel = user.vipLevel || 0;
  const pointsForNextLevel = (currentLevel + 1) * 1000; // Example: 1000 points per level
  const currentPoints = (user.balance || 0) * 10; // Example: 10 points per unit of balance
  const progressPercentage = Math.min((currentPoints / pointsForNextLevel) * 100, 100);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="mr-2 h-5 w-5 text-yellow-400" />
          VIP Progress
        </CardTitle>
        <CardDescription>
          You are currently Level {currentLevel}. Earn {pointsForNextLevel - currentPoints > 0 ? pointsForNextLevel - currentPoints : 0} more points to reach Level {currentLevel + 1}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progressPercentage} className="w-full h-3" indicatorClassName="bg-yellow-400" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Current Points: {currentPoints}</span>
          <span>Next Level: {pointsForNextLevel}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VipProgress;

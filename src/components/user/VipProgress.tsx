
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
  const pointsForNextLevel = (currentLevel + 1) * 1000; 
  const currentPoints = (user.balance || 0) * 10; 
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
        {/* Removed indicatorClassName, use className for styling the indicator if needed via progress.tsx variant or direct style */}
        <Progress value={progressPercentage} className="w-full h-3 bg-yellow-400" /> 
        {/* Example: if indicator takes primary color, you can set a class like className="[&>div]:bg-yellow-400" 
            Or, if the progress bar is one color, style it directly with bg-yellow-400 as above.
            Shadcn progress indicator usually inherits primary color or can be styled via variant in ui/progress.tsx
        */}
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Current Points: {currentPoints}</span>
          <span>Next Level: {pointsForNextLevel}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VipProgress;


import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

export interface VipProgressProps {
  currentLevel: number;
  currentPoints: number;
  pointsToNextLevel: number;
}

const VipProgress: React.FC<VipProgressProps> = ({
  currentLevel,
  currentPoints,
  pointsToNextLevel
}) => {
  const progressPercentage = Math.min(100, (currentPoints / pointsToNextLevel) * 100);

  return (
    <div className="bg-card p-4 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold">VIP Level {currentLevel}</h3>
      </div>
      
      <Progress value={progressPercentage} className="h-2 mb-2" />
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">{currentPoints} points</span>
        <span className="text-muted-foreground">{pointsToNextLevel} required for level {currentLevel + 1}</span>
      </div>
    </div>
  );
};

export default VipProgress;

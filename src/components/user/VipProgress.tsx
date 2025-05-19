
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Wallet } from '@/types';

interface VipProgressProps {
  currentLevel?: number;
  currentPoints?: number;
  pointsToNextLevel?: number;
  wallet?: Wallet;
}

const VipProgress: React.FC<VipProgressProps> = ({ 
  currentLevel, 
  currentPoints, 
  pointsToNextLevel,
  wallet
}) => {
  // If wallet prop is provided, use its values
  const level = currentLevel !== undefined ? currentLevel : wallet?.vipLevel || 0;
  const points = currentPoints !== undefined ? currentPoints : wallet?.vipPoints || 0;
  
  // Default points needed if not provided
  const pointsNeeded = pointsToNextLevel || 100;
  
  const progressPercentage = Math.min(100, Math.round((points / pointsNeeded) * 100));
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <div>
          <span className="font-semibold">Level {level}</span>
          <span className="text-muted-foreground"> • {points} points</span>
        </div>
        <div className="text-muted-foreground">{pointsNeeded - points} points to Level {level + 1}</div>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default VipProgress;

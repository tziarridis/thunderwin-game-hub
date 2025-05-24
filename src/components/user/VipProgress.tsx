
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VipProgressProps } from '@/types';

const VipProgress: React.FC<VipProgressProps> = ({ currentLevel, currentPoints, pointsToNextLevel }) => {
  const progressPercentage = (currentPoints / pointsToNextLevel) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>VIP Level {currentLevel}</CardTitle>
        <CardDescription>Your VIP progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current Points: {currentPoints}</span>
            <span>Next Level: {pointsToNextLevel}</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default VipProgress;

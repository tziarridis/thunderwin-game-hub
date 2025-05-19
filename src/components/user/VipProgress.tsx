
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star } from 'lucide-react';
import { Wallet, User } from '@/types';

interface VipProgressProps {
  user: User | null;
  wallet: Wallet | null; // Wallet contains vip_level and vip_points
  className?: string;
}

// Example VIP levels configuration
const vipLevelsConfig = [
  { level: 0, name: 'Bronze', pointsRequired: 0, nextLevelPoints: 1000, color: 'text-orange-400' },
  { level: 1, name: 'Silver', pointsRequired: 1000, nextLevelPoints: 5000, color: 'text-gray-400' },
  { level: 2, name: 'Gold', pointsRequired: 5000, nextLevelPoints: 20000, color: 'text-yellow-400' },
  { level: 3, name: 'Platinum', pointsRequired: 20000, nextLevelPoints: 100000, color: 'text-blue-300' },
  { level: 4, name: 'Diamond', pointsRequired: 100000, nextLevelPoints: Infinity, color: 'text-purple-400' },
];


const VipProgress: React.FC<VipProgressProps> = ({ user, wallet, className }) => {
  if (!user || !wallet) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>VIP Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading VIP information...</p>
        </CardContent>
      </Card>
    );
  }

  const currentLevel = wallet.vip_level ?? 0;
  const currentPoints = wallet.vip_points ?? 0;

  const levelInfo = vipLevelsConfig.find(l => l.level === currentLevel) || vipLevelsConfig[0];
  const nextLevelInfo = vipLevelsConfig.find(l => l.level === currentLevel + 1);

  let progressPercent = 0;
  let pointsToNextLevel = 0;

  if (nextLevelInfo) {
    const pointsInCurrentLevel = currentPoints - levelInfo.pointsRequired;
    const pointsForNextLevelRange = nextLevelInfo.pointsRequired - levelInfo.pointsRequired;
    progressPercent = pointsForNextLevelRange > 0 ? (pointsInCurrentLevel / pointsForNextLevelRange) * 100 : 0;
    pointsToNextLevel = nextLevelInfo.pointsRequired - currentPoints;
  } else {
    // Max level
    progressPercent = 100;
  }
  progressPercent = Math.min(Math.max(progressPercent,0),100);


  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-xl">VIP Status</CardTitle>
            <Trophy className={`h-6 w-6 ${levelInfo.color}`} />
        </div>
        <CardDescription>Your current VIP level and progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={`text-lg font-semibold ${levelInfo.color}`}>{levelInfo.name} Tier</span>
          <span className="text-sm text-muted-foreground">
            {currentPoints.toLocaleString()} Points
          </span>
        </div>
        <Progress value={progressPercent} aria-label={`${levelInfo.name} tier progress`} className="h-3" />
        {nextLevelInfo ? (
          <p className="text-xs text-muted-foreground text-center">
            {pointsToNextLevel > 0 ? `${pointsToNextLevel.toLocaleString()} points to ${nextLevelInfo.name}` : `Welcome to ${nextLevelInfo.name}!`}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground text-center">You've reached the highest VIP level!</p>
        )}
        {/* Consider adding benefits display here */}
      </CardContent>
    </Card>
  );
};

export default VipProgress;


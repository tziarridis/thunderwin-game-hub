
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Star } from 'lucide-react';

interface VipProgressProps {
  level: number;
  // currentPoints?: number; // Example: if you want to show points towards next level
  // pointsForNextLevel?: number; // Example
}

const VipProgress: React.FC<VipProgressProps> = ({ level }) => {
  // Mock data for VIP levels - in a real app, this would come from config or API
  const vipLevels = [
    { name: "Bronze", points: 0, progressToNext: 50 }, // Progress is percentage to next level
    { name: "Silver", points: 1000, progressToNext: 60 },
    { name: "Gold", points: 5000, progressToNext: 75 },
    { name: "Platinum", points: 15000, progressToNext: 40 },
    { name: "Diamond", points: 50000, progressToNext: 100 }, // Max level
  ];

  const currentVipLevel = vipLevels[Math.min(level, vipLevels.length - 1)] || vipLevels[0];
  const progressValue = currentVipLevel.progressToNext || 0;

  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-md font-semibold flex items-center">
          <Star className="h-5 w-5 mr-2 text-yellow-400" />
          VIP Level: {currentVipLevel.name}
        </h3>
        {level < vipLevels.length -1 && <span className="text-xs text-muted-foreground">Next: {vipLevels[level + 1].name}</span>}
      </div>
      <Progress value={progressValue} className="w-full h-3" />
      {level < vipLevels.length -1 && 
        <p className="text-xs text-muted-foreground mt-1 text-right">
            {progressValue}% to next level
        </p>
      }
       {level >= vipLevels.length -1 &&
        <p className="text-xs text-green-500 mt-1 text-right">
            You've reached the highest VIP level!
        </p>
      }
    </div>
  );
};

export default VipProgress;


import React from 'react';
import { User, Wallet } from '@/types'; // Import Wallet
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface VipProgressProps {
  // User prop might not be needed if wallet and vip_level are from AuthContext
}

const VipProgress: React.FC<VipProgressProps> = () => {
  const { user, wallet } = useAuth(); // Get user and wallet from AuthContext

  if (!user) {
    return <p>Loading VIP status...</p>;
  }

  const vipLevel = user.vip_level || 0;
  // Assuming wallet might contain points or progress towards next level
  // For now, let's make a simple progress based on current level
  // This logic needs to be defined based on your VIP system
  const progressToNextLevel = (vipLevel % 5) * 20 + 10; // Example placeholder
  const currentLevelName = `VIP Level ${vipLevel}`;
  const nextLevelName = `VIP Level ${vipLevel + 1}`;


  // Placeholder for actual VIP level names and progress logic
  const vipTiers = [
    { name: "Bronze", pointsRequired: 0, icon: <Star className="text-yellow-600" /> },
    { name: "Silver", pointsRequired: 1000, icon: <Star className="text-gray-400" /> },
    { name: "Gold", pointsRequired: 5000, icon: <Star className="text-yellow-400" /> },
    { name: "Platinum", pointsRequired: 20000, icon: <Gem className="text-blue-400" /> },
    { name: "Diamond", pointsRequired: 100000, icon: <Gem className="text-purple-400" /> },
  ];

  const currentTier = vipTiers.slice().reverse().find(tier => (wallet?.vip_points || 0) >= tier.pointsRequired) || vipTiers[0];
  const currentTierIndex = vipTiers.indexOf(currentTier);
  const nextTier = vipTiers[currentTierIndex + 1];
  
  let tierProgress = 0;
  if (nextTier && currentTier) {
    const pointsInCurrentTier = (wallet?.vip_points || 0) - currentTier.pointsRequired;
    const pointsForNextTier = nextTier.pointsRequired - currentTier.pointsRequired;
    tierProgress = pointsForNextTier > 0 ? (pointsInCurrentTier / pointsForNextTier) * 100 : 0;
  } else if (currentTierIndex === vipTiers.length -1 ) { // Max tier
    tierProgress = 100;
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {currentTier.icon}
          <span className="ml-2">VIP Status: {currentTier.name} (Level {vipLevel})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={tierProgress} className="w-full mb-2" />
        {nextTier ? (
          <p className="text-sm text-muted-foreground">
            {(wallet?.vip_points || 0).toLocaleString()} / {nextTier.pointsRequired.toLocaleString()} points to {nextTier.name}
          </p>
        ) : (
           <p className="text-sm text-muted-foreground">Max VIP Tier Reached!</p>
        )}
        {/* Example of showing current balance from wallet */}
        {wallet && (
          <p className="text-xs text-muted-foreground mt-2">
            Current Balance: {wallet.balance.toFixed(2)} {wallet.currency}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default VipProgress;


import React from 'react';
import { Gamepad2, Trophy, Star } from 'lucide-react';

interface StatsProps {
  totalBets: number;
  totalWins: number;
  favoriteGames: number;
}

export const Stats: React.FC<StatsProps> = ({ totalBets, totalWins, favoriteGames }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-primary/10 p-2 mb-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
        </div>
        <span className="text-2xl font-bold">{totalBets}</span>
        <span className="text-sm text-muted-foreground">Total Bets</span>
      </div>
      
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-green-500/10 p-2 mb-2">
          <Trophy className="h-5 w-5 text-green-500" />
        </div>
        <span className="text-2xl font-bold">{totalWins}</span>
        <span className="text-sm text-muted-foreground">Total Wins</span>
      </div>
      
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-amber-500/10 p-2 mb-2">
          <Star className="h-5 w-5 text-amber-500" />
        </div>
        <span className="text-2xl font-bold">{favoriteGames}</span>
        <span className="text-sm text-muted-foreground">Favorites</span>
      </div>
    </div>
  );
};

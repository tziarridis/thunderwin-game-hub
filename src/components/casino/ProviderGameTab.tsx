
import React from 'react';
import { Game } from '@/types/game';
import GameCard from '@/components/games/GameCard';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface ProviderGameTabProps {
  providerId: string;
  value: string;
  games: Game[];
  onGameClick: (game: Game) => void;
  className?: string;
}

const ProviderGameTab: React.FC<ProviderGameTabProps> = ({
  providerId,
  value,
  games,
  onGameClick,
  className
}) => {
  if (!games || games.length === 0) {
    return (
      <TabsContent value={value} className={cn("pt-4", className)}>
        <div className="text-center py-8 text-muted-foreground">
          No games available for this provider
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value={value} className={cn("pt-4", className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {games.map((game) => (
          <GameCard
            key={String(game.id)}
            game={game}
            onPlayClick={() => onGameClick(game)}
          />
        ))}
      </div>
    </TabsContent>
  );
};

export default ProviderGameTab;


import React from 'react';
import { Grid } from '@/components/ui/grid';
import GameCard from '@/components/games/GameCard';

interface ProviderGameTabProps {
  provider?: any;
  games: any[];
  onGameClick: (game: any) => void;
  value?: string; // Added value prop
}

const ProviderGameTab: React.FC<ProviderGameTabProps> = ({
  provider,
  games,
  onGameClick,
  value
}) => {
  if (!games || games.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No games available</p>
      </div>
    );
  }

  return (
    <div className={value ? (value === value ? 'block' : 'hidden') : 'block'}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isFavorite={false} // This would be set dynamically based on user's favorites
            onPlay={() => onGameClick(game)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProviderGameTab;


import React from 'react';
import GameCard from '@/components/games/GameCard';

interface ProviderGameTabProps {
  provider?: any;
  games: any[];
  onGameClick: (game: any) => void;
  value?: string;
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
    <div className={value ? (value === provider?.slug ? 'block' : 'hidden') : 'block'}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isFavorite={false}
            onToggleFavorite={() => {}} // Adding empty function as placeholder
            onPlay={() => onGameClick(game)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProviderGameTab;

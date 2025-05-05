
import React from 'react';
import GameCard from '@/components/games/GameCard';
import { Game } from '@/types';

interface GameGridProps {
  games: any[];
  onGameClick: (game: any) => void;
}

const GameGrid = ({ games, onGameClick }: GameGridProps) => {
  if (!games || games.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-white/70">No games available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard 
          key={game.id}
          id={game.id}
          title={game.title}
          image={game.image}
          provider={game.provider}
          isPopular={game.isPopular}
          isNew={game.isNew}
          rtp={game.rtp}
          isFavorite={false}
          minBet={game.minBet}
          maxBet={game.maxBet}
          onClick={() => onGameClick(game)}
        />
      ))}
    </div>
  );
};

export default GameGrid;

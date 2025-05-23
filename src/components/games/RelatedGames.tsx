
import React from 'react';
import { Game } from '@/types';

export interface RelatedGamesProps {
  games?: Game[];
}

const RelatedGames: React.FC<RelatedGamesProps> = ({ games = [] }) => {
  if (!games.length) {
    return (
      <div className="bg-card p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Related Games</h3>
        <p className="text-muted-foreground text-sm">No related games found.</p>
      </div>
    );
  }

  return (
    <div className="bg-card p-4 rounded-lg">
      <h3 className="font-semibold mb-3">Related Games</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {games.slice(0, 4).map((game) => (
          <div key={game.id} className="text-center">
            <img 
              src={game.cover || '/placeholder.svg'} 
              alt={game.game_name}
              className="w-full h-24 object-cover rounded mb-2"
            />
            <p className="text-xs font-medium truncate">{game.game_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedGames;

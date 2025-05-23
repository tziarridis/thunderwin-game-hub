
import React from 'react';
import { Game } from '@/types';

export interface GamePropertiesProps {
  game: Game;
}

const GameProperties: React.FC<GamePropertiesProps> = ({ game }) => {
  return (
    <div className="bg-card p-4 rounded-lg">
      <h3 className="font-semibold mb-3">Game Properties</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">RTP:</span>
          <span className="ml-2">{game.rtp || 'N/A'}%</span>
        </div>
        <div>
          <span className="text-muted-foreground">Type:</span>
          <span className="ml-2">{game.game_type || 'N/A'}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Technology:</span>
          <span className="ml-2">{game.technology || 'N/A'}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Mobile:</span>
          <span className="ml-2">{game.is_mobile ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
};

export default GameProperties;

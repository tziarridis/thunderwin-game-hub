
import React from 'react';
import { Game } from '@/types';
import { Badge } from '@/components/ui/badge';

interface GamePropertiesProps {
  game: Game | null;
}

const GameProperties: React.FC<GamePropertiesProps> = ({ game }) => {
  if (!game) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-md font-semibold">Game Properties</h4>
      <div className="flex flex-wrap gap-2">
        {game.rtp && <Badge variant="outline">RTP: {game.rtp}%</Badge>}
        {game.volatility && <Badge variant="outline" className="capitalize">Volatility: {game.volatility}</Badge>}
        {game.minBet && <Badge variant="outline">Min Bet: {game.minBet}</Badge>}
        {game.maxBet && <Badge variant="outline">Max Bet: {game.maxBet}</Badge>}
        {game.lines && <Badge variant="outline">Lines: {game.lines}</Badge>}
      </div>
      {game.features && game.features.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Features:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {game.features.map(feature => <Badge key={feature} variant="secondary">{feature}</Badge>)}
          </div>
        </div>
      )}
       {game.themes && game.themes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Themes:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {game.themes.map(theme => <Badge key={theme} variant="secondary">{theme}</Badge>)}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameProperties;

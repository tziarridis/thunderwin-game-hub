
import React from 'react';
import { Game } from '@/types';
import { Badge } from '@/components/ui/badge';

interface GamePropertiesProps {
  game: Game | null;
}

const GameProperties: React.FC<GamePropertiesProps> = ({ game }) => {
  if (!game) return <p className="text-muted-foreground">Game properties not available.</p>;

  return (
    <div className="bg-card p-4 sm:p-6 rounded-lg shadow space-y-3">
      <h3 className="text-lg font-semibold mb-3">Game Properties</h3>
      <div className="flex flex-wrap gap-2">
        {game.rtp && <Badge variant="outline">RTP: {typeof game.rtp === 'number' ? `${game.rtp}%` : game.rtp}</Badge>}
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
      {game.tags && game.tags.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Tags:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {game.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)} {/* Changed "info" to "secondary" */}
          </div>
        </div>
      )}
       {game.release_date && ( // Changed from releaseDate
         <p className="text-sm text-muted-foreground mt-2">Release Date: {game.release_date}</p>
       )}
    </div>
  );
};

export default GameProperties;

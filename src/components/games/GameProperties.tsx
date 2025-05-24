
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Game } from '@/types';

export interface GamePropertiesProps {
  game: Game;
  provider?: {
    name: string;
  };
  category?: {
    name: string;
  };
}

const GameProperties: React.FC<GamePropertiesProps> = ({ game, provider, category }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {provider && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Provider</p>
              <p className="text-sm">{provider.name}</p>
            </div>
          )}
          {category && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p className="text-sm">{category.name}</p>
            </div>
          )}
          {game.rtp && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">RTP</p>
              <p className="text-sm">{game.rtp}%</p>
            </div>
          )}
          {game.volatility && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Volatility</p>
              <Badge variant="outline">{game.volatility}</Badge>
            </div>
          )}
          {game.min_bet && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Min Bet</p>
              <p className="text-sm">${game.min_bet}</p>
            </div>
          )}
          {game.max_bet && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Max Bet</p>
              <p className="text-sm">${game.max_bet}</p>
            </div>
          )}
        </div>
        {game.features && game.features.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Features</p>
            <div className="flex flex-wrap gap-2">
              {game.features.map((feature, index) => (
                <Badge key={index} variant="secondary">{feature}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameProperties;

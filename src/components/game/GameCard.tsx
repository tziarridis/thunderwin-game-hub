
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Heart } from 'lucide-react';

interface GameCardProps {
  game: {
    id: string | number;
    title: string;
    image?: string;
    provider?: string;
    isNew?: boolean;
    isFeatured?: boolean;
    slug?: string;
  };
  onPlay?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ 
  game, 
  onPlay, 
  onFavorite, 
  isFavorite = false 
}) => {
  const gameSlug = typeof game.slug === 'string' ? game.slug : String(game.id);

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img
          src={game.image || '/placeholder.svg'}
          alt={game.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        
        {game.isNew && (
          <Badge className="absolute top-2 left-2 bg-green-500">
            New
          </Badge>
        )}
        
        {game.isFeatured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500">
            Featured
          </Badge>
        )}
        
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-t-lg">
          <Button onClick={onPlay} size="lg" className="gap-2">
            <Play className="h-4 w-4" />
            Play Now
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-sm truncate" title={game.title}>
              {game.title}
            </h3>
            {game.provider && (
              <p className="text-xs text-muted-foreground">{game.provider}</p>
            )}
          </div>
          
          {onFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onFavorite}
            >
              <Heart 
                className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
          )}
        </div>
        
        <Button 
          onClick={onPlay} 
          className="w-full" 
          size="sm"
        >
          Play
        </Button>
      </CardContent>
    </Card>
  );
};

export default GameCard;

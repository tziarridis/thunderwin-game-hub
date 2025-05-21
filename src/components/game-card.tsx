
// This component appears to be a duplicate or older version of components/games/GameCard.tsx
// or components/casino/EnhancedGameCard.tsx.
// For now, I will update it to fix the 'isFavorite' error, but it should be reviewed for consolidation.
import React from 'react';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { PlayCircle, Info, Heart } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';


interface GameCardProps {
  game: Game;
  onPlay: (gameId: string | number, mode: 'real' | 'demo') => void;
  onDetails?: (gameId: string | number) => void;
  className?: string;
}

const GameCard: React.FC<GameCardProps> = ({ game, onPlay, onDetails, className }) => {
  const { favoriteGameIds, toggleFavoriteGame } = useGames();
  const { isAuthenticated } = useAuth();
  const isFavorite = favoriteGameIds.has(String(game.id)) || favoriteGameIds.has(String(game.game_id));


  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
     if (!isAuthenticated) return;
    toggleFavoriteGame(String(game.id || game.game_id));
  };
  
  const gameId = game.id || game.game_id || 'unknown-game';

  return (
    <Card className={cn("overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group", className)}>
      <CardHeader className="p-0 relative">
        <AspectRatio ratio={16 / 9}>
          <img
            src={game.image || game.image_url || game.cover || '/placeholder.svg'}
            alt={game.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </AspectRatio>
         {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 z-10 text-white bg-black/20 hover:bg-black/40"
            onClick={handleFavoriteClick}
          >
            <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-400" : "text-white")} />
          </Button>
        )}
        {(game.isNew || (game.tags && game.tags.includes('new'))) && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">NEW</div>
        )}
      </CardHeader>
      <CardContent className="p-3">
        <CardTitle className="text-md font-semibold truncate mb-1 group-hover:text-primary transition-colors">
          {game.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground truncate">
          {game.providerName || game.provider_slug || 'Unknown Provider'} {/* Use providerName or provider_slug */}
        </p>
      </CardContent>
      <CardFooter className="p-3 pt-0 grid grid-cols-2 gap-2">
        <Button onClick={() => onPlay(gameId, 'real')} size="sm" className="w-full">
          <PlayCircle className="mr-1 h-4 w-4" /> Real
        </Button>
        <Button onClick={() => onPlay(gameId, 'demo')} variant="outline" size="sm" className="w-full">
          <PlayCircle className="mr-1 h-4 w-4" /> Demo
        </Button>
        {/* {onDetails && (
          <Button onClick={() => onDetails(gameId)} variant="link" size="sm" className="col-span-2 text-xs">
            <Info className="mr-1 h-3 w-3" /> Details
          </Button>
        )} */}
      </CardFooter>
    </Card>
  );
};

export default GameCard;


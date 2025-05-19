
// This component appears to be a duplicate or older version of components/games/GameCard.tsx
// or components/casino/EnhancedGameCard.tsx.
// For now, I will update it to fix the 'isFavorite' error, but it should be reviewed for consolidation.
import React from 'react';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { PlayCircle, Info, Heart } from 'lucide-react'; // Added Heart
import { cn } from '@/lib/utils';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game, mode: 'real' | 'demo') => void; // Pass the full game object
  onDetails?: (game: Game) => void;
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

  return (
    <Card className={cn("overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group", className)}>
      <CardHeader className="p-0 relative">
        <AspectRatio ratio={4 / 3}> {/* Adjusted ratio for better image display */}
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
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-sm z-10">
            NEW
          </div>
        )}
        {game.rtp && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-sm">
            RTP: {typeof game.rtp === 'number' ? game.rtp.toFixed(2) : game.rtp}%
          </div>
        )}
      </CardHeader>
      <CardContent className="p-3 md:p-4">
        <CardTitle className="text-sm md:text-base font-semibold truncate mb-1 group-hover:text-primary transition-colors">
          {game.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground truncate">
          {game.providerName || game.provider || 'Unknown Provider'}
        </p>
      </CardContent>
      <CardFooter className="p-3 md:p-4 pt-0 grid grid-cols-2 gap-2">
        <Button onClick={() => onPlay(game, 'real')} size="sm" className="w-full">
          <PlayCircle className="mr-1 h-4 w-4" /> Real
        </Button>
        <Button onClick={() => onPlay(game, 'demo')} variant="outline" size="sm" className="w-full">
          <PlayCircle className="mr-1 h-4 w-4" /> Demo
        </Button>
        {/* {onDetails && (
          <Button onClick={() => onDetails(game)} variant="link" size="sm" className="col-span-2 text-xs justify-start p-0 h-auto mt-1">
            <Info className="mr-1 h-3 w-3" /> View Details
          </Button>
        )} */}
      </CardFooter>
    </Card>
  );
};

export default GameCard;


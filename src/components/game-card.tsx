
// This is a basic game card, consider using EnhancedGameCard for richer features
// or ensure its props and logic are updated if it's meant to be different.
import React from 'react';
import { Game, GameTag } from '@/types'; // Ensure GameTag is imported if used
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { PlayCircle, Info, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGames } from '@/hooks/useGames'; // Assuming this hook provides favorite logic
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GameCardProps {
  game: Game;
  onPlayClick: (game: Game, mode: 'real' | 'demo') => void;
  onDetailsClick?: (game: Game) => void;
  className?: string;
}

const GameCard: React.FC<GameCardProps> = ({ game, onPlayClick, onDetailsClick, className }) => {
  const { isAuthenticated } = useAuth();
  // Assuming useGames provides toggleFavoriteGame and favoriteGameIds
  const { favoriteGameIds, toggleFavoriteGame } = useGames(); 
  
  const isFavorite = favoriteGameIds.has(String(game.id)) || (game.game_id ? favoriteGameIds.has(game.game_id) : false);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
        toast.info("Please log in to favorite games.");
        return;
    }
    toggleFavoriteGame(String(game.id || game.game_id)); // Pass string ID
  };

  const canPlayDemo = !game.only_real || (game.tags && game.tags.some(t => {
    if (typeof t === 'string') return t === 'demo_playable';
    if (typeof t === 'object' && t !== null && 'slug' in t) return (t as GameTag).slug === 'demo_playable'; // GameTag object check
    return false;
  })) || game.only_demo;

  const canPlayReal = isAuthenticated && !game.only_demo;

  return (
    <Card className={cn("overflow-hidden group", className)} onClick={onDetailsClick ? () => onDetailsClick(game) : undefined}>
      <CardHeader className="p-0 relative">
        <AspectRatio ratio={4 / 3} onClick={!onDetailsClick ? () => onPlayClick(game, canPlayReal ? 'real' : 'demo') : undefined}>
          <img
            src={game.image || game.image_url || game.cover || '/placeholder.svg'}
            alt={game.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
          />
        </AspectRatio>
        {isAuthenticated && (
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/30 hover:bg-primary text-white hover:text-white rounded-full"
                onClick={handleFavoriteToggle}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "text-white")} />
            </Button>
        )}
        {game.isNew && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">NEW</div>
        )}
      </CardHeader>
      <CardContent className="p-3">
        <CardTitle 
            className="text-md font-semibold truncate group-hover:text-primary transition-colors cursor-pointer"
            onClick={onDetailsClick ? () => onDetailsClick(game) : () => onPlayClick(game, canPlayReal ? 'real' : 'demo')}
        >
            {game.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground truncate">
          {game.providerName || game.provider_slug || 'Unknown Provider'}
        </p>
      </CardContent>
      <CardFooter className="p-3 pt-0 grid grid-cols-2 gap-2">
        {canPlayReal && (
            <Button onClick={(e) => { e.stopPropagation(); onPlayClick(game, 'real');}} size="sm" className="w-full">
                <PlayCircle className="mr-1 h-4 w-4" /> Real
            </Button>
        )}
        {canPlayDemo && (
            <Button onClick={(e) => { e.stopPropagation(); onPlayClick(game, 'demo');}} variant={canPlayReal ? "outline" : "default"} size="sm" className="w-full">
                <PlayCircle className="mr-1 h-4 w-4" /> Demo
            </Button>
        )}
         {!canPlayReal && !canPlayDemo && (
            <p className="text-xs text-muted-foreground col-span-full text-center pt-1">Unavailable</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default GameCard;

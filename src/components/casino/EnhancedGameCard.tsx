
import React from 'react';
import { Game } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Star, PlayCircle, Info, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGames } from '@/hooks/useGames'; // For favorite status
import { useAuth } from '@/contexts/AuthContext'; // For checking authentication

interface EnhancedGameCardProps {
  game: Game;
  onPlayClick: (game: Game, mode: 'real' | 'demo') => void;
  onDetailsClick?: (game: Game) => void;
  className?: string;
}

const EnhancedGameCard: React.FC<EnhancedGameCardProps> = ({ game, onPlayClick, onDetailsClick, className }) => {
  const { favoriteGameIds, toggleFavoriteGame } = useGames();
  const { isAuthenticated } = useAuth();
  const isFavorite = favoriteGameIds.has(String(game.id)) || favoriteGameIds.has(String(game.game_id));

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when favoriting
    if (!isAuthenticated) {
        // Optionally, prompt to login
        console.log("Please log in to favorite games.");
        return;
    }
    toggleFavoriteGame(String(game.id || game.game_id));
  };
  
  const canPlayDemo = (game.tags && game.tags.includes('demo_playable')) || !game.provider_slug?.startsWith('pragmaticplay'); // Example logic
  const canPlayReal = isAuthenticated; // Simplified, actual logic might depend on game status, user region etc.


  return (
    <Card className={cn("overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group bg-card", className)}>
      <CardHeader className="p-0 relative">
        <AspectRatio ratio={4 / 3}>
          <img
            src={game.image || game.image_url || game.cover || '/placeholder.svg'}
            alt={game.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </AspectRatio>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          {/* Overlay content on hover */}
        </div>
        {isAuthenticated && (
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/30 hover:bg-primary text-white hover:text-white"
                onClick={handleFavoriteToggle}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "text-white")} />
            </Button>
        )}
        {(game.isNew || (game.tags && game.tags.includes('new'))) && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">NEW</div>
        )}
        {game.rtp && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            RTP: {typeof game.rtp === 'number' ? game.rtp.toFixed(2) : game.rtp}%
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold truncate mb-1 group-hover:text-primary transition-colors">
          {game.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground truncate">
          {game.providerName || game.provider || 'Unknown Provider'}
        </p>
        {/* {game.volatility && (
          <p className="text-xs text-muted-foreground mt-1">Volatility: {game.volatility}</p>
        )} */}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {canPlayReal && (
             <Button 
                onClick={(e) => { e.stopPropagation(); onPlayClick(game, 'real'); }} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
            >
                <PlayCircle className="mr-2 h-4 w-4" /> Play Real
            </Button>
        )}
        {canPlayDemo && (
            <Button 
                onClick={(e) => { e.stopPropagation(); onPlayClick(game, 'demo'); }} 
                variant={canPlayReal ? "outline" : "default"} 
                className={cn("w-full", !canPlayReal && "bg-secondary hover:bg-secondary/90 text-secondary-foreground")}
                size="sm"
            >
                <PlayCircle className="mr-2 h-4 w-4" /> Play Demo
            </Button>
        )}
        {!canPlayReal && !canPlayDemo && (
            <p className="text-xs text-muted-foreground col-span-full text-center">Game not available</p>
        )}
        {/* {onDetailsClick && (
          <Button onClick={() => onDetailsClick(game)} variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-primary">
            <Info className="mr-2 h-4 w-4" /> Details
          </Button>
        )} */}
      </CardFooter>
    </Card>
  );
};

export default EnhancedGameCard;

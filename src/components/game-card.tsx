import React from 'react';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { Heart, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; 
import { Badge } from '@/components/ui/badge'; 
import { useGamesData } from '@/hooks/useGames'; // Changed to useGamesData

export interface GameCardProps {
  game: Game;
  // isFavorite is now derived from context
  // onToggleFavorite is now from context
  className?: string;
  onPlay?: (game: Game) => void; 
}

const GameCard: React.FC<GameCardProps> = ({ game, className, onPlay }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); 
  const { toggleFavoriteGame, isFavorite: isGameFavorite } = useGamesData(); // Use context functions

  const gameIdStr = String(game.id);
  const isFavorite = isGameFavorite(gameIdStr); // Use context function

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (onPlay) {
      onPlay(game);
    } else if (game.slug) { 
      navigate(`/casino/game/${game.slug}`);
    } else if (gameIdStr) {
       navigate(`/casino/game/${gameIdStr}`);
    } else {
      console.warn("No slug or ID for game navigation:", game.title);
    }
  };
  
  const handleDetailsClick = () => {
    if (game.slug) {
        navigate(`/casino/game/${game.slug}`);
    } else if (gameIdStr) {
        navigate(`/casino/game/${gameIdStr}`);
    } else {
      console.warn("No slug or ID for game details navigation:", game.title);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!gameIdStr) {
        console.error("Cannot toggle favorite: Game ID is missing.");
        return;
    }
    toggleFavoriteGame(gameIdStr); // Call context function
  };

  const providerDisplay = game.providerName || game.provider_slug || '';

  return (
    <div 
      className={cn(
        "bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-primary/20 transition-all duration-300 flex flex-col group relative",
        className
      )}
    >
      <div className="relative">
        <img 
          src={game.image || game.cover || game.image_url || '/placeholder.svg'} 
          alt={game.title || 'Game image'} 
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onClick={handleDetailsClick}
          style={{ cursor: 'pointer' }}
        />
        {isAuthenticated && ( 
            <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
                "absolute top-2 right-2 rounded-full bg-black/40 hover:bg-black/60 text-white p-1.5 z-20", 
                isFavorite ? "text-red-500 hover:text-red-400" : "text-white/70 hover:text-white"
            )}
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </Button>
        )}
        <div className="absolute top-2 left-2 z-20 space-y-1">
            {game.isNew && <Badge variant="destructive" className="text-xs">New</Badge>}
            {game.is_featured && <Badge variant="secondary" className="text-xs bg-amber-500 text-black">Featured</Badge>}
        </div>
        
        <div 
            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" 
            onClick={handlePlay} 
            style={{ cursor: 'pointer' }}
        >
            <PlayCircle className="h-16 w-16 text-white" />
        </div>
      </div>

      <div className="p-3 md:p-4 flex flex-col flex-grow">
        <h3 
            className="text-base font-semibold truncate group-hover:text-primary transition-colors leading-tight" 
            title={game.title}
            onClick={handleDetailsClick}
            style={{ cursor: 'pointer' }}
        >
          {game.title || 'Untitled Game'}
        </h3>
        {providerDisplay && <p className="text-xs text-muted-foreground mb-1 truncate">{providerDisplay}</p>}
        
        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
            {typeof game.rtp === 'number' && game.rtp > 0 && (
                <p>RTP: {game.rtp}%</p>
            )}
            {game.volatility && (
                <p className="capitalize">Volatility: {game.volatility}</p>
            )}
        </div>

        <div className="mt-auto pt-3">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handlePlay} 
            size="sm"
          >
            <PlayCircle className="mr-2 h-4 w-4" /> Play
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;

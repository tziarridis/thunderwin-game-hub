
import React from 'react';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { Heart, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; // Added for isAuthenticated check

export interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
  className?: string;
  onPlay?: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, isFavorite, onToggleFavorite, className, onPlay }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Get auth state

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (onPlay) {
      onPlay(game);
    } else if (game.slug) {
      navigate(`/casino/game/${game.slug}`);
    } else {
      console.warn("No slug or onPlay handler for game:", game.title);
      // Consider adding a toast message here for user feedback
    }
  };
  
  const handleDetailsClick = () => {
    // If onPlay is defined, card click might be reserved for that.
    // If onPlay is NOT defined, then card click goes to details.
    if (!onPlay) {
        if (game.slug) {
            navigate(`/casino/game/${game.slug}`);
        } else if (game.id) {
            // Fallback if slug is not available, though slug is preferred
             navigate(`/casino/game/${String(game.id)}`);
        }
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(String(game.id)); // Ensure gameId is string
  };

  return (
    <div 
      className={cn("bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col group cursor-pointer", className)}
      onClick={handleDetailsClick} // Card click navigates to details if no onPlay
    >
      <div className="relative">
        <img 
          src={game.image || game.cover || '/placeholder.svg'} 
          alt={game.title} 
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {isAuthenticated && ( // Show favorite button only if authenticated
            <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
                "absolute top-2 right-2 rounded-full bg-black/30 hover:bg-black/50 text-white p-1.5",
                isFavorite ? "text-red-500 hover:text-red-400" : "text-white/70 hover:text-white"
            )}
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </Button>
        )}
        {(game.isNew || game.is_featured) && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold rounded">
            {game.isNew ? 'New' : game.is_featured ? 'Featured' : ''}
          </div>
        )}
        {/* Overlay Play Button - appears on hover */}
        <div 
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={handlePlay} // Make overlay clickable for play as well
        >
            <PlayCircle className="h-16 w-16 text-white" />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors" title={game.title}>
          {game.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-1">{game.providerName || game.provider}</p>
        
        {game.rtp && (
            <p className="text-xs text-muted-foreground">RTP: {typeof game.rtp === 'string' ? game.rtp : `${game.rtp}%`}</p>
        )}
        {game.volatility && (
            <p className="text-xs text-muted-foreground capitalize">Volatility: {game.volatility}</p>
        )}

        <div className="mt-auto pt-3">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handlePlay} // Explicit Play button
          >
            <PlayCircle className="mr-2 h-5 w-5" /> Play Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;


import React from 'react';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { Heart, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; 

export interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
  className?: string;
  onPlay?: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, isFavorite, onToggleFavorite, className, onPlay }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); 

  const gameIdStr = String(game.id || game.game_id || game.slug); // Ensure we have a string ID

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (onPlay) {
      onPlay(game);
    } else if (game.slug) {
      navigate(`/casino/game/${game.slug}`);
    } else if (gameIdStr) {
       navigate(`/casino/game/${gameIdStr}`);
    }else {
      console.warn("No slug or ID for game navigation:", game.title);
    }
  };
  
  const handleDetailsClick = () => {
    // If onPlay is defined, card click might be reserved for that.
    // If onPlay is NOT defined, then card click goes to details.
    // Or always navigate to details on card click, and play button for actual play.
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
    onToggleFavorite(gameIdStr); 
  };

  const providerDisplay = game.providerName || game.provider_slug || game.provider || '';
  const gameTags = game.tags || [];

  return (
    <div 
      className={cn("bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col group", className)}
      // onClick={handleDetailsClick} // Can enable this if card click should always go to details
    >
      <div className="relative">
        <img 
          src={game.image || game.cover || game.image_url || '/placeholder.svg'} 
          alt={game.title || 'Game image'} 
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onClick={handleDetailsClick} // Image click navigates to details
          style={{ cursor: 'pointer' }}
        />
        {isAuthenticated && ( 
            <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
                "absolute top-2 right-2 rounded-full bg-black/40 hover:bg-black/60 text-white p-1.5 z-10",
                isFavorite ? "text-red-500 hover:text-red-400" : "text-white/70 hover:text-white"
            )}
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </Button>
        )}
        {(game.isNew || game.is_featured) && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold rounded z-10">
            {game.isNew ? 'New' : game.is_featured ? 'Featured' : ''}
          </div>
        )}
        {/* Overlay Play Button - appears on hover */}
        <div 
            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
            onClick={handlePlay} 
            style={{ cursor: 'pointer' }}
        >
            <PlayCircle className="h-16 w-16 text-white" />
        </div>
      </div>

      <div className="p-3 md:p-4 flex flex-col flex-grow">
        <h3 
            className="text-md font-semibold truncate group-hover:text-primary transition-colors" 
            title={game.title}
            onClick={handleDetailsClick}
            style={{ cursor: 'pointer' }}
        >
          {game.title || 'Untitled Game'}
        </h3>
        {providerDisplay && <p className="text-xs text-muted-foreground mb-1">{providerDisplay}</p>}
        
        {typeof game.rtp === 'number' || (typeof game.rtp === 'string' && game.rtp) ? (
            <p className="text-xs text-muted-foreground">RTP: {game.rtp}{typeof game.rtp === 'number' ? '%' : ''}</p>
        ) : null}
        {game.volatility && (
            <p className="text-xs text-muted-foreground capitalize">Volatility: {game.volatility}</p>
        )}

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

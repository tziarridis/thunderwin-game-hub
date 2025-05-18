
import React from 'react';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { Heart, PlayCircle } from 'lucide-react'; // Removed Star as it's not used here
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (gameId: string) => void;
  className?: string;
  onPlay?: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, isFavorite, onToggleFavorite, className, onPlay }) => {
  const navigate = useNavigate();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (onPlay) {
      onPlay(game);
    } else if (game.slug) {
      navigate(`/casino/game/${game.slug}`);
    } else {
      console.warn("No slug or onPlay handler for game:", game.title);
    }
  };
  
  const handleDetailsClick = () => {
    if (game.slug) {
      navigate(`/casino/game/${game.slug}`);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(game.id);
  };

  return (
    <div 
      className={cn("bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col group cursor-pointer", className)}
      onClick={handleDetailsClick}
    >
      <div className="relative">
        <img 
          src={game.image || '/placeholder.svg'} 
          alt={game.title} 
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />
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
        {(game.isNew || game.is_featured) && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold rounded">
            {game.isNew ? 'New' : game.is_featured ? 'Featured' : ''}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors" title={game.title}>
          {game.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-1">{game.providerName || game.provider}</p>
        
        {game.rtp && (
            <p className="text-xs text-muted-foreground">RTP: {game.rtp}%</p>
        )}
        {game.volatility && (
            <p className="text-xs text-muted-foreground capitalize">Volatility: {game.volatility}</p>
        )}

        <div className="mt-auto pt-3">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handlePlay}
          >
            <PlayCircle className="mr-2 h-5 w-5" /> Play Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;

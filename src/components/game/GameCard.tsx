
import React from 'react';
import { Link } from 'react-router-dom';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Heart, PlayCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface GameCardProps extends React.HTMLAttributes<HTMLDivElement> {
  game: Game;
  isFavorite?: boolean;
  onToggleFavorite?: (gameId: string) => void;
  onPlay?: (game: Game) => void;
  onDetails?: (game: Game) => void; // For navigating to a game details page
  showProvider?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  isFavorite,
  onToggleFavorite,
  onPlay,
  onDetails,
  className,
  showProvider = true,
  variant = 'default',
  ...props
}) => {
  const { isAuthenticated } = useAuth();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onToggleFavorite && game.id) {
      onToggleFavorite(String(game.id));
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onPlay) {
      onPlay(game);
    }
  };
  
  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDetails) {
      onDetails(game);
    } else if (onPlay) { // Fallback to onPlay if no onDetails
      onPlay(game);
    }
  };

  const gameImage = game.cover || game.image || '/placeholder-game.png';
  const providerNameDisplay = typeof game.providerName === 'object' 
    ? (game.providerName as { name: string }).name 
    : game.providerName;

  return (
    <div
      className={cn(
        'thunder-card group relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-neon',
        variant === 'compact' ? 'w-full' : 'w-full',
        className
      )}
      onClick={handleDetailsClick} // Main click action
      {...props}
    >
      <AspectRatio ratio={3 / 4} className="bg-slate-900">
        <LazyLoadImage
          alt={game.title || 'Game image'}
          src={gameImage}
          effect="blur"
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          placeholderSrc="/placeholder-game-lazy.png" // Small, low-quality placeholder
        />
      </AspectRatio>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <h3 className={cn(
          "font-bold text-white truncate",
          variant === 'compact' ? 'text-sm' : 'text-base md:text-lg'
        )}>
          {game.title}
        </h3>
        {showProvider && providerNameDisplay && (
          <p className={cn(
            "text-xs text-casino-thunder-green/80 truncate",
             variant === 'compact' ? 'hidden sm:block' : '' // Hide provider on compact mobile
          )}>
            {providerNameDisplay} {/* Corrected usage */}
          </p>
        )}

        <div className="mt-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">
          {onPlay && (
            <Button
              size="sm"
              variant="ghost"
              className="bg-casino-thunder-green/80 hover:bg-casino-thunder-green text-casino-thunder-darker px-3 py-1.5 h-auto rounded-md"
              onClick={handlePlayClick}
              aria-label={`Play ${game.title}`}
            >
              <PlayCircle size={variant === 'compact' ? 16 : 18} className="mr-1.5" />
              Play
            </Button>
          )}
          {onToggleFavorite && isAuthenticated && (
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "text-white/70 hover:text-red-500 rounded-full p-1.5 h-auto w-auto",
                isFavorite ? 'text-red-500' : ''
              )}
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
            >
              <Heart size={variant === 'compact' ? 16: 18} fill={isFavorite ? 'currentColor' : 'none'} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Visible info bar when not hovered (optional) */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent group-hover:opacity-0 transition-opacity duration-200 pointer-events-none">
        <h3 className={cn(
            "font-semibold text-white truncate",
            variant === 'compact' ? 'text-xs' : 'text-sm'
        )}>
            {game.title}
        </h3>
        {showProvider && providerNameDisplay && variant !== 'compact' && (
          <p className="text-xs text-casino-thunder-green/70 truncate">{providerNameDisplay}</p>
        )}
      </div>

      {game.isNew && (
        <div className="absolute top-2 right-2 bg-casino-gold text-casino-thunder-darker px-2 py-0.5 rounded-full text-xs font-bold shadow-md">
          NEW
        </div>
      )}
    </div>
  );
};

export default GameCard;

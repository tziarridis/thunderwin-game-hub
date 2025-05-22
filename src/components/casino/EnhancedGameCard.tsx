import React from 'react';
import { Game } from '@/types/game';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Heart, PlayCircle, Info } from 'lucide-react';
import { useGamesData } from '@/hooks/useGames'; // Changed to useGamesData
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface EnhancedGameCardProps {
  game: Game;
  onPlay?: (game: Game, mode: 'real' | 'demo') => void;
  onDetails?: (game: Game) => void;
  className?: string;
}

const EnhancedGameCard: React.FC<EnhancedGameCardProps> = ({ 
  game,
  onPlay,
  onDetails,
  className 
}) => {
  const { isAuthenticated } = useAuth();
  const { toggleFavoriteGame, isFavorite: isGameFavorite } = useGamesData(); // Use context functions

  const isFavorite = isGameFavorite(String(game.id));

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.info("Please log in to favorite games");
      return;
    }
    
    toggleFavoriteGame(String(game.id)); // Call context function
  };

  const handlePlayClick = (e: React.MouseEvent, mode: 'real' | 'demo') => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(game, mode);
    }
  };

  const handleCardClick = () => {
    if (onDetails) {
      onDetails(game);
    }
  };

  const canPlayDemo = !game.only_real;
  const canPlayReal = isAuthenticated && !game.only_demo;

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="p-0 relative">
        <AspectRatio ratio={4/3}>
          <img 
            src={game.image || game.cover || '/placeholder-game.png'} 
            alt={game.title}
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-game.png';
            }}
          />
        </AspectRatio>
        
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8"
            onClick={handleFavoriteToggle}
          >
            <Heart 
              className={cn("h-4 w-4", 
                isFavorite ? "fill-red-500 text-red-500" : "text-white"
              )} 
            />
          </Button>
        )}
        
        {game.is_new && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded font-medium">
            NEW
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-3">
        <h3 className="font-medium text-sm mb-1 truncate">{game.title}</h3>
        <p className="text-xs text-muted-foreground truncate">
          {game.provider_slug || game.providerName || 'Unknown Provider'}
        </p>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 grid grid-cols-2 gap-2">
        {canPlayReal && (
          <Button 
            size="sm"
            className="w-full"
            onClick={(e) => handlePlayClick(e, 'real')}
          >
            <PlayCircle className="mr-1 h-4 w-4" />
            Real
          </Button>
        )}
        
        {canPlayDemo && (
          <Button 
            variant={canPlayReal ? "outline" : "default"}
            size="sm"
            className="w-full"
            onClick={(e) => handlePlayClick(e, 'demo')}
          >
            <PlayCircle className="mr-1 h-4 w-4" />
            Demo
          </Button>
        )}
        
        {!canPlayReal && !canPlayDemo && (
          <Button 
            variant="outline"
            size="sm"
            className="w-full col-span-2"
            onClick={handleCardClick}
          >
            <Info className="mr-1 h-4 w-4" />
            Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EnhancedGameCard;

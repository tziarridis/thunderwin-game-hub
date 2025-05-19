import React, { useMemo } from 'react';
import { Game } from '@/types';
import { useGames } from '@/hooks/useGames';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Heart, PlayCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import GameSectionLoading from './GameSectionLoading'; // Assuming this component handles its own appearance

interface FeaturedGamesProps {
  count?: number;
  className?: string;
  title?: string;
}

const FeaturedGameCard: React.FC<{ game: Game; onPlay: (game: Game, mode: 'real' | 'demo') => void; isFavorite: boolean; onToggleFavorite: (gameId: string) => void; isAuthenticated: boolean; }> = ({ game, onPlay, isFavorite, onToggleFavorite, isAuthenticated }) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      onToggleFavorite(String(game.id || game.game_id));
    } else {
      // Optionally, prompt to log in or show a toast
      console.log("User not authenticated, cannot toggle favorite.");
      // toast.info("Please log in to manage your favorites.");
    }
  };
  
  // Determine if demo play is allowed. Pragmatic Play often restricts demo.
  // This logic might need refinement based on specific game properties or provider rules.
  const canPlayDemo = (game.tags && game.tags.includes('demo_playable')) || !game.provider_slug?.startsWith('pragmaticplay'); 
  
  return (
    <Card 
      className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group relative cursor-pointer bg-card border-border/50"
      onClick={() => onPlay(game, isAuthenticated && !(game.tags || []).includes('demo_only') ? 'real' : 'demo')}
    >
      <AspectRatio ratio={3/4} className="overflow-hidden">
        <img
          src={game.image || game.image_url || game.cover || '/placeholder.svg'}
          alt={game.title}
          className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-110"
          onError={(e) => (e.currentTarget.src = '/placeholder.svg')} // Fallback for broken images
        />
      </AspectRatio>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      {isAuthenticated && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-20 text-white hover:text-red-500 bg-black/30 hover:bg-black/50 rounded-full p-1.5" // Adjusted styling
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "text-white")} />
        </Button>
      )}

      {(game.isNew || (game.tags && game.tags.includes('new'))) && (
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-sm z-10">
          NEW
        </div>
      )}
      {game.rtp && (
        <div className="absolute bottom-14 left-3 md:bottom-16 bg-black/60 text-white text-xs px-2 py-0.5 rounded-sm z-10">
            RTP {typeof game.rtp === 'number' ? game.rtp.toFixed(2) : game.rtp}%
        </div>
      )}

      <CardContent className="absolute bottom-0 left-0 right-0 p-3 md:p-4 z-10">
        <h3 className="text-sm md:text-base font-semibold text-white truncate group-hover:text-primary transition-colors">
          {game.title}
        </h3>
        <p className="text-xs text-gray-300 truncate">
          {game.providerName || game.provider_slug || game.provider || 'Casino Provider'}
        </p>
      </CardContent>
      
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-black/50">
        <Button 
            variant="default" 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg scale-90 group-hover:scale-100 transition-transform"
            onClick={(e) => {
                e.stopPropagation(); 
                onPlay(game, isAuthenticated && !(game.tags || []).includes('demo_only') ? 'real' : 'demo');
            }}
        >
            <PlayCircle className="mr-2 h-5 w-5" /> Play Now
        </Button>
      </div>
    </Card>
  );
};


const FeaturedGames: React.FC<FeaturedGamesProps> = ({ count = 8, className, title = "Featured Games" }) => {
  const { games, isLoading, error, favoriteGameIds, toggleFavoriteGame } = useGames();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const featuredGames = useMemo(() => {
    return games
      .filter(game => game.is_featured || (game.tags && game.tags.includes('featured')))
      .slice(0, count);
  }, [games, count]);

  const handlePlayGame = (game: Game, mode: 'real' | 'demo') => {
    navigate(`/casino/game/${game.slug || game.id}?mode=${mode}`);
  };

  if (isLoading && featuredGames.length === 0) { // Show loading only if no games are ready yet
    // Corrected: GameSectionLoading likely doesn't take these specific props or any.
    return <GameSectionLoading />;
  }

  if (error) {
    return (
      <div className={cn("py-8 text-center", className)}>
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-2" />
        <p className="text-destructive">Could not load featured games.</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }
  
  if (featuredGames.length === 0 && !isLoading) { // Show message if loading is done and still no games
     return (
      <div className={cn("py-8", className)}>
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
        <p className="text-center text-muted-foreground">No featured games available at the moment. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className={cn("py-8", className)}>
      <h2 className="text-3xl font-bold mb-8 text-center tracking-tight">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {featuredGames.map(game => (
          <FeaturedGameCard
            key={game.id || game.game_id}
            game={game}
            onPlay={handlePlayGame}
            isFavorite={favoriteGameIds.has(String(game.id || game.game_id))}
            onToggleFavorite={toggleFavoriteGame}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedGames;

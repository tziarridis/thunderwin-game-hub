
import React from 'react';
import { Game, GameTag } from '@/types'; // Ensure GameTag is imported if used for game.tags
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { PlayCircle, Info, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { LazyLoadImage } from 'react-lazy-load-image-component'; // Dependency added
// import 'react-lazy-load-image-component/src/effects/blur.css'; // Optional: if you want blur effect

interface GameCardProps { // Removed 'extends React.HTMLAttributes<HTMLDivElement>'
  game: Game;
  onPlay?: (game: Game, mode: 'real' | 'demo') => void; // Renamed from onPlayClick to match other cards, made optional
  onDetails?: (game: Game) => void; // Renamed for consistency
  className?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (gameId: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({ 
  game, 
  onPlay, 
  onDetails, 
  className,
  isFavorite,
  onToggleFavorite
}) => {
  
  // Simplified playability check, assuming context/auth handles real play enabling
  const canPlayDemo = !game.only_real || game.only_demo || (game.tags && game.tags.some(t => {
    if (typeof t === 'string') return t === 'demo_playable';
    if (typeof t === 'object' && t !== null && 'slug' in t) return (t as GameTag).slug === 'demo_playable';
    return false;
  }));
  
  // This component might not have full auth context, so real play logic might be simpler or passed via props
  const canPlayReal = !game.only_demo; // Simplified: assumes if not demo only, real is possible if onPlay is wired for it

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(String(game.id || game.game_id));
    }
  };
  
  const defaultPlayHandler = () => {
    if (onPlay) {
        onPlay(game, canPlayReal ? 'real' : 'demo');
    }
  };

  const defaultDetailsHandler = () => {
      if (onDetails) {
          onDetails(game);
      } else if (onPlay) { // Fallback to play if no details handler
          defaultPlayHandler();
      }
  }

  return (
    <Card 
      className={cn("overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 group bg-card cursor-pointer", className)}
      onClick={defaultDetailsHandler}
    >
      <CardHeader className="p-0 relative">
        <AspectRatio ratio={4 / 3}>
          {/* <LazyLoadImage
            alt={game.title}
            src={game.image || game.image_url || game.cover || '/placeholder.svg'}
            effect="blur" // Optional
            width="100%"
            height="100%"
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            placeholderSrc="/placeholder.svg" // Small placeholder
            onError={(e: any) => (e.target.src = '/placeholder.svg')}
          /> */}
           <img
            src={game.image || game.image_url || game.cover || '/placeholder.svg'}
            alt={game.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
          />
        </AspectRatio>
        {onToggleFavorite && (
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/30 hover:bg-primary text-white hover:text-white rounded-full"
                onClick={handleFavoriteClick}
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
        <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
          {game.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground truncate">
          {game.providerName || game.provider_slug || 'Unknown Provider'}
        </p>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        {onPlay && (canPlayReal || canPlayDemo) ? (
          <Button onClick={(e) => {e.stopPropagation(); onPlay(game, canPlayReal ? 'real' : 'demo')}} className="w-full" size="sm">
            <PlayCircle className="mr-2 h-4 w-4" /> Play {canPlayReal ? 'Now' : 'Demo'}
          </Button>
        ) : (
          <Button className="w-full" size="sm" variant="outline" disabled>
            Unavailable
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GameCard;

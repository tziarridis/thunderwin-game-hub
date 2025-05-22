
import React from 'react';
import GameCard from '@/components/games/GameCard';
import { Game } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useGames } from '@/hooks/useGames'; // Fixed import to use the main hook

interface CasinoGameGridProps {
  games: Game[];
  onGameClick?: (game: Game) => void;
  showEmptyMessage?: boolean;
}

const CasinoGameGrid = ({ games, onGameClick, showEmptyMessage = true }: CasinoGameGridProps) => {
  const { isAuthenticated } = useAuth();
  const { favoriteGameIds, toggleFavoriteGame, launchGame, isFavorite } = useGames(); 
  
  const handleToggleFavorite = async (gameId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add favorites");
      return;
    }
    if (!gameId) {
        toast.error("Game ID is missing for favorite toggle.");
        return;
    }
    await toggleFavoriteGame(gameId); // Call context function
  };

  const handlePlayAction = (game: Game) => {
    if (onGameClick) {
        onGameClick(game); 
    } else if (game.game_id && (game.provider_slug || game.providerName)) {
        console.log("Direct play from CasinoGameGrid for:", game.title);
        launchGame(game, {mode: 'real'}) // Call context function
            .then(url => {
                if (url) window.open(url, '_blank');
                else toast.error("Could not get game URL.");
            })
            .catch(err => toast.error(`Launch error: ${(err as Error).message}`));
    } else {
        toast.error("Cannot launch game: missing details or play action.");
    }
  };
  
  if (!games || games.length === 0) {
    return showEmptyMessage ? (
      <div className="text-center py-10">
        <p className="text-muted-foreground text-lg">No games available</p>
      </div>
    ) : null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard 
          key={String(game.id)}
          game={game}
          isFavorite={isFavorite(String(game.id))} // Use context function
          onToggleFavorite={() => handleToggleFavorite(String(game.id))}
          onPlay={() => handlePlayAction(game)} 
        />
      ))}
    </div>
  );
};

export default CasinoGameGrid;

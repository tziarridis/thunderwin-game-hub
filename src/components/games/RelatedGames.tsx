import React from 'react';
import { Game } from '@/types/game';
import { useGames } from '@/hooks/useGames'; // Corrected: useGames for context
import GameCard from './GameCard';
import { toast } from 'sonner';

interface RelatedGamesProps {
  game: Game;
  count?: number;
}

const RelatedGames: React.FC<RelatedGamesProps> = ({ game, count = 4 }) => {
  const { games, getGamesByCategory, launchGame, isFavorite, toggleFavoriteGame, isAuthenticated } = useGames();

  const relatedGames = React.useMemo(() => {
    if (!game || !game.category_slugs || !getGamesByCategory) return [];

    const related = game.category_slugs.flatMap(categorySlug => {
      return getGamesByCategory(categorySlug)
        .filter(relatedGame => relatedGame.id !== game.id); // Exclude the current game
    });

    // Remove duplicates and limit the count
    const uniqueRelatedGames = Array.from(new Set(related.map(a => a.id)))
      .map(id => {
        return related.find(a => a.id === id)
      })
      .slice(0, count) as Game[];

    return uniqueRelatedGames;
  }, [game, games, count, getGamesByCategory]);

  const handleToggleFavorite = async (gameId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add favorites");
      return;
    }
    await toggleFavoriteGame(gameId);
  };

  const handlePlayAction = (game: Game) => {
    if (game.game_id && (game.provider_slug || game.providerName)) {
      launchGame(game, { mode: 'real' })
        .then(url => {
          if (url) window.open(url, '_blank');
          else toast.error("Could not get game URL.");
        })
        .catch(err => toast.error(`Launch error: ${(err as Error).message}`));
    } else {
      toast.error("Cannot launch game: missing details or play action.");
    }
  };

  if (!relatedGames || relatedGames.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">You might also like</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {relatedGames.map((relatedGame) => (
          <GameCard
            key={relatedGame.id}
            game={relatedGame}
            isFavorite={isFavorite(relatedGame.id)}
            onToggleFavorite={() => handleToggleFavorite(relatedGame.id)}
            onPlay={() => handlePlayAction(relatedGame)}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedGames;

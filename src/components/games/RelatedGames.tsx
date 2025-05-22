import React from 'react';
import { Game } from '@/types/game';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import GameCard from './GameCard';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface RelatedGamesProps {
  game: Game;
  count?: number;
}

const RelatedGames: React.FC<RelatedGamesProps> = ({ game, count = 4 }) => {
  const { games, getGamesByCategory, launchGame, isFavorite, toggleFavoriteGame } = useGames();
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from useAuth
  const navigate = useNavigate();

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
      // Optionally, redirect to login: navigate('/login', { state: { from: location } });
      return;
    }
    await toggleFavoriteGame(gameId);
  };

  const handlePlayAction = async (gameToPlay: Game) => { // Renamed from game to gameToPlay
    if (gameToPlay.game_id && (gameToPlay.provider_slug || gameToPlay.providerName)) {
      try {
        const url = await launchGame(gameToPlay, { mode: 'real' });
        if (url) {
          // For related games, maybe navigate to seamless launch or open in new tab
          // navigate(`/casino/seamless`, { state: { gameUrl: url, gameTitle: gameToPlay.title } });
          window.open(url, '_blank');
        } else {
          toast.error("Could not get game URL. Please try again later.");
          // Fallback: navigate to game details page if launch fails
          navigate(`/casino/game/${gameToPlay.slug || gameToPlay.id}`);
        }
      } catch (err) {
        toast.error(`Launch error: ${(err as Error).message}`);
        navigate(`/casino/game/${gameToPlay.slug || gameToPlay.id}`);
      }
    } else {
      toast.error("Cannot launch game: missing details or play action.");
      // Fallback to game details page
      navigate(`/casino/game/${gameToPlay.slug || gameToPlay.id}`);
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

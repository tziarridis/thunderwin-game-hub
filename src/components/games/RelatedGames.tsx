
import React from 'react';
import { Game } from '@/types';
import GameCard from './GameCard'; // Ensure this path is correct
import { useGames } from '@/hooks/useGames';
import { useNavigate } from 'react-router-dom';

interface RelatedGamesProps {
  games: Game[];
}

const RelatedGames: React.FC<RelatedGamesProps> = ({ games }) => {
  const { favoriteGameIds, toggleFavoriteGame } = useGames();
  const navigate = useNavigate();

  if (!games || games.length === 0) {
    return (
      <div className="bg-card p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Related Games</h3>
        <p className="text-center text-muted-foreground">No related games found.</p>
      </div>
    );
  }
  
  const handleGamePlayOrDetails = (game: Game) => {
    // Primarily navigate to details page for related games
    if (game.slug) {
      navigate(`/casino/game/${game.slug}`);
    } else if (game.id) {
      navigate(`/casino/game/${game.id}`); // Fallback if slug is not present
    } else {
      console.warn("No identifier to navigate to game:", game.title);
      toast.error("Could not open related game.");
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4 text-foreground">Related Games</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Adjust grid for context */}
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isFavorite={favoriteGameIds.has(game.id as string)}
            onToggleFavorite={() => toggleFavoriteGame(game.id as string)}
            onPlay={() => handleGamePlayOrDetails(game)} // Navigate to details on play click
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedGames;

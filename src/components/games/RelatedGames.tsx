
import React from 'react';
import { Game } from '@/types';
import GameCard from './GameCard';
import { useGames } from '@/hooks/useGames';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; // Added toast import

interface RelatedGamesProps {
  games: Game[];
  // title?: string; // Optional title for the section
}

const RelatedGames: React.FC<RelatedGamesProps> = ({ games }) => {
  const { favoriteGameIds, toggleFavoriteGame, launchGame } = useGames(); // Added launchGame
  const navigate = useNavigate();

  if (!games || games.length === 0) {
    // Optionally render nothing or a minimal message if no related games
    return null; 
    /*
    return (
      <div className="bg-card p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Related Games</h3>
        <p className="text-center text-muted-foreground">No related games found.</p>
      </div>
    );
    */
  }
  
  const handleGamePlayOrDetails = (game: Game) => {
    // For related games, clicking "Play" might launch directly or navigate to details
    // If direct launch is preferred:
    if (game.game_id && game.provider_slug) {
        launchGame(game, { mode: 'real' }) // Or 'demo'
            .then(launchUrl => {
                if (launchUrl) {
                    window.open(launchUrl, '_blank');
                } else {
                    toast.error("Could not launch related game.");
                }
            });
    } else if (game.slug) { // Fallback to details page
      navigate(`/casino/game/${game.slug}`);
    } else if (game.id) {
      navigate(`/casino/game/${String(game.id)}`);
    } else {
      console.warn("No identifier to navigate to game:", game.title);
      toast.error("Could not open related game.");
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4 text-foreground">Related Games</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"> {/* Adjusted grid for more items */}
        {games.map((game) => (
          <GameCard
            key={String(game.id)}
            game={game}
            isFavorite={favoriteGameIds.has(String(game.id))}
            onToggleFavorite={() => toggleFavoriteGame(String(game.id))}
            onPlay={() => handleGamePlayOrDetails(game)}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedGames;

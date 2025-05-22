import React from 'react';
import { Game } from '@/types';
import GameCard from './GameCard';
import { useGamesData } from '@/hooks/useGames'; // Changed to useGamesData
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; // Added toast import

interface RelatedGamesProps {
  games: Game[];
}

const RelatedGames: React.FC<RelatedGamesProps> = ({ games }) => {
  const { launchGame } = useGamesData(); // GameCard will use context for favorites
  const navigate = useNavigate();

  if (!games || games.length === 0) {
    return null; 
  }
  
  const handleGamePlayOrDetails = (game: Game) => {
    if (game.game_id && (game.provider_slug || game.providerName) ) { // Added providerName check
        launchGame(game, { mode: 'real' }) // Call context function
            .then(launchUrl => {
                if (launchUrl) {
                    window.open(launchUrl, '_blank');
                } else {
                    // Error handled by launchGame
                    // toast.error("Could not launch related game."); 
                }
            });
    } else if (game.slug) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {games.map((game) => (
          <GameCard
            key={String(game.id)}
            game={game}
            // isFavorite and onToggleFavorite handled by GameCard internally
            onPlay={() => handleGamePlayOrDetails(game)}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedGames;

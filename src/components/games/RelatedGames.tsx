
import React from 'react';
import { Game } from '@/types';
import GameCard from './GameCard';
import { useGamesData } from '@/hooks/useGames';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface RelatedGamesProps {
  games: Game[];
}

const RelatedGames: React.FC<RelatedGamesProps> = ({ games }) => {
  const { launchGame, isFavorite, toggleFavoriteGame } = useGamesData();
  const navigate = useNavigate();

  if (!games || games.length === 0) {
    return null; 
  }
  
  const handleGamePlayOrDetails = (game: Game) => {
    if (game.game_id && (game.provider_slug || game.providerName) ) {
        launchGame(game, { mode: 'real' })
            .then(launchUrl => {
                if (launchUrl) {
                    window.open(launchUrl, '_blank');
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
            isFavorite={isFavorite(String(game.id))}
            onToggleFavorite={toggleFavoriteGame}
            onPlay={() => handleGamePlayOrDetails(game)}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedGames;


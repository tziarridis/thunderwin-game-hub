
import React from 'react';
import { Game } from '@/types';
import GameCard from './GameCard'; // Main GameCard
import { useGames } from '@/hooks/useGames';
import { useNavigate } from 'react-router-dom'; // For navigation if needed

interface GameListProps {
  games: Game[];
  title?: string; // Optional title for the list
  // Add any other props needed, e.g., onGameClick (if GameCard itself doesn't handle it)
}

const GameList: React.FC<GameListProps> = ({ games, title }) => {
  const { favoriteGameIds, toggleFavoriteGame, launchGame } = useGames();
  const navigate = useNavigate();

  if (!games || games.length === 0) {
    return <p className="text-center text-muted-foreground">No games to display.</p>;
  }

  const handlePlayGame = (gameToPlay: Game) => {
    if (gameToPlay.slug) {
        navigate(`/casino/game/${gameToPlay.slug}`); // Default to details page
    } else if (gameToPlay.id) {
        navigate(`/casino/game/${String(gameToPlay.id)}`);
    } else if (gameToPlay.game_id && gameToPlay.provider_slug) { // Fallback to direct launch
        launchGame(gameToPlay, { mode: 'real' })
            .then(launchUrl => {
                if (launchUrl) {
                    window.open(launchUrl, '_blank');
                }
            });
    } else {
        console.warn("Cannot play or view details for game:", gameToPlay.title);
    }
  };

  return (
    <div>
      {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {games.map((game) => (
          <GameCard
            key={String(game.id)}
            game={game}
            isFavorite={favoriteGameIds.has(String(game.id))}
            onToggleFavorite={() => toggleFavoriteGame(String(game.id))}
            onPlay={() => handlePlayGame(game)}
          />
        ))}
      </div>
    </div>
  );
};

export default GameList;

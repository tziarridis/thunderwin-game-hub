
import React from 'react';
import { Game } from '@/types';
import GameCard from './GameCard';
import { useGames } from '@/hooks/useGames'; // Assuming useGames provides necessary functionality

interface GameListProps {
  games: Game[];
  // Add any other props needed, e.g., onGameClick, launchGame
}

const GameList: React.FC<GameListProps> = ({ games }) => {
  const { favoriteGameIds, toggleFavoriteGame, launchGame } = useGames();

  if (!games || games.length === 0) {
    return <p className="text-center text-muted-foreground">No games to display.</p>;
  }

  const handlePlayGame = (game: Game) => {
    // Implement game launching logic, possibly using launchGame from useGames
    console.log("Attempting to play game:", game.title);
    if (game.game_id && game.provider_slug) {
        launchGame(game, { mode: 'real' }) // Or 'demo', pass appropriate options
            .then(launchUrl => {
                if (launchUrl) {
                    window.open(launchUrl, '_blank'); // Or navigate to an iframe page
                } else {
                    // Handle failed launch (toast already shown by hook)
                }
            });
    } else {
        alert(`Play game: ${game.title} (missing game_id or provider_slug)`);
    }
  };


  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          isFavorite={favoriteGameIds.has(game.id as string)}
          onToggleFavorite={() => toggleFavoriteGame(game.id as string)}
          onPlay={() => handlePlayGame(game)} // Updated to use game object
        />
      ))}
    </div>
  );
};

export default GameList;

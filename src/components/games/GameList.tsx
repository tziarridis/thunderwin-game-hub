
import React from 'react';
import { Game } from '@/types';
import GameCard from './GameCard'; // Assuming this is the GameCard to use
import { useGames } from '@/hooks/useGames';

interface GameListProps {
  games: Game[];
  // Add any other props needed, e.g., onGameClick
}

const GameList: React.FC<GameListProps> = ({ games }) => {
  const { favoriteGameIds, toggleFavoriteGame, launchGame } = useGames(); // Added launchGame

  if (!games || games.length === 0) {
    return <p className="text-center text-muted-foreground">No games to display.</p>;
  }

  const handlePlayGame = (game: Game) => {
    // Implement game launching logic, possibly using launchGame from useGames
    console.log("Attempting to play game:", game.title);
    // Example: launchGame(game, { mode: 'real' }); // Add appropriate options
    alert(`Play game: ${game.title}`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          isFavorite={favoriteGameIds.has(game.id as string)}
          onToggleFavorite={() => toggleFavoriteGame(game.id as string)}
          onPlay={handlePlayGame}
        />
      ))}
    </div>
  );
};

export default GameList;

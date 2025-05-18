
import React from "react";
import { Game } from "@/types";
import GameCard from "./GameCard";
import { useGames } from "@/hooks/useGames"; // Added useGames

interface GameGridProps {
  games: Game[];
  // Removed onGameClick as GameCard handles its own navigation or onPlay
}

const GameGrid: React.FC<GameGridProps> = ({ games }) => {
  const { favoriteGameIds, toggleFavoriteGame } = useGames(); // Get favorite state and toggle function

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">No games available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game} // Pass the whole game object
          isFavorite={favoriteGameIds.has(game.id)}
          onToggleFavorite={toggleFavoriteGame}
          // onPlay can be passed if direct play from grid is needed for specific grids
        />
      ))}
    </div>
  );
};

export default GameGrid;

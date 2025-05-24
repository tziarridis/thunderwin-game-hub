
import React from "react";
import { Game } from "@/types";
import GameCard from "./GameCard";

interface GameGridProps {
  games: Game[];
}

const GameGrid: React.FC<GameGridProps> = ({ games }) => {
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
          id={game.id}
          title={game.title}
          image={game.image}
          provider={game.provider}
          isPopular={game.isPopular}
          isNew={game.isNew}
          rtp={game.rtp}
        />
      ))}
    </div>
  );
};

export default GameGrid;

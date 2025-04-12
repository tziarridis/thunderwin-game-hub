
import React from "react";
import { Game } from "@/types";
import { Button } from "@/components/ui/button";
import GameCard from "@/components/games/GameCard";
import { useNavigate } from "react-router-dom";

interface GameGridProps {
  games: Game[];
}

const GameGrid = ({ games }: GameGridProps) => {
  const navigate = useNavigate();
  
  if (games.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70 mb-4">No games found</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/casino')}
        >
          Browse All Games
        </Button>
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
          isFavorite={game.isFavorite}
        />
      ))}
    </div>
  );
};

export default GameGrid;

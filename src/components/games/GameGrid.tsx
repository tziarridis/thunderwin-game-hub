
// This is components/games/GameGrid.tsx, distinct from casino/GameGrid.tsx
// This one is used by CasinoMain.tsx
import React from 'react';
import GameCard from '@/components/games/GameCard'; 
import { Game } from '@/types';
import { useGamesData } from "@/hooks/useGames";
import { useNavigate } from 'react-router-dom'; // For navigation
import { toast } from 'sonner';

interface GameGridProps {
  games: Game[];
}

const GameGrid: React.FC<GameGridProps> = ({ games }) => {
  const { launchGame, isFavorite, toggleFavoriteGame } = useGamesData(); 
  const navigate = useNavigate();

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No games available</p> {/* Changed text color for better visibility */}
      </div>
    );
  }

  const handlePlayGame = async (gameToPlay: Game) => {
    try {
      const launchUrl = await launchGame(gameToPlay, { mode: 'real' });
      if (launchUrl) {
        window.open(launchUrl, '_blank');
      } else {
        navigate(`/casino/game/${gameToPlay.slug || gameToPlay.id}`);
      }
    } catch (error: any) {
      toast.error(`Could not launch game: ${error.message}`);
      navigate(`/casino/game/${gameToPlay.slug || gameToPlay.id}`);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard
          key={String(game.id)}
          game={game}
          isFavorite={isFavorite(String(game.id))}
          onToggleFavorite={toggleFavoriteGame}
          onPlay={() => handlePlayGame(game)} 
        />
      ))}
    </div>
  );
};

export default GameGrid;


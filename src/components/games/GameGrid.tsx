
// This is components/games/GameGrid.tsx, distinct from casino/GameGrid.tsx
// This one is used by CasinoMain.tsx
import React from 'react';
import GameCard from '@/components/games/GameCard'; 
import { Game } from '@/types';
import { useGames } from "@/hooks/useGames";
import { useNavigate } from 'react-router-dom'; // For navigation
import { toast } from 'sonner';

interface GameGridProps {
  games: Game[];
  // onGameClick might be handled by GameCard's onPlay or its own navigation
}

const GameGrid: React.FC<GameGridProps> = ({ games }) => {
  const { favoriteGameIds, toggleFavoriteGame, launchGame } = useGames();
  const navigate = useNavigate();

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">No games available</p>
      </div>
    );
  }

  const handlePlayGame = async (gameToPlay: Game) => {
    try {
      const launchUrl = await launchGame(gameToPlay, { mode: 'real' });
      if (launchUrl) {
        window.open(launchUrl, '_blank');
      } else {
        // Fallback to details page if no launch URL
        navigate(`/casino/game/${gameToPlay.slug || gameToPlay.id}`);
      }
    } catch (error: any) {
      toast.error(`Could not launch game: ${error.message}`);
       // Fallback to details page on error
      navigate(`/casino/game/${gameToPlay.slug || gameToPlay.id}`);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard
          key={String(game.id)} // Ensure key is string
          game={game}
          isFavorite={favoriteGameIds.has(String(game.id))}
          onToggleFavorite={() => toggleFavoriteGame(String(game.id))}
          onPlay={() => handlePlayGame(game)} 
        />
      ))}
    </div>
  );
};

export default GameGrid;

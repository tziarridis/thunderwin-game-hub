
import React from 'react';
import GameCard from '@/components/games/GameCard'; // Main GameCard
import { Game } from '@/types';
import { useGames } from "@/hooks/useGames";

interface GameGridProps {
  games: Game[];
  // onGameClick might be handled by GameCard's onPlay or its own navigation
}

const GameGrid: React.FC<GameGridProps> = ({ games }) => {
  const { favoriteGameIds, toggleFavoriteGame, launchGame } = useGames();

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">No games available</p>
      </div>
    );
  }

  const handlePlayGame = (gameToPlay: Game) => {
    // Example: using launchGame from useGames hook for direct play
    if (gameToPlay.game_id && gameToPlay.provider_slug) {
        launchGame(gameToPlay, { mode: 'real' }) // or 'demo'
            .then(launchUrl => {
                if (launchUrl) {
                    window.open(launchUrl, '_blank');
                }
            });
    } else {
        // Fallback or navigate to game details if direct launch isn't possible
        // navigate(`/casino/game/${gameToPlay.slug || gameToPlay.id}`);
        console.warn("Cannot directly play game, missing game_id or provider_slug:", gameToPlay.title);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard
          key={String(game.id)}
          game={game}
          isFavorite={favoriteGameIds.has(String(game.id))}
          onToggleFavorite={() => toggleFavoriteGame(String(game.id))}
          onPlay={() => handlePlayGame(game)} // Pass a play handler
        />
      ))}
    </div>
  );
};

export default GameGrid;

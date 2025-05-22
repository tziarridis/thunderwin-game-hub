import React from 'react';
import { Game } from '@/types';
import GameCard from './GameCard'; 
import { useGames } from '@/hooks/useGames';
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'sonner'; // For notifications

interface GameListProps {
  games: Game[];
  title?: string; 
}

const GameList: React.FC<GameListProps> = ({ games, title }) => {
  const { favoriteGameIds, toggleFavoriteGame, launchGame } = useGames();
  const navigate = useNavigate();

  if (!games || games.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No games to display.</p>;
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
    <div>
      {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {games.map((game) => (
          <GameCard
            key={String(game.id)} // Ensure key is unique and string
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

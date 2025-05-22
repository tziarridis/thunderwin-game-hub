
import React from 'react';
import { Game } from '@/types';
import GameCard from './GameCard';
import { useGames } from '@/hooks/useGames'; // Fixed import
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface GameListProps {
  games: Game[];
  title?: string; 
}

const GameList: React.FC<GameListProps> = ({ games, title }) => {
  const { launchGame, isFavorite, toggleFavoriteGame } = useGames();
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
        navigate(`/casino/game/${gameToPlay.slug || gameToPlay.id}`);
      }
    } catch (error: any) {
      toast.error(`Could not launch game: ${error.message}`);
      navigate(`/casino/game/${gameToPlay.slug || gameToPlay.id}`);
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
            isFavorite={isFavorite(String(game.id))}
            onToggleFavorite={toggleFavoriteGame}
            onPlay={() => handlePlayGame(game)}
          />
        ))}
      </div>
    </div>
  );
};

export default GameList;

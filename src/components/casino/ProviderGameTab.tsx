import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import GameCard from '@/components/games/GameCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import { toast } from 'sonner';

interface ProviderGameTabProps {
  value: string;
  games: Game[];
  onGameClick: (game: Game) => void;
}

const ProviderGameTab = ({ value, games, onGameClick }: ProviderGameTabProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { favoriteGameIds, toggleFavoriteGame } = useGames();

  const handleGameCardPlay = (game: Game) => {
    if (!isAuthenticated && game.status !== 'demo_only') { // Assuming 'demo_only' status for games playable without login
      toast.error("Please log in to play games");
      navigate('/auth/login'); 
      return;
    }
    onGameClick(game); 
  };

  return (
    <TabsContent value={value}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {games.map((game) => (
          <GameCard 
            key={String(game.id)}
            game={game}
            isFavorite={favoriteGameIds.has(String(game.id))}
            onToggleFavorite={() => toggleFavoriteGame(String(game.id))}
            onPlay={() => handleGameCardPlay(game)}
          />
        ))}
      </div>
    </TabsContent>
  );
};

export default ProviderGameTab;


import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import GameCard from '@/components/games/GameCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGames } from '@/hooks/useGames'; // Added useGames
import { Game } from '@/types'; // Ensure Game type is imported
import { toast } from 'sonner';

interface ProviderGameTabProps {
  value: string; // Changed from specific enums to string for flexibility
  games: Game[]; // Changed to Game[]
  onGameClick: (game: Game) => void; // Changed to Game
}

const ProviderGameTab = ({ value, games, onGameClick }: ProviderGameTabProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { favoriteGameIds, toggleFavoriteGame } = useGames();

  const handleGameCardPlay = (game: Game) => {
    if (!isAuthenticated) {
      toast.error("Please log in to play games");
      navigate('/auth/login'); // Corrected path
      return;
    }
    onGameClick(game); // This is the original onGameClick passed to the tab
  };

  return (
    <TabsContent value={value}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {games.map((game) => (
          <GameCard 
            key={game.id}
            game={game}
            isFavorite={favoriteGameIds.has(game.id)}
            onToggleFavorite={toggleFavoriteGame}
            onPlay={handleGameCardPlay} // GameCard's onPlay will call the tab's onGameClick
          />
        ))}
      </div>
    </TabsContent>
  );
};

export default ProviderGameTab;

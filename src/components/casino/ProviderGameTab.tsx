
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import GameCard from '@/components/games/GameCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProviderGameTabProps {
  value: 'gitslotpark' | 'pragmaticplay';
  games: any[];
  onGameClick: (game: any) => void;
}

const ProviderGameTab = ({ value, games, onGameClick }: ProviderGameTabProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGameClick = (game: any) => {
    if (!isAuthenticated) {
      toast.error("Please log in to play games");
      navigate('/login');
      return;
    }
    
    onGameClick(game);
  };

  return (
    <TabsContent value={value}>
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
            isFavorite={false}
            minBet={game.minBet}
            maxBet={game.maxBet}
            onClick={() => handleGameClick(game)}
          />
        ))}
      </div>
    </TabsContent>
  );
};

export default ProviderGameTab;

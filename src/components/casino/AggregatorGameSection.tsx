
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import gitSlotParkService from '@/services/gitSlotParkService';
import pragmaticPlayService from '@/services/pragmaticPlayService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import GameSectionLoading from './GameSectionLoading';
import ProviderGameTab from './ProviderGameTab';

const AggregatorGameSection = () => {
  const [activeTab, setActiveTab] = useState('gitslotpark');
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    loadGames(activeTab);
  }, [activeTab]);
  
  const loadGames = async (provider: string) => {
    setIsLoading(true);
    try {
      let gamesData: any[] = [];
      
      if (provider === 'gitslotpark') {
        // GitSlotPark games are returned directly, not as a Promise
        const gspGames = gitSlotParkService.getAvailableGames();
        gamesData = gspGames.map(game => ({
          id: game.code,
          title: game.name,
          provider: 'GitSlotPark',
          image: `/lovable-uploads/casino-games/gsp_${Math.floor(Math.random() * 5) + 1}.jpg`,
          isPopular: Math.random() > 0.7,
          isNew: Math.random() > 0.8,
          rtp: (88 + Math.random() * 10).toFixed(2) + '%',
          minBet: '$0.10',
          maxBet: '$100',
          gameCode: game.code
        }));
      } else if (provider === 'pragmaticplay') {
        // Pragmatic Play games - using getAvailableGames instead of getGames
        const ppGames = pragmaticPlayService.getAvailableGames();
        gamesData = ppGames.map(game => ({
          id: game.code,
          title: game.name,
          provider: 'Pragmatic Play',
          // The pragmaticPlayService.getAvailableGames() returns objects with only code and name properties
          // So we need to generate a random image path instead of trying to use game.image
          image: `/lovable-uploads/casino-games/pp_${Math.floor(Math.random() * 5) + 1}.jpg`,
          isPopular: Math.random() > 0.7,
          isNew: Math.random() > 0.8,
          rtp: (88 + Math.random() * 10).toFixed(2) + '%',
          minBet: '$0.20',
          maxBet: '$200',
          gameCode: game.code
        }));
      }
      
      setGames(gamesData.slice(0, 6));
    } catch (error) {
      console.error(`Error loading ${provider} games:`, error);
      toast.error(`Failed to load games from ${provider}`);
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlayGame = (game: any) => {
    if (!user) {
      toast.error("Please log in to play games");
      navigate('/login');
      return;
    }
    
    if (activeTab === 'gitslotpark') {
      navigate(`/casino/gitslotpark-seamless?gameCode=${game.gameCode}`);
    } else if (activeTab === 'pragmaticplay') {
      navigate(`/casino/seamless?gameCode=${game.gameCode}`);
    }
  };
  
  const handleViewAll = () => {
    if (activeTab === 'gitslotpark') {
      navigate('/casino/providers/gitslotpark');
    } else if (activeTab === 'pragmaticplay') {
      navigate('/casino/providers/pragmaticplay');
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold thunder-glow">Partner Casino Games</h2>
        <GameSectionLoading />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold thunder-glow">Partner Casino Games</h2>
        <Button 
          variant="outline" 
          className="text-casino-thunder-green border-casino-thunder-green hover:bg-casino-thunder-green/20"
          onClick={handleViewAll}
        >
          View All
        </Button>
      </div>
      
      <Card className="bg-casino-thunder-dark/50 border-white/10">
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="gitslotpark">GitSlotPark</TabsTrigger>
              <TabsTrigger value="pragmaticplay">Pragmatic Play</TabsTrigger>
            </TabsList>
            
            <ProviderGameTab 
              value="gitslotpark" 
              games={games} 
              onGameClick={handlePlayGame} 
            />
            
            <ProviderGameTab 
              value="pragmaticplay" 
              games={games} 
              onGameClick={handlePlayGame} 
            />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AggregatorGameSection;

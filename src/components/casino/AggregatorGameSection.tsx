import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import GameCard from '@/components/games/GameCard';
import gitSlotParkService from '@/services/gitSlotParkService';
import pragmaticPlayService from '@/services/pragmaticPlayService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Game } from '@/types';
import LaunchGame from './LaunchGame';

const AggregatorGameSection = ({ showAllGames = false }) => {
  const [activeTab, setActiveTab] = useState('gitslotpark');
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    loadGames(activeTab);
  }, [activeTab]);
  
  const loadGames = async (provider: string) => {
    setIsLoading(true);
    try {
      let gamesData: Game[] = [];
      
      if (provider === 'gitslotpark') {
        // GitSlotPark games are returned directly, not as a Promise
        const gspGames = gitSlotParkService.getAvailableGames();
        gamesData = gspGames.map(game => ({
          id: `gsp_${game.code}`,
          title: game.name,
          name: game.name,
          provider: 'GitSlotPark',
          category: 'slots',
          image: `/lovable-uploads/casino-games/gsp_${Math.floor(Math.random() * 5) + 1}.jpg`,
          rtp: 96,
          volatility: 'medium',
          minBet: 0.1,
          maxBet: 100,
          isPopular: Math.random() > 0.7,
          isNew: Math.random() > 0.8,
          isFavorite: false,
          jackpot: false,
          releaseDate: new Date().toISOString(),
          features: [],
          tags: [],
          description: "",
          // Additional properties needed for the API - using proper number types
          provider_id: 3,
          game_id: game.code,
          game_name: game.name,
          game_code: game.code,
          has_lobby: false,
          has_jackpot: false,
          freerounds_supported: false,
          regulated: true,
          type: 'slots',
          status: 'active',
          is_mobile: true,
          has_freespins: false,
          has_tables: false,
          distribution: 'GitSlotPark',
          views: 0
        }));
      } else if (provider === 'pragmaticplay') {
        // Pragmatic Play games - using getAvailableGames instead of getGames
        const ppGames = pragmaticPlayService.getAvailableGames();
        gamesData = ppGames.map(game => ({
          id: `pp_${game.code}`,
          title: game.name,
          name: game.name,
          provider: 'Pragmatic Play',
          category: 'slots',
          image: `/lovable-uploads/casino-games/pp_${Math.floor(Math.random() * 5) + 1}.jpg`,
          rtp: 96,
          volatility: 'medium',
          minBet: 0.1,
          maxBet: 100,
          isPopular: Math.random() > 0.7,
          isNew: Math.random() > 0.8,
          isFavorite: false,
          jackpot: false,
          releaseDate: new Date().toISOString(),
          features: [],
          tags: [],
          description: "",
          // Additional properties needed for the API - using proper number types
          provider_id: 1,
          game_id: game.code,
          game_name: game.name,
          game_code: game.code,
          has_lobby: false,
          has_jackpot: false,
          freerounds_supported: false,
          regulated: true,
          type: 'slots',
          status: 'active',
          is_mobile: true,
          has_freespins: false,
          has_tables: false,
          distribution: 'Pragmatic Play',
          views: 0
        }));
      }
      
      // If showAllGames is true, return all games, otherwise limit to 6
      setGames(showAllGames ? gamesData : gamesData.slice(0, 6));
    } catch (error) {
      console.error(`Error loading ${provider} games:`, error);
      toast.error(`Failed to load games from ${provider}`);
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlayGame = (game: Game) => {
    if (!user) {
      toast.error("Please log in to play games");
      navigate('/login');
      return;
    }
  };
  
  const handleViewAll = () => {
    navigate('/casino/aggregator-games');
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold thunder-glow">Partner Casino Games</h2>
        <div className="animate-pulse grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(showAllGames ? 12 : 6)].map((_, i) => (
            <div key={i} className="bg-casino-thunder-gray/30 rounded-lg h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold thunder-glow">Partner Casino Games</h2>
        {!showAllGames && (
          <Button 
            variant="outline" 
            className="text-casino-thunder-green border-casino-thunder-green hover:bg-casino-thunder-green/20"
            onClick={handleViewAll}
          >
            View All
          </Button>
        )}
      </div>
      
      <Card className="bg-casino-thunder-dark/50 border-white/10">
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="gitslotpark">GitSlotPark</TabsTrigger>
              <TabsTrigger value="pragmaticplay">Pragmatic Play</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gitslotpark">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {games.map((game) => (
                  <GameCard 
                    key={game.id}
                    id={String(game.id)}
                    title={game.title || ''}
                    image={game.image || ''}
                    provider={game.provider || ''}
                    isPopular={!!game.isPopular}
                    isNew={!!game.isNew}
                    rtp={`${game.rtp}%`}
                    isFavorite={false}
                    minBet={`$${game.minBet}`}
                    maxBet={`$${game.maxBet}`}
                    onClick={() => handlePlayGame(game)}
                    button={
                      <LaunchGame 
                        game={game}
                        buttonText="Play Now"
                        variant="default"
                        mode="demo"
                        className="w-full"
                      />
                    }
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="pragmaticplay">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {games.map((game) => (
                  <GameCard 
                    key={game.id}
                    id={String(game.id)}
                    title={game.title || ''}
                    image={game.image || ''}
                    provider={game.provider || ''}
                    isPopular={!!game.isPopular}
                    isNew={!!game.isNew}
                    rtp={`${game.rtp}%`}
                    isFavorite={false}
                    minBet={`$${game.minBet}`}
                    maxBet={`$${game.maxBet}`}
                    onClick={() => handlePlayGame(game)}
                    button={
                      <LaunchGame 
                        game={game}
                        buttonText="Play Now"
                        variant="default"
                        mode="demo"
                        className="w-full"
                      />
                    }
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AggregatorGameSection;


import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { gitSlotParkService } from "@/services/gitSlotParkService";
import { pragmaticPlayService } from "@/services/pragmaticPlayService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Gamepad2, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";

const AggregatorGameSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loadingGame, setLoadingGame] = useState<string | null>(null);

  // Get a few games from each aggregator
  const ppGames = pragmaticPlayService.getAvailableGames().slice(0, 5);
  const gspGames = gitSlotParkService.getAvailableGames();
  
  const handleLaunchGame = async (provider: 'pp' | 'gsp', gameCode: string) => {
    try {
      setLoadingGame(`${provider}-${gameCode}`);
      let gameUrl;
      
      // Use player ID if authenticated, otherwise use guest
      const playerId = isAuthenticated ? user?.id || 'guest' : 'guest';
      
      if (provider === 'pp') {
        console.log(`Launching Pragmatic Play game ${gameCode} for player ${playerId}`);
        gameUrl = await pragmaticPlayService.launchGame({
          playerId,
          gameCode,
          mode: 'demo',
          returnUrl: window.location.href,
          currency: 'USD',
          language: 'en'
        });
      } else {
        console.log(`Launching GitSlotPark game ${gameCode} for player ${playerId}`);
        gameUrl = await gitSlotParkService.launchGame({
          playerId,
          gameCode,
          mode: 'demo',
          returnUrl: window.location.href,
          currency: 'USD',
          language: 'en'
        });
      }
      
      console.log("Generated game URL:", gameUrl);
      
      if (gameUrl) {
        const gameWindow = window.open(gameUrl, '_blank');
        
        // Check if popup blocker prevented the window from opening
        if (!gameWindow) {
          throw new Error("Pop-up blocker might be preventing the game from opening. Please allow pop-ups for this site.");
        }
        
        toast.success("Game launched successfully");
      } else {
        throw new Error("Failed to generate game URL");
      }
    } catch (error: any) {
      console.error("Error launching game:", error);
      toast.error(error.message || "Failed to launch game");
    } finally {
      setLoadingGame(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold thunder-glow">Game Aggregator Partners</h2>
        <Button 
          variant="outline"
          size="sm"
          className="text-casino-thunder-green"
          onClick={() => navigate('/casino/slots')}
        >
          View All
          <ExternalLink className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      {/* Pragmatic Play Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Gamepad2 className="mr-2 h-4 w-4 text-yellow-500" />
          Pragmatic Play Games
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {ppGames.map((game) => (
            <Card key={game.code} className="bg-casino-thunder-dark hover:bg-casino-thunder-highlight/20 transition-colors border border-white/10 overflow-hidden">
              <CardContent className="p-0">
                <div className="group relative overflow-hidden aspect-[3/4]">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                  <img
                    src={`https://source.unsplash.com/random/300x400?slot-machine&${game.code}`}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col">
                    <h4 className="text-sm font-medium line-clamp-1">{game.name}</h4>
                    <p className="text-xs text-white/60 mb-2">Pragmatic Play</p>
                    <Button 
                      size="sm" 
                      className="w-full mt-2 bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={() => handleLaunchGame('pp', game.code)}
                      disabled={loadingGame === `pp-${game.code}`}
                    >
                      {loadingGame === `pp-${game.code}` ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : "Play Now"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* GitSlotPark Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Gamepad2 className="mr-2 h-4 w-4 text-blue-500" />
          GitSlotPark Games
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {gspGames.map((game) => (
            <Card key={game.code} className="bg-casino-thunder-dark hover:bg-casino-thunder-highlight/20 transition-colors border border-white/10 overflow-hidden">
              <CardContent className="p-0">
                <div className="group relative overflow-hidden aspect-[3/4]">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                  <img
                    src={`https://source.unsplash.com/random/300x400?casino&${game.code}`}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col">
                    <h4 className="text-sm font-medium line-clamp-1">{game.name}</h4>
                    <p className="text-xs text-white/60 mb-2">GitSlotPark</p>
                    <Button 
                      size="sm" 
                      className="w-full mt-2 bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={() => handleLaunchGame('gsp', game.code)}
                      disabled={loadingGame === `gsp-${game.code}`}
                    >
                      {loadingGame === `gsp-${game.code}` ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : "Play Now"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AggregatorGameSection;

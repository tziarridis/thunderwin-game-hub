
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { pragmaticPlayService } from "@/services/pragmaticPlayService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * Component for testing Pragmatic Play integration
 */
const PragmaticPlayTester = () => {
  const [gameCode, setGameCode] = useState("vs20bonzanza");
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  const handleLaunchGame = async () => {
    if (!gameCode) {
      toast.error("Please enter a game code");
      return;
    }
    
    setIsLoading(true);
    try {
      const gameUrl = await pragmaticPlayService.launchGame({
        playerId: isAuthenticated ? user?.id || 'guest' : 'guest',
        gameCode: gameCode,
        mode: 'demo',
        returnUrl: window.location.href
      });
      
      // Open game in new window
      window.open(gameUrl, '_blank');
      toast.success("Game launched successfully!");
    } catch (error: any) {
      toast.error(`Failed to launch game: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // List of popular PP games for quick selection
  const popularGames = [
    { code: 'vs20bonzanza', name: 'Sweet Bonanza' },
    { code: 'vs20doghouse', name: 'The Dog House' },
    { code: 'vs10wolfgold', name: 'Wolf Gold' },
    { code: 'vs20fparty2', name: 'Fruit Party 2' }
  ];
  
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle>Pragmatic Play Tester</CardTitle>
        <CardDescription>
          Test the Pragmatic Play integration by launching games directly with their game codes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="game-code">Game Code</Label>
          <Input 
            id="game-code" 
            placeholder="e.g. vs20bonzanza" 
            value={gameCode} 
            onChange={(e) => setGameCode(e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
          <p className="text-xs text-slate-400">
            Enter a Pragmatic Play game code to launch the game
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>Quick Select</Label>
          <div className="flex flex-wrap gap-2">
            {popularGames.map(game => (
              <Button 
                key={game.code}
                variant="outline" 
                size="sm"
                onClick={() => setGameCode(game.code)}
                className={gameCode === game.code ? "bg-casino-thunder-green text-black" : ""}
              >
                {game.name}
              </Button>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={handleLaunchGame} 
          disabled={isLoading}
          className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Launching...
            </>
          ) : "Launch Game"}
        </Button>
        
        <div className="mt-4 text-xs text-slate-400">
          <p>Note: This integration uses the following Pragmatic Play credentials:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Agent ID: captaingambleEUR</li>
            <li>Currency: EUR</li>
            <li>Environment: Production</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PragmaticPlayTester;


// Updating the import at the top of the file
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Play, ExternalLink } from "lucide-react";
import { pragmaticPlayService } from "@/services/pragmaticPlayService";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

interface GameTestResult {
  success: boolean;
  message: string;
  gameUrl?: string;
}

const PragmaticPlayTester = () => {
  const [gameCode, setGameCode] = useState("vs20bonzanza");
  const [gameMode, setGameMode] = useState<'demo' | 'real'>('demo');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<GameTestResult | null>(null);
  const { isAuthenticated, user } = useAuth();
  
  // Popular PP games for quick selection
  const popularGames = [
    { code: 'vs20bonzanza', name: 'Sweet Bonanza' },
    { code: 'vs20doghouse', name: 'The Dog House' },
    { code: 'vs10wolfgold', name: 'Wolf Gold' },
    { code: 'vs20fparty2', name: 'Fruit Party 2' }
  ];
  
  const handleLaunchGame = async () => {
    if (!gameCode) {
      toast.error("Please enter a game code");
      return;
    }
    
    if (gameMode === 'real' && !isAuthenticated) {
      toast.error("Please log in to play in real money mode");
      return;
    }
    
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Launch the game with Pragmatic Play
      const gameUrl = await pragmaticPlayService.launchGame({
        playerId: isAuthenticated ? user?.id || 'guest' : 'guest',
        gameCode: gameCode,
        mode: gameMode,
        returnUrl: window.location.href
      });
      
      setTestResult({
        success: true,
        message: "Game launched successfully",
        gameUrl
      });
      
      // Open the game URL in a new tab
      window.open(gameUrl, '_blank');
      
      toast.success("Game launched successfully!");
    } catch (error: any) {
      console.error("Error launching game:", error);
      
      setTestResult({
        success: false,
        message: error.message || "Failed to launch game"
      });
      
      toast.error(error.message || "Failed to launch game");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-4 md:col-span-1">
          <div className="space-y-2">
            <Label htmlFor="game-code">Game Code</Label>
            <Input 
              id="game-code" 
              placeholder="e.g. vs20bonzanza" 
              value={gameCode} 
              onChange={(e) => setGameCode(e.target.value)}
              className="bg-slate-700 border-slate-600"
            />
            <p className="text-xs text-slate-400">
              Enter a Pragmatic Play game code to test
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="game-mode">Game Mode</Label>
            <Select 
              defaultValue={gameMode} 
              onValueChange={(value) => setGameMode(value as 'demo' | 'real')}
            >
              <SelectTrigger id="game-mode" className="bg-slate-700 border-slate-600">
                <SelectValue placeholder="Select game mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="demo">Demo Mode</SelectItem>
                <SelectItem value="real">Real Money</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400">
              {gameMode === 'real' ? 
                "Real money mode requires a player to be logged in" : 
                "Demo mode can be played without login"
              }
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
                  className={gameCode === game.code ? "bg-blue-900/50 text-blue-300" : ""}
                >
                  {game.name}
                </Button>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={handleLaunchGame} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Launching...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Launch Game
              </>
            )}
          </Button>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              {testResult ? (
                <div className="space-y-4">
                  <Alert className={
                    testResult.success ? "bg-green-900/20 border-green-900" : "bg-red-900/20 border-red-900"
                  }>
                    <AlertDescription className={testResult.success ? "text-green-400" : "text-red-400"}>
                      {testResult.message}
                    </AlertDescription>
                  </Alert>
                  
                  {testResult.success && testResult.gameUrl && (
                    <>
                      <div className="mt-4">
                        <p className="font-semibold mb-2">Game URL:</p>
                        <div className="bg-slate-800 p-2 rounded-md overflow-x-auto">
                          <code className="text-xs break-all">{testResult.gameUrl}</code>
                        </div>
                      </div>
                      
                      <Button asChild size="sm" className="mt-2">
                        <a href={testResult.gameUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Game
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full justify-center items-center py-8">
                  <div className="text-center space-y-4">
                    <p className="text-white/60">
                      Select a game and click the Launch button to test your integration
                    </p>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <p className="text-sm font-medium">API Callback URL:</p>
                      <code className="text-xs bg-slate-800 p-2 rounded">
                        {window.location.origin}/api/seamless/pragmatic
                      </code>
                      <Link to="/api/seamless/pragmatic" target="_blank">
                        <Button variant="outline" size="sm" className="mt-2">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View API Endpoint
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Alert className="bg-blue-900/20 border-blue-900">
        <AlertDescription className="text-blue-400">
          Make sure you have configured the correct callback URL in your Pragmatic Play dashboard: 
          <code className="ml-2 bg-slate-800 px-2 py-0.5 rounded text-xs">
            {window.location.origin}/api/seamless/pragmatic
          </code>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PragmaticPlayTester;

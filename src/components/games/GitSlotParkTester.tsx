
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { gitSlotParkService } from "@/services/gitSlotParkService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Play, BarChart3, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const GitSlotParkTester = () => {
  const [activeTab, setActiveTab] = useState("game-launcher");
  const [selectedGame, setSelectedGame] = useState("gsp_slots_1");
  const [gameMode, setGameMode] = useState<'demo' | 'real'>('demo');
  const [isLaunching, setIsLaunching] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const { isAuthenticated, user } = useAuth();
  
  const availableGames = gitSlotParkService.getAvailableGames();

  const handleLaunchGame = async () => {
    if (!selectedGame) {
      toast.error("Please select a game");
      return;
    }
    
    setIsLaunching(true);
    try {
      const gameUrl = await gitSlotParkService.launchGame({
        playerId: isAuthenticated ? user?.id || 'guest' : 'guest',
        gameCode: selectedGame,
        mode: gameMode,
        returnUrl: window.location.href
      });
      
      window.open(gameUrl, '_blank');
      toast.success("Game launched successfully");
    } catch (error: any) {
      console.error("Error launching game:", error);
      toast.error(error.message || "Failed to launch game");
    } finally {
      setIsLaunching(false);
    }
  };
  
  const handleCheckBalance = async () => {
    setIsBalanceLoading(true);
    try {
      const balanceData = await gitSlotParkService.getBalance(
        isAuthenticated ? user?.id || 'guest' : 'guest'
      );
      setBalance(balanceData.balance);
      toast.success(`Current balance: €${balanceData.balance.toFixed(2)}`);
    } catch (error: any) {
      console.error("Error checking balance:", error);
      toast.error(error.message || "Failed to check balance");
    } finally {
      setIsBalanceLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <Alert className="bg-yellow-500/10 text-yellow-500 border-yellow-500/50">
        <AlertDescription>
          This is a test environment for GitSlotPark integration. Use the Seamless Wallet page to manage your balance.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="game-launcher">
            <Play className="mr-2 h-4 w-4" />
            Game Launcher
          </TabsTrigger>
          <TabsTrigger value="wallet-tester">
            <Wallet className="mr-2 h-4 w-4" />
            Wallet Tester
          </TabsTrigger>
          <TabsTrigger value="integration-status">
            <BarChart3 className="mr-2 h-4 w-4" />
            Integration Status
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="game-launcher">
          <Card>
            <CardHeader>
              <CardTitle>Launch GitSlotPark Game</CardTitle>
              <CardDescription>
                Test the GitSlotPark integration by launching games
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="game-select">Select Game</Label>
                <Select value={selectedGame} onValueChange={setSelectedGame}>
                  <SelectTrigger id="game-select">
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGames.map(game => (
                      <SelectItem key={game.code} value={game.code}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mode-select">Game Mode</Label>
                <Select value={gameMode} onValueChange={(value) => setGameMode(value as 'demo' | 'real')}>
                  <SelectTrigger id="mode-select">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo">Demo Mode</SelectItem>
                    <SelectItem value="real">Real Money</SelectItem>
                  </SelectContent>
                </Select>
                {gameMode === 'real' && !isAuthenticated && (
                  <p className="text-yellow-500 text-xs mt-1">
                    You need to be logged in to play with real money
                  </p>
                )}
              </div>
              
              <Button 
                onClick={handleLaunchGame} 
                disabled={isLaunching || (gameMode === 'real' && !isAuthenticated)}
                className="w-full mt-4 bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
              >
                {isLaunching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Launching...
                  </>
                ) : "Launch Game"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wallet-tester">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Operations</CardTitle>
              <CardDescription>
                Test GitSlotPark wallet operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-casino-thunder-darker rounded-md mb-4">
                <div>
                  <p className="text-sm text-white/60">Current Balance</p>
                  <p className="text-2xl font-bold">
                    {balance !== null ? `€${balance.toFixed(2)}` : "Not checked"}
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleCheckBalance}
                  disabled={isBalanceLoading}
                >
                  {isBalanceLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : "Check Balance"}
                </Button>
              </div>
              
              <Link to="/casino/gitslotpark-seamless">
                <Button className="w-full">
                  Go to Seamless Wallet Page
                </Button>
              </Link>
              
              <div className="mt-4 p-4 bg-black/20 rounded-md text-sm">
                <p>
                  The Seamless Wallet page provides a complete interface for testing:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Checking your balance</li>
                  <li>Depositing funds</li>
                  <li>Withdrawing funds</li>
                  <li>Viewing transaction history</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integration-status">
          <Card>
            <CardHeader>
              <CardTitle>GitSlotPark Integration Status</CardTitle>
              <CardDescription>
                Current status of the GitSlotPark integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-casino-thunder-darker rounded-md">
                    <h3 className="font-semibold mb-2">Game Launching</h3>
                    <p className="text-green-500 text-sm">✓ Operational</p>
                  </div>
                  
                  <div className="p-4 bg-casino-thunder-darker rounded-md">
                    <h3 className="font-semibold mb-2">Wallet Integration</h3>
                    <p className="text-green-500 text-sm">✓ Operational</p>
                  </div>
                  
                  <div className="p-4 bg-casino-thunder-darker rounded-md">
                    <h3 className="font-semibold mb-2">Callback Processing</h3>
                    <p className="text-green-500 text-sm">✓ Operational</p>
                  </div>
                  
                  <div className="p-4 bg-casino-thunder-darker rounded-md">
                    <h3 className="font-semibold mb-2">Transaction Handling</h3>
                    <p className="text-green-500 text-sm">✓ Operational</p>
                  </div>
                </div>
                
                <Alert className="mt-4 bg-blue-500/10 text-blue-300 border-blue-500/50">
                  <AlertDescription>
                    <p>This integration is using a simulated version of the GitSlotPark API for demonstration purposes.</p>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GitSlotParkTester;

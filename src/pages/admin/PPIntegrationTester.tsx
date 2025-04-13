
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Play, Search, RotateCw, Database, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { pragmaticPlayService } from "@/services/pragmaticPlayService";
import PPTransactionLogger from "@/components/admin/PPTransactionLogger";
import PPApiValidator from "@/components/admin/PPApiValidator";
import PPIntegrationReport from "@/components/admin/PPIntegrationReport";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const PPIntegrationTester = () => {
  const [activeTab, setActiveTab] = useState("game-tester");
  const [gameCode, setGameCode] = useState("vs20bonzanza");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<'success' | 'warning' | 'error' | 'pending'>('pending');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Add initial log entry
    addLog("PP Integration Tester initialized");
    validateIntegration();
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toISOString()}] ${message}`, ...prev]);
  };

  const handleLaunchGame = async () => {
    if (!gameCode) {
      toast.error("Please enter a game code");
      return;
    }
    
    setIsLoading(true);
    addLog(`Launching game with code: ${gameCode}`);
    
    try {
      const gameUrl = await pragmaticPlayService.launchGame({
        playerId: isAuthenticated ? user?.id || 'guest' : 'guest',
        gameCode: gameCode,
        mode: 'demo',
        returnUrl: window.location.href
      });
      
      addLog(`Game launched successfully: ${gameUrl}`);
      
      // Open game in new window
      window.open(gameUrl, '_blank');
      toast.success("Game launched successfully!");
    } catch (error: any) {
      const errorMessage = `Failed to launch game: ${error.message || 'Unknown error'}`;
      addLog(`ERROR: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validateIntegration = async () => {
    addLog("Validating PP integration...");
    setIntegrationStatus('pending');
    
    try {
      // Check API configuration
      const ppConfig = await pragmaticPlayService.validateConfig();
      addLog(`Config validation: ${ppConfig.valid ? 'Success' : 'Failed'}`);

      // Check API connectivity
      const apiStatus = await pragmaticPlayService.testApiConnection();
      addLog(`API connection test: ${apiStatus.success ? 'Success' : 'Failed'} - ${apiStatus.message}`);

      // Check for available games
      const games = pragmaticPlayService.getAvailableGames();
      addLog(`Found ${games.length} available games`);

      // Validate callback URL
      const callbackStatus = await pragmaticPlayService.validateCallbackUrl();
      addLog(`Callback URL validation: ${callbackStatus.valid ? 'Success' : 'Failed'} - ${callbackStatus.message}`);

      // Determine overall status
      if (ppConfig.valid && apiStatus.success && games.length > 0 && callbackStatus.valid) {
        setIntegrationStatus('success');
      } else if (!ppConfig.valid || !apiStatus.success) {
        setIntegrationStatus('error');
      } else {
        setIntegrationStatus('warning');
      }
    } catch (error: any) {
      addLog(`ERROR during validation: ${error.message}`);
      setIntegrationStatus('error');
    }
  };

  // Popular PP games for quick selection
  const popularGames = [
    { code: 'vs20bonzanza', name: 'Sweet Bonanza' },
    { code: 'vs20doghouse', name: 'The Dog House' },
    { code: 'vs10wolfgold', name: 'Wolf Gold' },
    { code: 'vs20fparty2', name: 'Fruit Party 2' }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pragmatic Play Integration Tester</h1>
        <div className="flex space-x-2">
          <Link to="/casino/seamless" target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Seamless Wallet
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={validateIntegration} 
            disabled={integrationStatus === 'pending'}
          >
            {integrationStatus === 'pending' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCw className="mr-2 h-4 w-4" />
            )}
            Validate Integration
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Integration Status</CardTitle>
            <CardDescription>
              Current status of your Pragmatic Play integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Badge className={
                integrationStatus === 'success' ? "bg-green-600 hover:bg-green-700" :
                integrationStatus === 'warning' ? "bg-yellow-600 hover:bg-yellow-700" :
                integrationStatus === 'error' ? "bg-red-600 hover:bg-red-700" :
                "bg-slate-600 hover:bg-slate-700"
              }>
                {integrationStatus === 'success' ? 'Success' :
                 integrationStatus === 'warning' ? 'Warning' :
                 integrationStatus === 'error' ? 'Error' : 'Pending'}
              </Badge>
              <span className="text-sm">
                {integrationStatus === 'success' ? 'Integration is working properly' :
                 integrationStatus === 'warning' ? 'Integration is working but with some issues' :
                 integrationStatus === 'error' ? 'Integration has critical issues' : 
                 'Validating integration...'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="game-tester">
            <Play className="mr-2 h-4 w-4" />
            Game Tester
          </TabsTrigger>
          <TabsTrigger value="api-validator">
            <Search className="mr-2 h-4 w-4" />
            API Validator
          </TabsTrigger>
          <TabsTrigger value="transaction-logger">
            <Database className="mr-2 h-4 w-4" />
            Transaction Logger
          </TabsTrigger>
          <TabsTrigger value="integration-report">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Integration Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="game-tester">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Game Launch Tester</CardTitle>
              <CardDescription>
                Test the Pragmatic Play integration by launching games
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
                  className="bg-slate-700 border-slate-600"
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

              <div className="mt-4 pt-4 border-t border-slate-700">
                <Label>Test Logs</Label>
                <div className="bg-slate-900 rounded-md p-2 mt-1 max-h-60 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="text-xs text-slate-300 font-mono py-1">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-validator">
          <PPApiValidator addLog={addLog} />
        </TabsContent>

        <TabsContent value="transaction-logger">
          <PPTransactionLogger />
        </TabsContent>

        <TabsContent value="integration-report">
          <PPIntegrationReport status={integrationStatus} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PPIntegrationTester;

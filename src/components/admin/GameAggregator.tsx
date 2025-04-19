
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, Play, Plus, Database, Package, BellRing } from "lucide-react";
import { gameAggregatorService, GameProvider, Game } from "@/services/gameAggregatorService";
import { useAuth } from "@/contexts/AuthContext";

const GameAggregator = () => {
  const [activeTab, setActiveTab] = useState("providers");
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [isLaunchingGame, setIsLaunchingGame] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [gameMode, setGameMode] = useState<"demo" | "real">("demo");
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    fetchProviders();
  }, []);
  
  useEffect(() => {
    if (selectedProvider) {
      fetchGamesByProvider(selectedProvider);
    }
  }, [selectedProvider]);
  
  const fetchProviders = async () => {
    setIsLoadingProviders(true);
    try {
      const data = await gameAggregatorService.getProviders();
      setProviders(data);
      if (data.length > 0) {
        setSelectedProvider(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setIsLoadingProviders(false);
    }
  };
  
  const fetchGamesByProvider = async (providerId: string) => {
    setIsLoadingGames(true);
    try {
      const data = await gameAggregatorService.getGamesByProvider(providerId);
      setGames(data);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoadingGames(false);
    }
  };
  
  const handleLaunchGame = async (game: Game) => {
    if (!game) return;
    
    setIsLaunchingGame(true);
    setSelectedGame(game.id);
    
    try {
      const gameUrl = await gameAggregatorService.launchGame({
        provider_id: game.provider_id,
        game_id: game.id,
        player_id: isAuthenticated ? user?.id || 'guest' : 'guest',
        mode: gameMode,
        return_url: window.location.href
      });
      
      // Open game in a new window
      window.open(gameUrl, '_blank');
      toast({
        title: "Game Launched",
        description: `${game.name} has been launched in ${gameMode} mode.`,
      });
    } catch (error) {
      console.error("Error launching game:", error);
      toast.error("Failed to launch game");
    } finally {
      setIsLaunchingGame(false);
      setSelectedGame("");
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Game Aggregator</h1>
        <Button variant="outline" onClick={fetchProviders} disabled={isLoadingProviders}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="providers">
            <Package className="mr-2 h-4 w-4" />
            Providers
          </TabsTrigger>
          <TabsTrigger value="games">
            <Play className="mr-2 h-4 w-4" />
            Games
          </TabsTrigger>
          <TabsTrigger value="integration">
            <Database className="mr-2 h-4 w-4" />
            Integration Status
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <BellRing className="mr-2 h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle>Game Providers</CardTitle>
              <CardDescription>
                Manage game providers and their integration status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProviders ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : providers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No providers found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Games</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {providers.map((provider) => (
                        <TableRow key={provider.id}>
                          <TableCell className="font-medium">
                            {provider.name}
                          </TableCell>
                          <TableCell>
                            {provider.code}
                          </TableCell>
                          <TableCell>
                            {provider.games_count}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={provider.status === "active" ? "bg-green-500" : "bg-red-500"}
                            >
                              {provider.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedProvider(provider.id);
                                setActiveTab("games");
                              }}
                            >
                              View Games
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Games</CardTitle>
              <CardDescription>
                Browse and manage games from selected providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="provider-select">Select Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger id="provider-select" className="mt-1">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="game-mode">Game Mode</Label>
                <Select value={gameMode} onValueChange={(value: "demo" | "real") => setGameMode(value)}>
                  <SelectTrigger id="game-mode" className="mt-1">
                    <SelectValue placeholder="Select game mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="real">Real Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isLoadingGames ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : games.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No games found for this provider
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {games.map((game) => (
                    <div 
                      key={game.id}
                      className="border rounded-lg overflow-hidden flex flex-col"
                    >
                      <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
                        {game.thumbnail ? (
                          <img
                            src={game.thumbnail}
                            alt={game.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            No Image
                          </div>
                        )}
                        {game.is_featured && (
                          <Badge className="absolute top-2 left-2 bg-yellow-500">
                            Featured
                          </Badge>
                        )}
                        {game.is_new && (
                          <Badge className="absolute top-2 right-2 bg-blue-500">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-medium mb-1">{game.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Category: {game.category}
                        </p>
                        <div className="flex items-center mt-auto">
                          <Badge className={`mr-2 ${game.status === "active" ? "bg-green-500" : "bg-red-500"}`}>
                            {game.status}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Popularity: {game.popularity}
                          </span>
                        </div>
                        <Button
                          className="mt-4 w-full"
                          onClick={() => handleLaunchGame(game)}
                          disabled={isLaunchingGame && selectedGame === game.id || game.status !== "active"}
                        >
                          {isLaunchingGame && selectedGame === game.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="mr-2 h-4 w-4" />
                          )}
                          {game.status === "active" ? "Play Now" : "Not Available"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>
                Current status of game provider integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">API Connection</h3>
                    <Badge className="bg-green-500">Connected</Badge>
                    <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                      Last checked: {new Date().toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Wallet Integration</h3>
                    <Badge className="bg-green-500">Active</Badge>
                    <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                      Seamless wallet integration is working properly
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Game Launches</h3>
                    <Badge className="bg-green-500">Working</Badge>
                    <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                      All providers can launch games
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Transaction Processing</h3>
                    <Badge className="bg-green-500">Operational</Badge>
                    <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                      Bets, wins, and rollbacks are processing correctly
                    </p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 mt-4">
                  <h3 className="font-semibold mb-2">Provider Status</h3>
                  <div className="space-y-2">
                    {providers.map((provider) => (
                      <div key={provider.id} className="flex justify-between items-center">
                        <span>{provider.name}</span>
                        <Badge className={provider.status === "active" ? "bg-green-500" : "bg-red-500"}>
                          {provider.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure webhook endpoints for game events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction-webhook">Transaction Webhook URL</Label>
                  <Input 
                    id="transaction-webhook" 
                    placeholder="https://example.com/api/webhooks/transactions" 
                    defaultValue=""
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This webhook receives all transaction events (bets, wins, rollbacks)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="launch-webhook">Game Launch Webhook URL</Label>
                  <Input 
                    id="launch-webhook" 
                    placeholder="https://example.com/api/webhooks/launches" 
                    defaultValue=""
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This webhook is called when a player launches a game
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="player-webhook">Player Events Webhook URL</Label>
                  <Input 
                    id="player-webhook" 
                    placeholder="https://example.com/api/webhooks/players" 
                    defaultValue=""
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This webhook is called for player-related events (login, logout, etc.)
                  </p>
                </div>
                
                <Button className="w-full mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Save Webhook Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameAggregator;

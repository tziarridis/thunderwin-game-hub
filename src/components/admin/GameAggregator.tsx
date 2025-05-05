
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PragmaticPlayTester from "@/components/games/PragmaticPlayTester";
import { useEffect, useState } from "react";
import { getProviderConfig, getEnabledProviders } from "@/config/gameProviders";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, Activity, Globe, ChevronDown, Copy, Check, AlertTriangle, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { gameAggregatorService } from "@/services/gameAggregatorService";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Game Aggregator component for admin dashboard
 * Allows testing and management of game provider integrations
 */
const GameAggregator = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pp");
  const [providers, setProviders] = useState<{id: string, name: string, code: string}[]>([]);
  const [additionalProviders, setAdditionalProviders] = useState<{id: string, name: string, code: string}[]>([]);
  const [openProviderDetails, setOpenProviderDetails] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [gameId, setGameId] = useState('');
  const [playerId, setPlayerId] = useState('demo_player');
  const [enabledProviders, setEnabledProviders] = useState(getEnabledProviders());

  useEffect(() => {
    // Get unique provider types
    const uniqueProviders = new Set<string>();
    const providerList: {id: string, name: string, code: string}[] = [];
    const additionalList: {id: string, name: string, code: string}[] = [];
    
    // Get enabled providers
    const enabled = getEnabledProviders();
    setEnabledProviders(enabled);
    
    // Get supported providers with available credentials
    const supportedProviders = {
      pp: { name: "Pragmatic Play", code: "PP" },
      gsp: { name: "GitSlotPark", code: "GSP" },
      pg: { name: "Play'n GO", code: "PG" },
      am: { name: "Amatic", code: "AM" },
      infin: { name: "InfinGame", code: "INFIN" }
    };
    
    // Check which providers have valid configurations
    Object.entries(supportedProviders).forEach(([key, provider]) => {
      if (!uniqueProviders.has(key)) {
        uniqueProviders.add(key);
        
        // For implemented providers, check if we have credentials
        const hasConfig = 
          (key === 'pp' && getProviderConfig('ppeur')) || 
          (key === 'gsp' && getProviderConfig('gspeur')) ||
          (key === 'pg' && getProviderConfig('pgeur')) ||
          (key === 'am' && getProviderConfig('ameur')) ||
          (key === 'infin' && getProviderConfig('infineur'));
        
        // Check if provider is enabled
        const isEnabled = 
          (key === 'pp' && enabled.find(p => p.id === 'ppeur')) ||
          (key === 'gsp' && enabled.find(p => p.id === 'gspeur')) ||
          (key === 'pg' && enabled.find(p => p.id === 'pgeur')) ||
          (key === 'am' && enabled.find(p => p.id === 'ameur')) ||
          (key === 'infin' && enabled.find(p => p.id === 'infineur'));
        
        if (hasConfig && isEnabled) {
          providerList.push({ id: key, name: provider.name, code: provider.code });
        } else if (hasConfig) {
          additionalList.push({ id: key, name: provider.name, code: provider.code });
        }
      }
    });
    
    setProviders(providerList);
    setAdditionalProviders(additionalList);
    
    // Set default active tab to first provider if available
    if (providerList.length > 0 && !uniqueProviders.has(activeTab)) {
      setActiveTab(providerList[0].id);
    }
  }, [activeTab]);

  const handleCopyCallback = (providerId: string, endpoint: string) => {
    let providerConfigId = `${providerId}eur`;
    let url = "";
    
    if (providerId === 'infin') {
      providerConfigId = 'infineur';
    } else if (providerId === 'gsp') {
      providerConfigId = 'gspeur';
    }
    
    const config = getProviderConfig(providerConfigId);
    url = config?.credentials.callbackUrl || "";
    
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedEndpoint(endpoint);
      toast.success(`Callback URL copied to clipboard`);
      
      setTimeout(() => {
        setCopiedEndpoint(null);
      }, 2000);
    }
  };

  const toggleProviderDetails = (providerId: string) => {
    if (openProviderDetails === providerId) {
      setOpenProviderDetails(null);
    } else {
      setOpenProviderDetails(providerId);
    }
  };

  const handleLaunchTestGame = async (providerId: string) => {
    try {
      if (!gameId) {
        toast.error('Please enter a game ID');
        return;
      }
      
      if (!playerId) {
        toast.error('Please enter a player ID');
        return;
      }
      
      toast.info(`Launching ${providerId.toUpperCase()} game: ${gameId}`);
      
      // Prepend provider prefix to game ID if needed
      const formattedGameId = providerId === 'infin' 
        ? gameId.startsWith('infin_') ? gameId : `infin_${gameId}`
        : providerId === 'gsp'
          ? gameId.startsWith('gsp_') ? gameId : `gsp_${gameId}`
          : gameId;
      
      const gameResponse = await gameAggregatorService.createSession(
        formattedGameId, 
        playerId,
        'EUR',
        'web'
      );
      
      if (gameResponse.success && gameResponse.gameUrl) {
        window.open(gameResponse.gameUrl, '_blank');
      } else {
        toast.error(`Failed to launch game: ${gameResponse.errorMessage || 'Unknown error'}`);
      }
    } catch (error: any) {
      toast.error(`Error launching game: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Game Aggregator</h1>
        <div className="flex space-x-2">
          <Link to="/admin/pp-integration-tester">
            <Button variant="outline" size="sm">
              <Activity className="mr-2 h-4 w-4" />
              PP Integration Tester
            </Button>
          </Link>
          <Link to="/admin/aggregator-settings">
            <Button variant="outline" size="sm">
              <Globe className="mr-2 h-4 w-4" />
              Aggregator Settings
            </Button>
          </Link>
        </div>
      </div>
      
      <Alert className="mb-6 bg-yellow-500/10 border border-yellow-500/30">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-500">Game Launch Troubleshooting</AlertTitle>
        <AlertDescription>
          If games are not playing, please check that:
          <ul className="list-disc list-inside ml-4 mt-2 text-sm">
            <li>Your browser is not blocking pop-ups for this site</li>
            <li>Provider API configuration is correct in the Settings tab</li>
            <li>Your wallet has sufficient balance for real money play</li>
            <li>You're logged in when trying to play in real money mode</li>
          </ul>
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {providers.map(provider => (
            <TabsTrigger key={provider.id} value={provider.id}>
              {provider.name}
            </TabsTrigger>
          ))}
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Pragmatic Play Integration Tab */}
        <TabsContent value="pp">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pragmatic Play Integration</CardTitle>
                <CardDescription>
                  Test and manage Pragmatic Play games integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PragmaticPlayTester />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* GitSlotPark Integration Tab */}
        <TabsContent value="gsp">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>GitSlotPark Integration</CardTitle>
                <CardDescription>
                  Test and manage GitSlotPark games integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 bg-blue-500/10 border border-blue-500/50">
                  <AlertDescription>
                    Learn more about the GitSlotPark integration in their 
                    <a href="https://documenter.getpostman.com/view/25695248/2sA3Qy7VR4" target="_blank" rel="noopener noreferrer" 
                      className="text-blue-400 hover:underline mx-1">
                      API documentation
                    </a>.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="gsp-gameId">Game ID</Label>
                    <Input 
                      id="gsp-gameId" 
                      placeholder="Enter game ID (e.g. blackjack)" 
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gsp-playerId">Player ID</Label>
                    <Input 
                      id="gsp-playerId" 
                      placeholder="Enter player ID"
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center mt-4">
                  <Button onClick={() => handleLaunchTestGame('gsp')} className="px-6">
                    <Play className="mr-2 h-4 w-4" />
                    Launch Test Game
                  </Button>
                </div>
                
                <div className="p-4 bg-slate-800 rounded-md mt-6">
                  <h3 className="text-lg mb-2">Integration Details</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Configure these endpoints in your GitSlotPark integration dashboard.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                      <div>
                        <p className="text-sm font-semibold">API Endpoint:</p>
                        <p className="text-xs text-gray-400">{getProviderConfig('gspeur')?.credentials.apiEndpoint}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => {
                        handleCopyCallback('gsp', 'gsp-api');
                      }} className="h-8 px-2">
                        {copiedEndpoint === 'gsp-api' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                      <div>
                        <p className="text-sm font-semibold">Documentation URL:</p>
                        <p className="text-xs text-gray-400">https://documenter.getpostman.com/view/25695248/2sA3Qy7VR4</p>
                      </div>
                      <a href="https://documenter.getpostman.com/view/25695248/2sA3Qy7VR4" target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-8 px-2">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* InfinGame Integration Tab */}
        <TabsContent value="infin">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>InfinGame Integration</CardTitle>
                <CardDescription>
                  Test and manage InfinGame integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 bg-blue-500/10 text-blue-500 border-blue-500/50">
                  <AlertDescription>
                    The InfinGame integration is set up using the API endpoint: 
                    <a href="https://infinapi-docs.axis-stage.infingame.com/" target="_blank" rel="noopener noreferrer" 
                      className="text-blue-400 hover:underline mx-1">
                      https://infinapi-docs.axis-stage.infingame.com/
                    </a>
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="infin-gameId">Game ID</Label>
                    <Input 
                      id="infin-gameId" 
                      placeholder="Enter game ID (e.g. luckyslots)" 
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="infin-playerId">Player ID</Label>
                    <Input 
                      id="infin-playerId" 
                      placeholder="Enter player ID"
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center mt-4">
                  <Button onClick={() => handleLaunchTestGame('infin')} className="px-6">
                    <Play className="mr-2 h-4 w-4" />
                    Launch Test Game
                  </Button>
                </div>
                
                <div className="p-4 bg-slate-800 rounded-md mt-6">
                  <h3 className="text-lg mb-2">Integration Details</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Configure these endpoints in your InfinGame integration dashboard.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                      <div>
                        <p className="text-sm font-semibold">API Endpoint:</p>
                        <p className="text-xs text-gray-400">{getProviderConfig('infineur')?.credentials.apiEndpoint}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => {
                        handleCopyCallback('infin', 'infin-api');
                      }} className="h-8 px-2">
                        {copiedEndpoint === 'infin-api' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                      <div>
                        <p className="text-sm font-semibold">Documentation URL:</p>
                        <p className="text-xs text-gray-400">https://infinapi-docs.axis-stage.infingame.com/</p>
                      </div>
                      <a href="https://infinapi-docs.axis-stage.infingame.com/" target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-8 px-2">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Provider Settings</CardTitle>
                <CardDescription>
                  Configure game provider integration settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    This section allows you to configure various settings for game provider integrations.
                    You can manage API keys, callback URLs, and other integration settings.
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-4">Callback Endpoints</h3>
                  <div className="space-y-4 mt-2">
                    {providers.map(provider => (
                      <Collapsible 
                        key={provider.id} 
                        open={openProviderDetails === provider.id}
                        onOpenChange={() => toggleProviderDetails(provider.id)}
                        className="border border-slate-700 rounded-md"
                      >
                        <CollapsibleTrigger asChild>
                          <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800">
                            <div className="flex items-center">
                              <Globe className="mr-2 h-5 w-5 text-blue-400" />
                              <div>
                                <p className="font-medium">{provider.name}</p>
                                <p className="text-sm text-gray-400">Provider Code: {provider.code}</p>
                              </div>
                            </div>
                            <ChevronDown className={`h-5 w-5 transition-transform ${openProviderDetails === provider.id ? 'transform rotate-180' : ''}`} />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 border-t border-slate-700 bg-slate-800">
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 bg-slate-700 rounded-md">
                                <p className="text-sm font-medium mb-1">EUR Callback URL</p>
                                <div className="flex items-center justify-between">
                                  <code className="text-xs bg-slate-800 p-1 rounded overflow-x-auto max-w-[80%]">
                                    {(() => {
                                      let configId = provider.id === 'infin' ? 'infineur' : 
                                                     provider.id === 'gsp' ? 'gspeur' : 
                                                     `${provider.id}eur`;
                                      return getProviderConfig(configId)?.credentials.callbackUrl || 'Not configured';
                                    })()}
                                  </code>
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    let configId = provider.id === 'infin' ? 'infineur' : 
                                                   provider.id === 'gsp' ? 'gspeur' : 
                                                   `${provider.id}eur`;
                                    const url = getProviderConfig(configId)?.credentials.callbackUrl;
                                    
                                    if (url) {
                                      navigator.clipboard.writeText(url);
                                      toast.success('Callback URL copied');
                                    }
                                  }}>
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="p-3 bg-slate-700 rounded-md">
                                <p className="text-sm font-medium mb-1">API Endpoint</p>
                                <div className="flex items-center justify-between">
                                  <code className="text-xs bg-slate-800 p-1 rounded">
                                    {(() => {
                                      let configId = provider.id === 'infin' ? 'infineur' : 
                                                     provider.id === 'gsp' ? 'gspeur' : 
                                                     `${provider.id}eur`;
                                      const endpoint = getProviderConfig(configId)?.credentials.apiEndpoint;
                                      return endpoint ? `https://${endpoint}` : 'Not configured';
                                    })()}
                                  </code>
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    let configId = provider.id === 'infin' ? 'infineur' : 
                                                   provider.id === 'gsp' ? 'gspeur' : 
                                                   `${provider.id}eur`;
                                    const endpoint = getProviderConfig(configId)?.credentials.apiEndpoint;
                                    
                                    if (endpoint) {
                                      navigator.clipboard.writeText(`https://${endpoint}`);
                                      toast.success('API endpoint copied');
                                    }
                                  }}>
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-end mt-2">
                              <a href={
                                provider.id === 'gsp' 
                                  ? 'https://documenter.getpostman.com/view/25695248/2sA3Qy7VR4'
                                  : provider.id === 'infin'
                                    ? 'https://infinapi-docs.axis-stage.infingame.com/'
                                    : `https://your-domain/api/seamless/${provider.id.toLowerCase()}`
                                } 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  API Documentation
                                </Button>
                              </a>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline" onClick={() => navigate('/admin/aggregator-settings')}>
                      <Globe className="mr-2 h-4 w-4" />
                      Advanced Aggregator Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameAggregator;

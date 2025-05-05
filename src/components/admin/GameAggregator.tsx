
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PragmaticPlayTester from "@/components/games/PragmaticPlayTester";
import { useEffect, useState } from "react";
import { getProviderConfig } from "@/config/gameProviders";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, Activity, Globe, ChevronDown, Copy, Check, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

/**
 * Game Aggregator component for admin dashboard
 * Allows testing and management of game provider integrations
 */
const GameAggregator = () => {
  const [activeTab, setActiveTab] = useState("pp");
  const [providers, setProviders] = useState<{id: string, name: string, code: string}[]>([]);
  const [additionalProviders, setAdditionalProviders] = useState<{id: string, name: string, code: string}[]>([]);
  const [openProviderDetails, setOpenProviderDetails] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  
  useEffect(() => {
    // Get unique provider types
    const uniqueProviders = new Set<string>();
    const providerList: {id: string, name: string, code: string}[] = [];
    const additionalList: {id: string, name: string, code: string}[] = [];
    
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
        
        if (hasConfig) {
          providerList.push({ id: key, name: provider.name, code: provider.code });
        } else {
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
    const config = getProviderConfig(`${providerId}eur`);
    if (config) {
      navigator.clipboard.writeText(config.credentials.callbackUrl);
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
          <Link to="/api/seamless/pragmatic" target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              View PP Callback Endpoint
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
                    The InfinGame integration is set up using the API endpoint: https://infinapi-docs.axis-stage.infingame.com/
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800 rounded-md">
                    <h3 className="text-lg mb-2">Integration Details</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Configure these endpoints in your InfinGame integration dashboard.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                        <div>
                          <p className="text-sm font-semibold">Callback URL:</p>
                          <p className="text-xs text-gray-400">https://your-api.com/infin/callback</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => {
                          navigator.clipboard.writeText("https://your-api.com/infin/callback");
                          setCopiedEndpoint('infin-callback');
                          toast.success('Callback URL copied to clipboard');
                          setTimeout(() => setCopiedEndpoint(null), 2000);
                        }}
                          className="h-8 px-2">
                          {copiedEndpoint === 'infin-callback' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                        <div>
                          <p className="text-sm font-semibold">API Endpoint:</p>
                          <p className="text-xs text-gray-400">https://infinapi-docs.axis-stage.infingame.com/</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => {
                          navigator.clipboard.writeText("https://infinapi-docs.axis-stage.infingame.com/");
                          setCopiedEndpoint('infin-api');
                          toast.success('API endpoint copied to clipboard');
                          setTimeout(() => setCopiedEndpoint(null), 2000);
                        }} className="h-8 px-2">
                          {copiedEndpoint === 'infin-api' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
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
                                    {provider.id === 'infin' 
                                    ? 'https://your-api.com/infin/callback' 
                                    : getProviderConfig(`${provider.id}eur`)?.credentials.callbackUrl}
                                  </code>
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    const url = provider.id === 'infin' 
                                    ? 'https://your-api.com/infin/callback' 
                                    : getProviderConfig(`${provider.id}eur`)?.credentials.callbackUrl;
                                    
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
                                <p className="text-sm font-medium mb-1">USD Callback URL</p>
                                <div className="flex items-center justify-between">
                                  <code className="text-xs bg-slate-800 p-1 rounded overflow-x-auto max-w-[80%]">
                                    {provider.id === 'infin' 
                                    ? 'https://your-api.com/infin/usd/callback' 
                                    : getProviderConfig(`${provider.id}usd`)?.credentials.callbackUrl || 
                                      getProviderConfig(`${provider.id}eur`)?.credentials.callbackUrl}
                                  </code>
                                  <Button size="sm" variant="ghost" onClick={() => {
                                    const url = provider.id === 'infin' 
                                    ? 'https://your-api.com/infin/usd/callback' 
                                    : getProviderConfig(`${provider.id}usd`)?.credentials.callbackUrl || 
                                      getProviderConfig(`${provider.id}eur`)?.credentials.callbackUrl;
                                    
                                    if (url) {
                                      navigator.clipboard.writeText(url);
                                      toast.success('Callback URL copied');
                                    }
                                  }}>
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-3 bg-slate-700 rounded-md">
                              <p className="text-sm font-medium mb-1">API Endpoint</p>
                              <div className="flex items-center justify-between">
                                <code className="text-xs bg-slate-800 p-1 rounded">
                                  {provider.id === 'infin' 
                                  ? 'https://infinapi-docs.axis-stage.infingame.com/' 
                                  : `https://${getProviderConfig(`${provider.id}eur`)?.credentials.apiEndpoint}`}
                                </code>
                                <Button size="sm" variant="ghost" onClick={() => {
                                  const endpoint = provider.id === 'infin' 
                                  ? 'https://infinapi-docs.axis-stage.infingame.com/' 
                                  : getProviderConfig(`${provider.id}eur`)?.credentials.apiEndpoint;
                                  
                                  if (endpoint) {
                                    navigator.clipboard.writeText(`https://${endpoint}`);
                                    toast.success('API endpoint copied');
                                  }
                                }}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex justify-end mt-2">
                              <Link to={`/api/seamless/${provider.id.toLowerCase()}`} target="_blank">
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Test Endpoint
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
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

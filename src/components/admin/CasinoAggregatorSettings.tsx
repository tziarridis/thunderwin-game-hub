
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { gameProviderConfigs, updateProviderConfig } from "@/config/gameProviders";
import { Globe, Check, Copy, RefreshCw, AlertCircle } from "lucide-react";

const CasinoAggregatorSettings = () => {
  const [activeTab, setActiveTab] = useState("pp");
  const [providerConfigs, setProviderConfigs] = useState(gameProviderConfigs);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  
  // Group providers by their code for tab display
  const providerGroups = React.useMemo(() => {
    const groups: Record<string, typeof gameProviderConfigs> = {};
    
    providerConfigs.forEach(provider => {
      const code = provider.code.toLowerCase();
      if (!groups[code]) {
        groups[code] = [];
      }
      groups[code].push(provider);
    });
    
    return groups;
  }, [providerConfigs]);
  
  // Get tab keys sorted alphabetically
  const tabKeys = Object.keys(providerGroups).sort();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(label);
    toast.success(`${label} copied to clipboard`);
    
    setTimeout(() => {
      setCopiedValue(null);
    }, 2000);
  };
  
  const handleEditToggle = (providerId: string) => {
    if (isEditing === providerId) {
      // Save changes
      const provider = providerConfigs.find(p => p.id === providerId);
      if (provider && formValues[providerId]) {
        const updatedProvider = {
          ...provider,
          credentials: {
            ...provider.credentials,
            ...formValues[providerId]
          }
        };
        
        const updated = updateProviderConfig(providerId, updatedProvider);
        if (updated) {
          setProviderConfigs([...gameProviderConfigs]);
          toast.success("Provider configuration updated");
        } else {
          toast.error("Failed to update provider configuration");
        }
      }
      setIsEditing(null);
    } else {
      // Start editing
      const provider = providerConfigs.find(p => p.id === providerId);
      if (provider) {
        setFormValues({
          ...formValues,
          [providerId]: { ...provider.credentials }
        });
        setIsEditing(providerId);
      }
    }
  };
  
  const handleInputChange = (providerId: string, field: string, value: string) => {
    setFormValues({
      ...formValues,
      [providerId]: {
        ...(formValues[providerId] || {}),
        [field]: value
      }
    });
  };
  
  const handleTestConnection = (providerId: string) => {
    setTestingProvider(providerId);
    
    // Simulate API call
    setTimeout(() => {
      setTestingProvider(null);
      const success = Math.random() > 0.3; // 70% chance of success for demo
      
      if (success) {
        toast.success("Connection successful! API is responding correctly.");
      } else {
        toast.error("Connection failed. Please check your credentials.");
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          {tabKeys.map(key => (
            <TabsTrigger key={key} value={key}>
              {key.toUpperCase()}
            </TabsTrigger>
          ))}
          <TabsTrigger value="infin">INFIN</TabsTrigger>
        </TabsList>
        
        {tabKeys.map(key => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              {providerGroups[key]?.map(provider => (
                <Card key={provider.id} className="border border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="mr-2 h-5 w-5 text-blue-400" />
                      {provider.name} - {provider.currency}
                    </CardTitle>
                    <CardDescription>
                      Provider ID: {provider.id} | Type: {provider.type}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${provider.id}-endpoint`}>API Endpoint</Label>
                          <div className="flex mt-1">
                            <Input 
                              id={`${provider.id}-endpoint`}
                              value={isEditing === provider.id 
                                ? formValues[provider.id]?.apiEndpoint 
                                : provider.credentials.apiEndpoint}
                              disabled={isEditing !== provider.id}
                              onChange={(e) => handleInputChange(provider.id, 'apiEndpoint', e.target.value)}
                              className="flex-grow"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleCopy(provider.credentials.apiEndpoint, "API Endpoint")}
                            >
                              {copiedValue === "API Endpoint" ? <Check size={16} /> : <Copy size={16} />}
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`${provider.id}-agentid`}>Agent ID</Label>
                          <div className="flex mt-1">
                            <Input 
                              id={`${provider.id}-agentid`}
                              value={isEditing === provider.id 
                                ? formValues[provider.id]?.agentId 
                                : provider.credentials.agentId}
                              disabled={isEditing !== provider.id}
                              onChange={(e) => handleInputChange(provider.id, 'agentId', e.target.value)}
                              className="flex-grow"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleCopy(provider.credentials.agentId, "Agent ID")}
                            >
                              {copiedValue === "Agent ID" ? <Check size={16} /> : <Copy size={16} />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${provider.id}-secret`}>Secret Key</Label>
                          <div className="flex mt-1">
                            <Input 
                              id={`${provider.id}-secret`}
                              value={isEditing === provider.id 
                                ? formValues[provider.id]?.secretKey 
                                : provider.credentials.secretKey}
                              disabled={isEditing !== provider.id}
                              type={isEditing === provider.id ? "text" : "password"}
                              onChange={(e) => handleInputChange(provider.id, 'secretKey', e.target.value)}
                              className="flex-grow"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleCopy(provider.credentials.secretKey, "Secret Key")}
                            >
                              {copiedValue === "Secret Key" ? <Check size={16} /> : <Copy size={16} />}
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`${provider.id}-callback`}>Callback URL</Label>
                          <div className="flex mt-1">
                            <Input 
                              id={`${provider.id}-callback`}
                              value={isEditing === provider.id 
                                ? formValues[provider.id]?.callbackUrl 
                                : provider.credentials.callbackUrl}
                              disabled={isEditing !== provider.id}
                              onChange={(e) => handleInputChange(provider.id, 'callbackUrl', e.target.value)}
                              className="flex-grow"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleCopy(provider.credentials.callbackUrl, "Callback URL")}
                            >
                              {copiedValue === "Callback URL" ? <Check size={16} /> : <Copy size={16} />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4">
                        <Switch 
                          id={`${provider.id}-enabled`} 
                          checked={provider.enabled}
                          onCheckedChange={() => {
                            const updated = updateProviderConfig(provider.id, {
                              enabled: !provider.enabled
                            });
                            if (updated) {
                              setProviderConfigs([...gameProviderConfigs]);
                              toast.success(`Provider ${provider.enabled ? 'disabled' : 'enabled'}`);
                            }
                          }}
                        />
                        <Label htmlFor={`${provider.id}-enabled`}>Provider Enabled</Label>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant={isEditing === provider.id ? "default" : "outline"}
                      onClick={() => handleEditToggle(provider.id)}
                    >
                      {isEditing === provider.id ? "Save Changes" : "Edit Configuration"}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handleTestConnection(provider.id)}
                      disabled={testingProvider === provider.id}
                    >
                      {testingProvider === provider.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
        
        {/* InfinGame Tab */}
        <TabsContent value="infin" className="space-y-4">
          <Card className="border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5 text-blue-400" />
                InfinGame - EUR
              </CardTitle>
              <CardDescription>
                Provider ID: infineur | Type: slots
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="p-4 bg-slate-800 rounded-md mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-500">Integration Notes</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      InfinGame uses a different API format than other providers. Please refer to their
                      <a href="https://infinapi-docs.axis-stage.infingame.com/" target="_blank" rel="noopener noreferrer" 
                        className="text-blue-400 hover:underline mx-1">
                        API documentation
                      </a>
                      for more details.
                    </p>
                  </div>
                </div>
              </div>
            
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="infin-endpoint">API Endpoint</Label>
                    <div className="flex mt-1">
                      <Input 
                        id="infin-endpoint"
                        value="infinapi-docs.axis-stage.infingame.com"
                        disabled={isEditing !== "infineur"}
                        className="flex-grow"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCopy("infinapi-docs.axis-stage.infingame.com", "InfinGame API")}
                      >
                        {copiedValue === "InfinGame API" ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="infin-agentid">Agent ID</Label>
                    <div className="flex mt-1">
                      <Input 
                        id="infin-agentid"
                        value="casinothunder"
                        disabled={isEditing !== "infineur"}
                        className="flex-grow"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCopy("casinothunder", "InfinGame Agent ID")}
                      >
                        {copiedValue === "InfinGame Agent ID" ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="infin-secret">API Token</Label>
                    <div className="flex mt-1">
                      <Input 
                        id="infin-secret"
                        value="api-token-here"
                        disabled={isEditing !== "infineur"}
                        type="password"
                        className="flex-grow"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCopy("api-token-here", "InfinGame Token")}
                      >
                        {copiedValue === "InfinGame Token" ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="infin-callback">Callback URL</Label>
                    <div className="flex mt-1">
                      <Input 
                        id="infin-callback"
                        value="https://your-api.com/infin/callback"
                        disabled={isEditing !== "infineur"}
                        className="flex-grow"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCopy("https://your-api.com/infin/callback", "InfinGame Callback")}
                      >
                        {copiedValue === "InfinGame Callback" ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <Switch 
                    id="infin-enabled" 
                    checked={true}
                    onCheckedChange={() => {
                      toast.success(`InfinGame provider ${true ? 'disabled' : 'enabled'}`);
                    }}
                  />
                  <Label htmlFor="infin-enabled">Provider Enabled</Label>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant={isEditing === "infineur" ? "default" : "outline"}
                onClick={() => handleEditToggle("infineur")}
              >
                {isEditing === "infineur" ? "Save Changes" : "Edit Configuration"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleTestConnection("infineur")}
                disabled={testingProvider === "infineur"}
              >
                {testingProvider === "infineur" ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CasinoAggregatorSettings;

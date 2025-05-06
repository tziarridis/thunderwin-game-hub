
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { GameProviderConfig, getEnabledProviders } from "@/config/gameProviders";
import { Globe, Check, Copy, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";

const CasinoAggregatorSettings = () => {
  const [activeTab, setActiveTab] = useState("pp");
  const [providerConfigs, setProviderConfigs] = useState(getEnabledProviders());
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  
  // Group providers by their type for tab display
  const providerGroups = React.useMemo(() => {
    const groups: Record<string, typeof providerConfigs> = {};
    
    providerConfigs.forEach(provider => {
      // Use provider id prefix as the group key (e.g., pp from ppeur)
      const code = provider.id.substring(0, 2).toLowerCase();
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
        
        const updated = GameProviderConfig.updateConfig(providerId, updatedProvider);
        if (updated) {
          setProviderConfigs(getEnabledProviders());
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

  const renderProviderCard = (provider: GameProviderConfig) => {
    const hasToken = provider.id.includes('infin') || provider.id.includes('gsp');
    const providerType = provider.id.substring(0, 2).toUpperCase();
    
    return (
      <Card key={provider.id} className="border border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5 text-blue-400" />
            {provider.name} 
            {provider.currency && ` - ${provider.currency}`}
          </CardTitle>
          <CardDescription>
            Provider ID: {provider.id} | Type: {provider.type || 'standard'}
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
                      : provider.credentials?.apiEndpoint || ''}
                    disabled={isEditing !== provider.id}
                    onChange={(e) => handleInputChange(provider.id, 'apiEndpoint', e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleCopy(provider.credentials?.apiEndpoint || '', "API Endpoint")}
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
                      : provider.credentials?.agentId || ''}
                    disabled={isEditing !== provider.id}
                    onChange={(e) => handleInputChange(provider.id, 'agentId', e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleCopy(provider.credentials?.agentId || '', "Agent ID")}
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
                      : provider.credentials?.secretKey || ''}
                    disabled={isEditing !== provider.id}
                    type={isEditing === provider.id ? "text" : "password"}
                    onChange={(e) => handleInputChange(provider.id, 'secretKey', e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleCopy(provider.credentials?.secretKey || '', "Secret Key")}
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
                      : provider.credentials?.callbackUrl || ''}
                    disabled={isEditing !== provider.id}
                    onChange={(e) => handleInputChange(provider.id, 'callbackUrl', e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleCopy(provider.credentials?.callbackUrl || '', "Callback URL")}
                  >
                    {copiedValue === "Callback URL" ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>
            </div>
            
            {hasToken && (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <Label htmlFor={`${provider.id}-token`}>API Token</Label>
                  <div className="flex mt-1">
                    <Input 
                      id={`${provider.id}-token`}
                      value={isEditing === provider.id 
                        ? formValues[provider.id]?.token 
                        : provider.credentials?.token || ""}
                      disabled={isEditing !== provider.id}
                      type={isEditing === provider.id ? "text" : "password"}
                      onChange={(e) => handleInputChange(provider.id, 'token', e.target.value)}
                      className="flex-grow"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleCopy(provider.credentials?.token || "", "API Token")}
                    >
                      {copiedValue === "API Token" ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 mt-4">
              <Switch 
                id={`${provider.id}-enabled`} 
                checked={provider.enabled || false}
                onCheckedChange={() => {
                  const updated = GameProviderConfig.updateConfig(provider.id, {
                    enabled: !provider.enabled
                  });
                  if (updated) {
                    setProviderConfigs(getEnabledProviders());
                    toast.success(`Provider ${provider.enabled ? 'disabled' : 'enabled'}`);
                  }
                }}
              />
              <Label htmlFor={`${provider.id}-enabled`}>Provider Enabled</Label>
            </div>
            
            {(provider.id.includes('gsp') || provider.id.includes('infin')) && (
              <div className="p-4 bg-slate-800 rounded-md mt-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-500">API Documentation</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      View the {provider.name} API documentation:
                      <a href={
                        provider.id.includes('gsp') 
                          ? 'https://documenter.getpostman.com/view/25695248/2sA3Qy7VR4' 
                          : 'https://infinapi-docs.axis-stage.infingame.com/'
                        } 
                        target="_blank" rel="noopener noreferrer" 
                        className="text-blue-400 hover:underline ml-1 inline-flex items-center">
                        API Docs <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}
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
    );
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
        </TabsList>
        
        {tabKeys.map(key => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              {providerGroups[key]?.map(provider => renderProviderCard(provider))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CasinoAggregatorSettings;

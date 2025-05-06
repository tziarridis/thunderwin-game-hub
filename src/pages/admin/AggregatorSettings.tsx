import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CasinoAggregatorSettings from "@/components/admin/CasinoAggregatorSettings";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRight, Home, Settings, Globe, PlusCircle } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { GameProviderConfig } from "@/config/gameProviders";

const AggregatorSettings = () => {
  const [activeTab, setActiveTab] = useState("casino");
  const [newAggregatorOpen, setNewAggregatorOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "slots",
    currency: "EUR",
    apiEndpoint: "",
    agentId: "",
    secretKey: "",
    token: "",
    callbackUrl: `${window.location.origin}/casino/seamless`
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update the callback URL based on the provider code and currency
    if (name === 'code' || name === 'currency') {
      const code = name === 'code' ? value.toLowerCase() : formData.code.toLowerCase();
      const currency = name === 'currency' ? value.toLowerCase() : formData.currency.toLowerCase();
      
      const providerPath = code === 'pp' ? '/casino/seamless/pp' : 
                           code === 'evo' ? '/casino/seamless/evolution' :
                           code === 'gsp' ? '/casino/seamless/gsp' :
                           code === 'infin' ? '/casino/seamless/infin' : 
                           '/casino/seamless';
      
      setFormData(prev => ({
        ...prev,
        callbackUrl: `${window.location.origin}${providerPath}`
      }));
    }
  };

  const handleAddAggregator = () => {
    // Validate form data
    if (!formData.name || !formData.code || !formData.apiEndpoint || !formData.agentId || !formData.secretKey) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // Create a unique ID based on provider code and currency
      const id = `${formData.code.toLowerCase()}${formData.currency.toLowerCase()}`;
      
      // Create new provider config
      const newProvider = {
        id,
        name: formData.name,
        currency: formData.currency,
        type: formData.type,
        enabled: true,
        // Adding credentials object
        credentials: {
          apiEndpoint: formData.apiEndpoint,
          agentId: formData.agentId,
          secretKey: formData.secretKey,
          token: formData.token || undefined, // Only add token if it has a value
          callbackUrl: formData.callbackUrl
        }
      };
      
      // Add provider to availableProviders
      GameProviderConfig.updateConfig(id, newProvider);
      
      toast.success(`Added new aggregator: ${formData.name}`);
      setNewAggregatorOpen(false);
      
      // Reset form
      setFormData({
        name: "",
        code: "",
        type: "slots",
        currency: "EUR",
        apiEndpoint: "",
        agentId: "",
        secretKey: "",
        token: "",
        callbackUrl: `${window.location.origin}/casino/seamless`
      });
      
      // Force refresh component
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      toast.error("Failed to add new aggregator");
      console.error("Error adding aggregator:", error);
    }
  };

  
  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/dashboard">
            <Home className="h-4 w-4 mr-1" />
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/game-management">Game Management</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>Aggregator Settings</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Settings className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Game Aggregator Settings</h1>
        </div>
        <Dialog open={newAggregatorOpen} onOpenChange={setNewAggregatorOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Aggregator
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Game Aggregator</DialogTitle>
              <DialogDescription>
                Configure a new game provider aggregator integration.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Provider Name</Label>
                  <Input 
                    id="name"
                    name="name"
                    placeholder="e.g. Pragmatic Play" 
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Provider Code</Label>
                  <Input 
                    id="code"
                    name="code"
                    placeholder="e.g. PP" 
                    value={formData.code}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Provider Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slots">Slots</SelectItem>
                      <SelectItem value="live">Live Casino</SelectItem>
                      <SelectItem value="table">Table Games</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => handleSelectChange('currency', value)}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="BRL">BRL</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiEndpoint">API Endpoint</Label>
                <Input 
                  id="apiEndpoint"
                  name="apiEndpoint"
                  placeholder="e.g. api.provider.com" 
                  value={formData.apiEndpoint}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agentId">Agent ID</Label>
                  <Input 
                    id="agentId"
                    name="agentId"
                    placeholder="Your agent ID" 
                    value={formData.agentId}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <Input 
                    id="secretKey"
                    name="secretKey"
                    placeholder="Your secret key" 
                    value={formData.secretKey}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">API Token (Optional)</Label>
                <Input 
                  id="token"
                  name="token"
                  placeholder="API token (if required)" 
                  value={formData.token}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-muted-foreground">
                  Only required for some providers like GitSlotPark or InfinGame
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="callbackUrl">Callback URL</Label>
                <Input 
                  id="callbackUrl"
                  name="callbackUrl"
                  placeholder="Your callback URL" 
                  value={formData.callbackUrl}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewAggregatorOpen(false)}>Cancel</Button>
              <Button onClick={handleAddAggregator}>Add Aggregator</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Separator className="my-6" />
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="casino">Casino Aggregators</TabsTrigger>
          <TabsTrigger value="sports">Sports Aggregators</TabsTrigger>
          <TabsTrigger value="live">Live Dealer Aggregators</TabsTrigger>
        </TabsList>
        
        <TabsContent value="casino" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Available Casino Aggregators
              </CardTitle>
              <CardDescription>
                Configure your casino game aggregators for multiple providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CasinoAggregatorSettings />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sports Aggregators</CardTitle>
              <CardDescription>Configure your sports betting aggregators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No sports aggregators configured yet</p>
                <Button onClick={() => {
                  setFormData(prev => ({...prev, type: 'sports'}));
                  setNewAggregatorOpen(true);
                }}>Add Sports Aggregator</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="live" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Dealer Aggregators</CardTitle>
              <CardDescription>Configure your live dealer game aggregators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No live dealer aggregators configured yet</p>
                <Button onClick={() => {
                  setFormData(prev => ({...prev, type: 'live'}));
                  setNewAggregatorOpen(true);
                }}>Add Live Dealer Aggregator</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AggregatorSettings;

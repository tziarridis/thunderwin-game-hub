
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PragmaticPlayTester from "@/components/games/PragmaticPlayTester";
import GitSlotParkTester from "@/components/games/GitSlotParkTester";
import { useEffect, useState } from "react";
import { getProviderConfig } from "@/config/gameProviders";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, Activity, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import PPTransactionLogger from "./PPTransactionLogger";

/**
 * Game Aggregator component for admin dashboard
 * Allows testing and management of game provider integrations
 */
const GameAggregator = () => {
  const [activeTab, setActiveTab] = useState("pp");
  const [providers, setProviders] = useState<{id: string, name: string, code: string}[]>([]);
  const [additionalProviders, setAdditionalProviders] = useState<{id: string, name: string, code: string}[]>([]);
  
  useEffect(() => {
    // Get unique provider types
    const uniqueProviders = new Set<string>();
    const providerList: {id: string, name: string, code: string}[] = [];
    const additionalList: {id: string, name: string, code: string}[] = [];
    
    // Get supported providers with available credentials
    const supportedProviders = {
      pp: { name: "Pragmatic Play", code: "PP" },
      gsp: { name: "GitSlotPark", code: "GSP" }
    };
    
    // Check which providers have valid configurations
    Object.entries(supportedProviders).forEach(([key, provider]) => {
      if (!uniqueProviders.has(key)) {
        uniqueProviders.add(key);
        
        // For implemented providers (PP and GSP), check if we have credentials
        const hasConfig = 
          (key === 'pp' && getProviderConfig('ppeur')) || 
          (key === 'gsp' && getProviderConfig('gspeur'));
        
        if (hasConfig) {
          providerList.push({ id: key, name: provider.name, code: provider.code });
        }
      }
    });
    
    // Additional providers that could be integrated
    additionalList.push(
      { id: 'pg', name: 'Play\'n GO', code: 'PG' },
      { id: 'am', name: 'Amatic', code: 'AM' }
    );
    
    setProviders(providerList);
    setAdditionalProviders(additionalList);
    
    // Set default active tab to first provider if available
    if (providerList.length > 0 && !uniqueProviders.has(activeTab)) {
      setActiveTab(providerList[0].id);
    }
  }, [activeTab]);

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
          <Link to="/casino/gitslotpark-seamless" target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Seamless Wallet
            </Button>
          </Link>
          <Link to="/casino/seamless" target="_blank">
            <Button variant="outline" size="sm">
              <Cpu className="mr-2 h-4 w-4" />
              Seamless API Docs
            </Button>
          </Link>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {providers.map(provider => (
            <TabsTrigger key={provider.id} value={provider.id}>
              {provider.name}
            </TabsTrigger>
          ))}
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
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
                <GitSlotParkTester />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  GitSlotPark Seamless API Endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-slate-800 rounded-md p-4">
                    <h3 className="font-semibold mb-2 text-white">Withdraw Endpoint (Bet)</h3>
                    <p className="text-sm text-white/70 mb-2">
                      Called when the User places a bet (debit). Decreases player's balance by amount and returns new balance.
                    </p>
                    <pre className="bg-slate-900 p-3 rounded-md text-xs overflow-auto">
{`POST /Withdraw

// Request
{
  "agentID": "Partner01",
  "sign": "AED10CF82100B6B4E94089A60E0043A49395442E1F2D343E8DF2C27343A89FC4",
  "userID": "Player01",
  "amount": 0.1,
  "transactionID": "4146ed8dd6d5497780e9fc273e86bae0",
  "roundID": "307e9124a5314f2795ce583391e1c61c",
  "gameID": 2001,
  "freeSpinID":"freespin001"
}

// Response
{
  "code": 0,
  "message": "",
  "platformTransactionID": "d2583e276c0a4980bf7a0913a94c00c0",
  "balance": 22981.77
}`}</pre>
                  </div>
                  
                  <div className="bg-slate-800 rounded-md p-4">
                    <h3 className="font-semibold mb-2 text-white">Deposit Endpoint (Win)</h3>
                    <p className="text-sm text-white/70 mb-2">
                      Called when the User wins. Increases player's balance by amount and returns new balance.
                    </p>
                    <pre className="bg-slate-900 p-3 rounded-md text-xs overflow-auto">
{`POST /Deposit

// Request
{
  "agentID": "Partner01",
  "sign": "5E0A0349AE36AD67CD21D891AB124CCE8CC4171C5BD7EF5B26FCA86DB71F500A",
  "userID": "Player01",
  "amount": 3.40,
  "refTransactionID": "4146ed8dd6d5497780e9fc273e86bae0",
  "transactionID": "2f489d44b61f4650af780ab4c28a7745",
  "roundID": "307e9124a5314f2795ce583391e1c61c",
  "gameID": 2001,
  "freeSpinID":"freespin001"
}

// Response
{
  "code": 0,
  "message": "",
  "platformTransactionID": "474e1a293c2f4e7ab122c52d68423fcb",
  "balance": 100
}`}</pre>
                  </div>
                  
                  <div className="bg-slate-800 rounded-md p-4">
                    <h3 className="font-semibold mb-2 text-white">Rollback Endpoint</h3>
                    <p className="text-sm text-white/70 mb-2">
                      Called when there is need to roll back the effect of a transaction.
                    </p>
                    <pre className="bg-slate-900 p-3 rounded-md text-xs overflow-auto">
{`POST /RollbackTransaction

// Request
{
  "agentID": "Partner01",
  "sign": "712523E472F936E88B9806A5919326B50DE2C71319837E7149B8BFD1DA9E09DD",
  "userID": "Player01",
  "refTransactionID": "4146ed8dd6d5497780e9fc273e86bae0",
  "gameID": 2001
}

// Response
{
  "code": 0,
  "message": ""
}`}</pre>
                  </div>
                  
                  <Alert className="bg-slate-800 border-slate-700">
                    <AlertDescription>
                      <p className="text-white/70 text-sm">
                        For a full API reference, please visit the <Link to="/casino/seamless" className="text-casino-thunder-green underline">Seamless API Documentation</Link> page.
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Logs</CardTitle>
                <CardDescription>
                  Monitor and analyze game transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PPTransactionLogger />
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
                  
                  <h3 className="text-lg font-semibold mt-4">Integrated Providers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    {providers.map(provider => (
                      <Card key={provider.id} className="bg-slate-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{provider.name}</CardTitle>
                          <CardDescription>Provider Code: {provider.code}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">Status: <span className="text-green-400">Integrated</span></p>
                          <p className="text-sm mt-1">Currency: EUR</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-semibold mt-6">Available Providers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    {additionalProviders.map(provider => (
                      <Card key={provider.id} className="bg-slate-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{provider.name}</CardTitle>
                          <CardDescription>Provider Code: {provider.code}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">Status: <span className="text-yellow-400">Not Integrated</span></p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Alert className="mt-4 bg-yellow-500/10 text-yellow-500 border-yellow-500/50">
                    <AlertDescription>
                      <p className="text-yellow-500">
                        Note: In a production environment, these settings would be managed securely in a server-side database and not exposed in the client-side application.
                      </p>
                    </AlertDescription>
                  </Alert>
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

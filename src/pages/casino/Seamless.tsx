import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pragmaticPlayService, PPWalletCallback } from "@/services/pragmaticPlayService";
import { pragmaticPlayTransactionHandler } from "@/services/providers/pragmaticPlayTransactionHandler";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, HelpCircle, Copy, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getProviderConfig } from "@/config/gameProviders";

// Get configuration for demonstration
const ppConfig = getProviderConfig('ppeur');

/**
 * This component demonstrates how a seamless wallet integration works with Pragmatic Play.
 * In a real implementation, this would be a server-side endpoint.
 */
const Seamless = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("logs");
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [integrationStatus, setIntegrationStatus] = useState<'ok' | 'warning' | 'error'>('ok');
  
  useEffect(() => {
    // This is purely for demonstration purposes
    setLogs([
      "Seamless wallet integration endpoint for Pragmatic Play",
      "In a real implementation, this would be a server-side API endpoint",
      "PP will send POST requests to this endpoint to debit/credit player wallets",
      "",
      "Example request from PP:",
      JSON.stringify({
        agentid: ppConfig?.credentials.agentId || "captaingambleEUR",
        playerid: "player123",
        amount: 5.00,
        type: "debit",
        trxid: "trx_123456",
        roundid: "round_789012"
      }, null, 2),
      "",
      "Example response:",
      JSON.stringify({
        errorcode: "0",
        balance: 95.00
      }, null, 2)
    ]);
    
    // Mock transactions for demonstration
    setTransactions([
      {
        id: "trx_123456",
        playerId: "player123",
        type: "debit",
        amount: 5.00,
        gameId: "vs20bonzanza",
        roundId: "round_789012",
        status: "completed",
        timestamp: new Date().toISOString()
      },
      {
        id: "trx_123457",
        playerId: "player123",
        type: "credit",
        amount: 10.50,
        gameId: "vs20doghouse",
        roundId: "round_789013",
        status: "completed",
        timestamp: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: "trx_123458",
        playerId: "player456",
        type: "debit",
        amount: 25.00,
        gameId: "vs10wolfgold",
        roundId: "round_789014",
        status: "completed",
        timestamp: new Date(Date.now() - 600000).toISOString()
      }
    ]);
    
    // Verify integration status
    checkIntegrationStatus();
  }, []);

  const checkIntegrationStatus = async () => {
    try {
      if (!ppConfig) {
        setIntegrationStatus('error');
        addLog("ERROR: Pragmatic Play configuration not found");
        return;
      }
      
      const isValid = await pragmaticPlayService.verifyIntegration(ppConfig);
      if (isValid) {
        setIntegrationStatus('ok');
        addLog("Integration status: OK");
      } else {
        setIntegrationStatus('warning');
        addLog("Integration status: WARNING - Some parameters might be incorrect");
      }
    } catch (error) {
      setIntegrationStatus('error');
      addLog("ERROR: Failed to verify integration");
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toISOString()}] ${message}`, ...prev]);
  };

  const toggleCollapsible = (id: string) => {
    if (openCollapsible === id) {
      setOpenCollapsible(null);
    } else {
      setOpenCollapsible(id);
    }
  };

  // Consolidated copy and refresh functions
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard");
    
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const refreshData = () => {
    // In a real implementation, this would fetch the latest data
    toast.success("Data refreshed");
    
    // Add a new log entry
    const newLog = `Endpoint accessed, refreshing data...`;
    addLog(newLog);
    
    // Verify integration status
    checkIntegrationStatus();
  };

  const simulateTransaction = async () => {
    // Generate a mock transaction for testing
    const mockTransaction: PPWalletCallback = {
      agentid: ppConfig?.credentials.agentId || "captaingambleEUR",
      playerid: "test_player",
      amount: 10.00,
      type: Math.random() > 0.5 ? 'debit' : 'credit',
      trxid: `test_${Date.now()}`,
      roundid: `round_${Math.floor(Math.random() * 1000000)}`
    };
    
    // Log the request
    addLog(`Simulating transaction: ${mockTransaction.type} of ${mockTransaction.amount} for player ${mockTransaction.playerid}`);
    
    try {
      // Process the transaction
      if (!ppConfig) {
        throw new Error("PP configuration not found");
      }
      
      const response = await pragmaticPlayTransactionHandler.processTransaction(
        ppConfig, 
        mockTransaction
      );
      
      // Log the response
      addLog(`Transaction response: ${JSON.stringify(response)}`);
      
      // Add to transactions list
      const newTransaction = {
        id: mockTransaction.trxid,
        playerId: mockTransaction.playerid,
        type: mockTransaction.type,
        amount: mockTransaction.amount,
        gameId: "vs20bonzanza",
        roundId: mockTransaction.roundid,
        status: response.errorcode === "0" ? "completed" : "failed",
        timestamp: new Date().toISOString()
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      toast.success("Transaction simulated successfully");
    } catch (error: any) {
      addLog(`ERROR: ${error.message || "Unknown error"}`);
      toast.error(`Failed to simulate transaction: ${error.message || "Unknown error"}`);
    }
  };

  // Rest of the component remains the same
  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pragmatic Play Seamless API</h1>
          <p className="text-white/70">Live wallet integration endpoint for Pragmatic Play games</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={simulateTransaction}>
            Simulate Transaction
          </Button>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      <Card className="bg-slate-900 border-slate-800 mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>API Endpoint</CardTitle>
            <CardDescription>
              This is the callback URL for the Pragmatic Play integration
            </CardDescription>
          </div>
          <Badge className={
            integrationStatus === 'ok' ? "bg-green-500" : 
            integrationStatus === 'warning' ? "bg-yellow-500" : 
            "bg-red-500"
          }>
            {integrationStatus === 'ok' ? "OK" : 
             integrationStatus === 'warning' ? "Warning" : 
             "Error"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-800 p-3 rounded-md flex justify-between items-center">
            <code className="text-sm">{window.location.origin}/api/seamless/pragmatic</code>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleCopy(`${window.location.origin}/api/seamless/pragmatic`, "endpoint")}
            >
              {copied === "endpoint" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-white/60 mt-2">
            This endpoint should be registered in your Pragmatic Play integration dashboard.
          </p>
        </CardContent>
      </Card>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="logs">API Logs</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs">
          <div className="bg-slate-950 p-4 rounded-md border border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-mono text-sm text-white">API Logs</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLogs([])}
              >
                Clear
              </Button>
            </div>
            <pre className="text-white font-mono text-xs whitespace-pre-wrap overflow-auto max-h-80">
              {logs.join('\n')}
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions">
          <div className="bg-slate-950 p-4 rounded-md border border-slate-800">
            <h3 className="font-mono text-sm text-white mb-2">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-2">Transaction ID</th>
                    <th className="text-left p-2">Player</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Game</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="border-b border-slate-800">
                      <td className="p-2 font-mono text-xs">{transaction.id}</td>
                      <td className="p-2">{transaction.playerId}</td>
                      <td className="p-2">
                        <Badge className={transaction.type === 'debit' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="p-2">{transaction.amount.toFixed(2)} EUR</td>
                      <td className="p-2">{transaction.gameId}</td>
                      <td className="p-2">
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="p-2">{new Date(transaction.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="docs">
          <div className="bg-slate-950 p-4 rounded-md border border-slate-800">
            <h3 className="font-mono text-sm text-white mb-4">Integration Documentation</h3>
            <div className="space-y-4 text-sm">
              <Collapsible 
                open={openCollapsible === "endpoint"} 
                onOpenChange={() => toggleCollapsible("endpoint")}
                className="border border-slate-800 rounded-md overflow-hidden"
              >
                <CollapsibleTrigger asChild>
                  <div className="bg-slate-900 p-3 flex justify-between items-center cursor-pointer hover:bg-slate-800">
                    <h4 className="font-semibold">Endpoint</h4>
                    {openCollapsible === "endpoint" ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-3 bg-slate-900 border-t border-slate-800">
                  <p className="mb-2">This is the callback URL that should be registered with Pragmatic Play:</p>
                  <div className="bg-slate-800 p-2 rounded font-mono text-xs flex justify-between items-center">
                    <span>{window.location.origin}/api/seamless/pragmatic</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleCopy(`${window.location.origin}/api/seamless/pragmatic`, "docEndpoint")}
                    >
                      {copied === "docEndpoint" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible 
                open={openCollapsible === "request"} 
                onOpenChange={() => toggleCollapsible("request")}
                className="border border-slate-800 rounded-md overflow-hidden"
              >
                <CollapsibleTrigger asChild>
                  <div className="bg-slate-900 p-3 flex justify-between items-center cursor-pointer hover:bg-slate-800">
                    <h4 className="font-semibold">Request Format</h4>
                    {openCollapsible === "request" ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-3 bg-slate-900 border-t border-slate-800">
                  <p className="mb-2">The request from Pragmatic Play will be in this format:</p>
                  <pre className="bg-slate-800 p-2 rounded font-mono text-xs overflow-auto">
{`{
  "agentid": "captaingambleEUR",
  "playerid": "string",
  "amount": number,
  "type": "debit" | "credit",
  "trxid": "string",
  "roundid": "string",
  "gameref": "string"
}`}
                  </pre>
                  
                  <p className="mt-3 mb-2">Example request:</p>
                  <pre className="bg-slate-800 p-2 rounded font-mono text-xs overflow-auto">
{`{
  "agentid": "captaingambleEUR",
  "playerid": "player123",
  "amount": 5.00,
  "type": "debit",
  "trxid": "trx_123456",
  "roundid": "round_789012",
  "gameref": "vs20bonzanza"
}`}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible 
                open={openCollapsible === "response"} 
                onOpenChange={() => toggleCollapsible("response")}
                className="border border-slate-800 rounded-md overflow-hidden"
              >
                <CollapsibleTrigger asChild>
                  <div className="bg-slate-900 p-3 flex justify-between items-center cursor-pointer hover:bg-slate-800">
                    <h4 className="font-semibold">Response Format</h4>
                    {openCollapsible === "response" ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-3 bg-slate-900 border-t border-slate-800">
                  <p className="mb-2">Your service must respond with this format:</p>
                  <pre className="bg-slate-800 p-2 rounded font-mono text-xs overflow-auto">
{`{
  "errorcode": "0" | "1" | "2" | "3",
  "balance": number
}`}
                  </pre>
                  
                  <p className="mt-3 mb-2">Example successful response:</p>
                  <pre className="bg-slate-800 p-2 rounded font-mono text-xs overflow-auto">
{`{
  "errorcode": "0",
  "balance": 95.00
}`}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible 
                open={openCollapsible === "errors"} 
                onOpenChange={() => toggleCollapsible("errors")}
                className="border border-slate-800 rounded-md overflow-hidden"
              >
                <CollapsibleTrigger asChild>
                  <div className="bg-slate-900 p-3 flex justify-between items-center cursor-pointer hover:bg-slate-800">
                    <h4 className="font-semibold">Error Codes</h4>
                    {openCollapsible === "errors" ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-3 bg-slate-900 border-t border-slate-800">
                  <p className="mb-2">These are the error codes that should be returned:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><span className="font-mono">0</span> - Success</li>
                    <li><span className="font-mono">1</span> - General Error</li>
                    <li><span className="font-mono">2</span> - Invalid Transaction</li>
                    <li><span className="font-mono">3</span> - Insufficient Balance</li>
                  </ul>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible 
                open={openCollapsible === "flow"} 
                onOpenChange={() => toggleCollapsible("flow")}
                className="border border-slate-800 rounded-md overflow-hidden"
              >
                <CollapsibleTrigger asChild>
                  <div className="bg-slate-900 p-3 flex justify-between items-center cursor-pointer hover:bg-slate-800">
                    <h4 className="font-semibold">Transaction Flow</h4>
                    {openCollapsible === "flow" ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-3 bg-slate-900 border-t border-slate-800">
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Player launches a game</li>
                    <li>When player places a bet, PP sends a <code>debit</code> request</li>
                    <li>Your system deducts the amount from the player's balance</li>
                    <li>When the player wins, PP sends a <code>credit</code> request</li>
                    <li>Your system adds the win amount to the player's balance</li>
                  </ol>
                  
                  <div className="mt-3 p-2 bg-blue-900/20 border border-blue-800/30 rounded-md flex items-start">
                    <HelpCircle className="text-blue-400 h-5 w-5 mr-2 mt-0.5" />
                    <p className="text-xs text-blue-300">
                      Requests are idempotent, meaning if PP sends the same transaction ID multiple times, 
                      it should be processed only once and return the same response.
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="testing">
          <div className="bg-slate-950 p-4 rounded-md border border-slate-800">
            <h3 className="font-mono text-sm text-white mb-4">Test Your Integration</h3>
            <p className="text-sm mb-4">
              You can test your integration by using our testing tool or sending direct requests to the endpoint.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">cURL Example</CardTitle>
                  <CardDescription>Use this to test from terminal</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-800 p-2 rounded font-mono text-xs overflow-auto">
{`curl -X POST ${window.location.origin}/api/seamless/pragmatic \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentid": "captaingambleEUR",
    "playerid": "player123",
    "amount": 5.00,
    "type": "debit",
    "trxid": "test_123",
    "roundid": "round_123",
    "gameref": "vs20bonzanza"
  }'`}
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleCopy(`curl -X POST ${window.location.origin}/api/seamless/pragmatic \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentid": "captaingambleEUR",
    "playerid": "player123",
    "amount": 5.00,
    "type": "debit",
    "trxid": "test_123",
    "roundid": "round_123",
    "gameref": "vs20bonzanza"
  }'`, "curl")}
                  >
                    {copied === "curl" ? (
                      <><Check className="h-4 w-4 mr-1" /> Copied</>
                    ) : (
                      <><Copy className="h-4 w-4 mr-1" /> Copy cURL</>
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Postman Example</CardTitle>
                  <CardDescription>Use this with Postman</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">Configuration:</p>
                  <ul className="text-xs space-y-1">
                    <li>• <strong>Method:</strong> POST</li>
                    <li>• <strong>URL:</strong> {window.location.origin}/api/seamless/pragmatic</li>
                    <li>• <strong>Headers:</strong> Content-Type: application/json</li>
                    <li>• <strong>Body:</strong> Raw JSON (see cURL example)</li>
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 w-full"
                    onClick={() => handleCopy(`${window.location.origin}/api/seamless/pragmatic`, "postman")}
                  >
                    {copied === "postman" ? (
                      <><Check className="h-4 w-4 mr-1" /> Copied</>
                    ) : (
                      <><Copy className="h-4 w-4 mr-1" /> Copy API URL</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Seamless;


import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { gitSlotParkService, GSPWalletCallback, GSPWalletResponse } from "@/services/gitSlotParkService";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * This component demonstrates how a seamless wallet integration works with GitSlotPark.
 * In a real implementation, this would be a server-side endpoint.
 */
const GitSlotParkSeamless = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("logs");
  const [testResponse, setTestResponse] = useState<GSPWalletResponse | null>(null);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };
  
  useEffect(() => {
    // Initialize logs
    setLogs([
      "Seamless wallet integration endpoint for GitSlotPark",
      "In a real implementation, this would be a server-side API endpoint",
      "GitSlotPark will send POST requests to this endpoint to perform wallet operations"
    ]);
    
    // Mock transactions for demonstration
    setTransactions([
      {
        id: "474e1a293c2f4e7ab122c52d68423fcb",
        playerId: "Player01",
        type: "Withdraw",
        amount: 12.30,
        gameId: "2001",
        roundId: "ab9c15f2efdd46278e4a56b303127234",
        status: "completed",
        timestamp: new Date().toISOString()
      },
      {
        id: "7d8f2b3a9c5e6f1d2a8b7c6d5e4f3a2b",
        playerId: "Player01",
        type: "Deposit",
        amount: 25.50,
        gameId: "2003",
        roundId: "ef7g8h9i0j1k2l3m4n5o6p7q8r9s0t1",
        status: "completed",
        timestamp: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
        playerId: "Player02",
        type: "RollbackTransaction",
        amount: 5.00,
        gameId: "2005",
        roundId: "ab1cd2ef3gh4ij5kl6mn7op8qr9st0uv",
        status: "completed",
        timestamp: new Date(Date.now() - 600000).toISOString()
      }
    ]);
  }, []);

  // Test different wallet operations
  const testOperation = async (operationType: string) => {
    setTestResponse(null);
    
    let testRequest: GSPWalletCallback;
    let mockSign = "475D834ACC3AB61D7DF4EA42751C6275387BC1787A098D2D0E091698D9BF2043"; // Simplified
    
    switch (operationType) {
      case "GetBalance":
        testRequest = {
          agentID: "Partner01",
          userID: "Player01",
          type: "GetBalance",
          sign: mockSign
        };
        break;
        
      case "Withdraw":
        testRequest = {
          agentID: "Partner01",
          userID: "Player01",
          amount: 12.30,
          transactionID: "474e1a293c2f4e7ab122c52d68423fcb",
          roundID: "ab9c15f2efdd46278e4a56b303127234",
          gameID: 2001,
          type: "Withdraw",
          sign: mockSign
        };
        break;
        
      case "Deposit":
        testRequest = {
          agentID: "Partner01",
          userID: "Player01",
          amount: 25.50,
          transactionID: "2f489d44b61f4650af780ab4c28a7745",
          refTransactionID: "474e1a293c2f4e7ab122c52d68423fcb",
          roundID: "ab9c15f2efdd46278e4a56b303127234",
          gameID: 2001,
          type: "Deposit",
          sign: mockSign
        };
        break;
        
      case "RollbackTransaction":
        testRequest = {
          agentID: "Partner01",
          userID: "Player01",
          refTransactionID: "474e1a293c2f4e7ab122c52d68423fcb",
          gameID: 2001,
          type: "RollbackTransaction",
          sign: mockSign
        };
        break;
        
      default:
        addLog(`Unknown operation type: ${operationType}`);
        return;
    }
    
    try {
      // Log the request
      addLog(`Testing ${operationType} operation:`);
      addLog(JSON.stringify(testRequest, null, 2));
      
      // Process the request
      const response = await gitSlotParkService.processWalletCallback(testRequest);
      
      // Log the response
      addLog(`Response:`);
      addLog(JSON.stringify(response, null, 2));
      setTestResponse(response);
      
      // Add to transactions if successful
      if (response.code === 0 && operationType !== "GetBalance") {
        const newTransaction = {
          id: testRequest.transactionID || `test-${Date.now()}`,
          playerId: testRequest.userID,
          type: operationType,
          amount: testRequest.amount || 0,
          gameId: testRequest.gameID,
          roundId: testRequest.roundID || "N/A",
          status: "completed",
          timestamp: new Date().toISOString()
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
      }
    } catch (error: any) {
      addLog(`Error processing request: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>GitSlotPark Seamless Wallet Integration</CardTitle>
          <CardDescription>
            This page demonstrates how the seamless wallet integration with GitSlotPark works.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="logs">API Logs</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="test">Test Operations</TabsTrigger>
              <TabsTrigger value="docs">Documentation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="logs">
              <div className="bg-slate-950 p-4 rounded-md border border-slate-800">
                <h3 className="font-mono text-sm text-white mb-2">API Logs</h3>
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
                            <Badge className={
                              transaction.type === 'Withdraw' 
                                ? 'bg-red-500/20 text-red-400'
                                : transaction.type === 'Deposit'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                            }>
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
            
            <TabsContent value="test">
              <div className="bg-slate-950 p-4 rounded-md border border-slate-800">
                <h3 className="font-mono text-sm text-white mb-2">Test Wallet Operations</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Button 
                    onClick={() => testOperation("GetBalance")}
                    variant="outline"
                    size="sm"
                  >
                    Test GetBalance
                  </Button>
                  <Button 
                    onClick={() => testOperation("Withdraw")}
                    variant="outline"
                    size="sm"
                  >
                    Test Withdraw (Bet)
                  </Button>
                  <Button 
                    onClick={() => testOperation("Deposit")}
                    variant="outline"
                    size="sm"
                  >
                    Test Deposit (Win)
                  </Button>
                  <Button 
                    onClick={() => testOperation("RollbackTransaction")}
                    variant="outline"
                    size="sm"
                  >
                    Test Rollback
                  </Button>
                </div>
                
                {testResponse && (
                  <Alert className={testResponse.code === 0 ? "bg-green-950/20" : "bg-red-950/20"}>
                    <AlertDescription>
                      <div className="mt-2">
                        <p className="font-semibold">Response:</p>
                        <pre className="text-xs mt-1 bg-slate-900 p-2 rounded">{JSON.stringify(testResponse, null, 2)}</pre>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="docs">
              <div className="bg-slate-950 p-4 rounded-md border border-slate-800">
                <h3 className="font-mono text-sm text-white mb-2">Integration Documentation</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">Endpoint</h4>
                    <p className="font-mono bg-slate-900 p-2 rounded">https://yoursite.com/casino/gitslotpark-seamless</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Sign Calculation</h4>
                    <p>HMAC-SHA-256 is used with the secret key.</p>
                    <pre className="bg-slate-900 p-2 rounded font-mono text-xs">
{`// Example for withdrawal transaction
const message = "Partner01Player0112.30474e1a293c2f4e7ab122c52d68423fcbab9c15f2efdd46278e4a56b303127234";
const secretKey = "1234567890";
const sign = generateSign(secretKey, message);
// Result: 475D834ACC3AB61D7DF4EA42751C6275387BC1787A098D2D0E091698D9BF2043`}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Available Operations</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>GetBalance - Retrieves player balance</li>
                      <li>Withdraw - Deducts funds from player's balance (betting)</li>
                      <li>Deposit - Adds funds to player's balance (winning)</li>
                      <li>BetWin - Processes a combined bet and win</li>
                      <li>RollbackTransaction - Rolls back a previous transaction</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Response Format</h4>
                    <pre className="bg-slate-900 p-2 rounded font-mono text-xs">
{`{
  "code": 0,   // Result code (0 = success)
  "balance": 100.00,  // Player's current balance
  "message": "Optional error message", // Only present on error
  "platformTransactionID": "generated-transaction-id" // Your system's transaction ID
}`}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Result Codes</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><span className="font-mono">0</span> - Success</li>
                      <li><span className="font-mono">1</span> - General error</li>
                      <li><span className="font-mono">2</span> - Wrong input parameters</li>
                      <li><span className="font-mono">3</span> - Invalid Sign</li>
                      <li><span className="font-mono">4</span> - Invalid Agent</li>
                      <li><span className="font-mono">5</span> - User ID not found</li>
                      <li><span className="font-mono">6</span> - Insufficient funds</li>
                      <li><span className="font-mono">8</span> - Could not find reference transaction id</li>
                      <li><span className="font-mono">9</span> - Transaction is already rolled back</li>
                      <li><span className="font-mono">11</span> - Duplicate transaction</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GitSlotParkSeamless;

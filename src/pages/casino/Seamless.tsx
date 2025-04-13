
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pragmaticPlayService } from "@/services/pragmaticPlayService";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * This component demonstrates how a seamless wallet integration works with Pragmatic Play.
 * In a real implementation, this would be a server-side endpoint.
 */
const Seamless = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("logs");
  
  useEffect(() => {
    // This is purely for demonstration purposes
    setLogs([
      "Seamless wallet integration endpoint for Pragmatic Play",
      "In a real implementation, this would be a server-side API endpoint",
      "PP will send POST requests to this endpoint to debit/credit player wallets",
      "",
      "Example request from PP:",
      JSON.stringify({
        agentid: "captaingambleEUR",
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
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Pragmatic Play Seamless Wallet Integration</CardTitle>
          <CardDescription>
            This page demonstrates how the seamless wallet integration with Pragmatic Play works.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="logs">API Logs</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
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
                <h3 className="font-mono text-sm text-white mb-2">Integration Documentation</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">Endpoint</h4>
                    <p className="font-mono bg-slate-900 p-2 rounded">https://yoursite.com/casino/seamless</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Request Format</h4>
                    <pre className="bg-slate-900 p-2 rounded font-mono text-xs">
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
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Response Format</h4>
                    <pre className="bg-slate-900 p-2 rounded font-mono text-xs">
{`{
  "errorcode": "0" | "1" | "2" | "3",
  "balance": number
}`}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Error Codes</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><span className="font-mono">0</span> - Success</li>
                      <li><span className="font-mono">1</span> - General Error</li>
                      <li><span className="font-mono">2</span> - Invalid Transaction</li>
                      <li><span className="font-mono">3</span> - Insufficient Balance</li>
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

export default Seamless;

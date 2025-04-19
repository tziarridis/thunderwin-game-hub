
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Database, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * This component demonstrates how a seamless wallet integration works.
 * In a real implementation, this would be a server-side endpoint.
 */
const Seamless = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("logs");
  
  useEffect(() => {
    // This is purely for demonstration purposes
    setLogs([
      "Seamless wallet integration endpoints for game providers",
      "In a real implementation, these would be server-side API endpoints",
      "Game providers will send POST requests to these endpoints to debit/credit player wallets",
      "",
      "Example Pragmatic Play request:",
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
      }, null, 2),
      "",
      "Example GitSlotPark request:",
      JSON.stringify({
        agentID: "Partner01",
        sign: "5E0A0349AE36AD67CD21D891AB124CCE8CC4171C5BD7EF5B26FCA86DB71F500A",
        userID: "Player01",
        amount: 3.40,
        transactionID: "2f489d44b61f4650af780ab4c28a7745",
        roundID: "307e9124a5314f2795ce583391e1c61c",
        gameID: 2001
      }, null, 2),
      "",
      "Example response:",
      JSON.stringify({
        code: 0,
        message: "",
        platformTransactionID: "474e1a293c2f4e7ab122c52d68423fcb",
        balance: 100
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
        timestamp: new Date().toISOString(),
        provider: "Pragmatic Play"
      },
      {
        id: "trx_123457",
        playerId: "player123",
        type: "credit",
        amount: 10.50,
        gameId: "vs20doghouse",
        roundId: "round_789013",
        status: "completed",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        provider: "Pragmatic Play"
      },
      {
        id: "2f489d44b61f4650af780ab4c28a7745",
        playerId: "Player01",
        type: "debit",
        amount: 3.40,
        gameId: "2001",
        roundId: "307e9124a5314f2795ce583391e1c61c",
        status: "completed",
        timestamp: new Date(Date.now() - 150000).toISOString(),
        provider: "GitSlotPark"
      },
      {
        id: "3f589e55b71f5760af890ab5c39a8856",
        playerId: "Player01",
        type: "credit",
        amount: 7.80,
        gameId: "2001",
        roundId: "307e9124a5314f2795ce583391e1c61c",
        status: "completed",
        timestamp: new Date(Date.now() - 120000).toISOString(),
        provider: "GitSlotPark"
      }
    ]);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Seamless Wallet Integration</CardTitle>
          <CardDescription>
            This page demonstrates how the seamless wallet integration with game providers works.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="logs">API Logs</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="pp-docs">Pragmatic Play</TabsTrigger>
              <TabsTrigger value="gsp-docs">GitSlotPark</TabsTrigger>
            </TabsList>
            
            <TabsContent value="logs">
              <div className="bg-slate-950 p-4 rounded-md border border-slate-800">
                <h3 className="font-mono text-sm text-white mb-2">API Logs</h3>
                <pre className="text-white font-mono text-xs whitespace-pre-wrap overflow-auto max-h-80">
                  {logs.join('\n')}
                </pre>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Link to="/casino/gitslotpark-seamless">
                  <Button variant="outline" size="sm">
                    <Database className="mr-2 h-4 w-4" />
                    Test GitSlotPark Wallet
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
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
                        <th className="text-left p-2">Provider</th>
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
                            <Badge variant="outline">
                              {transaction.provider}
                            </Badge>
                          </td>
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
            
            <TabsContent value="pp-docs">
              <div className="bg-slate-950 p-4 rounded-md border border-slate-800">
                <h3 className="font-mono text-sm text-white mb-2">Pragmatic Play Integration</h3>
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
            
            <TabsContent value="gsp-docs">
              <div className="bg-slate-950 p-4 rounded-md border border-slate-800">
                <h3 className="font-mono text-sm text-white mb-2">GitSlotPark Integration Documentation</h3>
                <div className="space-y-6 text-sm">
                  {/* Withdraw Endpoint */}
                  <div>
                    <h4 className="font-semibold mb-1 text-base">Withdraw Endpoint (Bet)</h4>
                    <p className="text-white/70 mb-2">
                      Called when the User places a bet (debit). Licensee is expected to decrease player's balance by amount and return new balance.
                    </p>
                    
                    <div className="mt-2">
                      <h5 className="font-semibold text-sm mb-1">Endpoint</h5>
                      <p className="font-mono bg-slate-900 p-2 rounded">POST /Withdraw</p>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="font-semibold text-sm mb-1">Request Parameters</h5>
                      <table className="w-full text-xs bg-slate-900 rounded-md overflow-hidden">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-800">
                            <th className="p-2 text-left">Parameter</th>
                            <th className="p-2 text-left">Description</th>
                            <th className="p-2 text-left">Format</th>
                            <th className="p-2 text-left">Example</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">agentID</td>
                            <td className="p-2">ID of agent</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">Partner01</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">sign</td>
                            <td className="p-2">Security signature</td>
                            <td className="p-2">string (64)</td>
                            <td className="p-2 font-mono">5E0A0349A...</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">userID</td>
                            <td className="p-2">Identity name of user</td>
                            <td className="p-2">string (48)</td>
                            <td className="p-2 font-mono">Player01</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">amount</td>
                            <td className="p-2">Transaction amount</td>
                            <td className="p-2">decimal</td>
                            <td className="p-2">0.1</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">transactionID</td>
                            <td className="p-2">Unique transaction ID</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">4146ed8d...</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">roundID</td>
                            <td className="p-2">Game round ID</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">307e9124...</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">gameID</td>
                            <td className="p-2">Game Identifier</td>
                            <td className="p-2">integer</td>
                            <td className="p-2">2001</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono">freeSpinID</td>
                            <td className="p-2">Free Spin ID (optional)</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">freespin001</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="font-semibold text-sm mb-1">Response Parameters</h5>
                      <table className="w-full text-xs bg-slate-900 rounded-md overflow-hidden">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-800">
                            <th className="p-2 text-left">Parameter</th>
                            <th className="p-2 text-left">Description</th>
                            <th className="p-2 text-left">Format</th>
                            <th className="p-2 text-left">Example</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">code</td>
                            <td className="p-2">Result code</td>
                            <td className="p-2">integer</td>
                            <td className="p-2">0</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">message</td>
                            <td className="p-2">Error description</td>
                            <td className="p-2">string (256)</td>
                            <td className="p-2">""</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">platformTransactionID</td>
                            <td className="p-2">Platform's transaction ID</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">d2583e27...</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono">balance</td>
                            <td className="p-2">New balance</td>
                            <td className="p-2">decimal</td>
                            <td className="p-2">22981.77</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Deposit Endpoint */}
                  <div>
                    <h4 className="font-semibold mb-1 text-base">Deposit Endpoint (Win)</h4>
                    <p className="text-white/70 mb-2">
                      Called when the User wins. Licensee is expected to increase player's balance by amount and return new balance.
                    </p>
                    
                    <div className="mt-2">
                      <h5 className="font-semibold text-sm mb-1">Endpoint</h5>
                      <p className="font-mono bg-slate-900 p-2 rounded">POST /Deposit</p>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="font-semibold text-sm mb-1">Request Parameters</h5>
                      <table className="w-full text-xs bg-slate-900 rounded-md overflow-hidden">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-800">
                            <th className="p-2 text-left">Parameter</th>
                            <th className="p-2 text-left">Description</th>
                            <th className="p-2 text-left">Format</th>
                            <th className="p-2 text-left">Example</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">agentID</td>
                            <td className="p-2">ID of agent</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">Partner01</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">sign</td>
                            <td className="p-2">Security signature</td>
                            <td className="p-2">string (64)</td>
                            <td className="p-2 font-mono">5E0A0349A...</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">userID</td>
                            <td className="p-2">Identity name of user</td>
                            <td className="p-2">string (48)</td>
                            <td className="p-2 font-mono">Player01</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">amount</td>
                            <td className="p-2">Transaction amount</td>
                            <td className="p-2">decimal</td>
                            <td className="p-2">3.40</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">refTransactionID</td>
                            <td className="p-2">Referenced bet transaction ID</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">4146ed8d...</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">transactionID</td>
                            <td className="p-2">Unique transaction ID</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">2f489d44...</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">roundID</td>
                            <td className="p-2">Game round ID</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">307e9124...</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">gameID</td>
                            <td className="p-2">Game Identifier</td>
                            <td className="p-2">integer</td>
                            <td className="p-2">2001</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono">freeSpinID</td>
                            <td className="p-2">Free Spin ID (optional)</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">freespin001</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="font-semibold text-sm mb-1">Response Parameters</h5>
                      <table className="w-full text-xs bg-slate-900 rounded-md overflow-hidden">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-800">
                            <th className="p-2 text-left">Parameter</th>
                            <th className="p-2 text-left">Description</th>
                            <th className="p-2 text-left">Format</th>
                            <th className="p-2 text-left">Example</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">code</td>
                            <td className="p-2">Result code</td>
                            <td className="p-2">integer</td>
                            <td className="p-2">0</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">message</td>
                            <td className="p-2">Error description</td>
                            <td className="p-2">string (256)</td>
                            <td className="p-2">""</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">platformTransactionID</td>
                            <td className="p-2">Platform's transaction ID</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">474e1a29...</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono">balance</td>
                            <td className="p-2">New balance</td>
                            <td className="p-2">decimal</td>
                            <td className="p-2">100</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Rollback Endpoint */}
                  <div>
                    <h4 className="font-semibold mb-1 text-base">Rollback Endpoint</h4>
                    <p className="text-white/70 mb-2">
                      Called when there is need to roll back the effect of the referenced transaction.
                    </p>
                    
                    <div className="mt-2">
                      <h5 className="font-semibold text-sm mb-1">Endpoint</h5>
                      <p className="font-mono bg-slate-900 p-2 rounded">POST /RollbackTransaction</p>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="font-semibold text-sm mb-1">Request Parameters</h5>
                      <table className="w-full text-xs bg-slate-900 rounded-md overflow-hidden">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-800">
                            <th className="p-2 text-left">Parameter</th>
                            <th className="p-2 text-left">Description</th>
                            <th className="p-2 text-left">Format</th>
                            <th className="p-2 text-left">Example</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">agentID</td>
                            <td className="p-2">ID of agent</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">Partner01</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">sign</td>
                            <td className="p-2">Security signature</td>
                            <td className="p-2">string (64)</td>
                            <td className="p-2 font-mono">71252304A...</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">userID</td>
                            <td className="p-2">User Identifier</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">Player01</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">refTransactionID</td>
                            <td className="p-2">Reference transaction ID to rollback</td>
                            <td className="p-2">string</td>
                            <td className="p-2 font-mono">4146ed8d...</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono">gameID</td>
                            <td className="p-2">Game Identifier</td>
                            <td className="p-2">integer</td>
                            <td className="p-2">2001</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="font-semibold text-sm mb-1">Response Parameters</h5>
                      <table className="w-full text-xs bg-slate-900 rounded-md overflow-hidden">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-800">
                            <th className="p-2 text-left">Parameter</th>
                            <th className="p-2 text-left">Description</th>
                            <th className="p-2 text-left">Format</th>
                            <th className="p-2 text-left">Example</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-800">
                            <td className="p-2 font-mono">code</td>
                            <td className="p-2">Result code</td>
                            <td className="p-2">integer</td>
                            <td className="p-2">0</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono">message</td>
                            <td className="p-2">Error description</td>
                            <td className="p-2">string (256)</td>
                            <td className="p-2">""</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Result Codes */}
                  <div>
                    <h4 className="font-semibold mb-2 text-base">Result Codes</h4>
                    <table className="w-full text-xs bg-slate-900 rounded-md overflow-hidden">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-800">
                          <th className="p-2 text-left">Code</th>
                          <th className="p-2 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-800">
                          <td className="p-2 font-mono">0</td>
                          <td className="p-2">Success</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="p-2 font-mono">1</td>
                          <td className="p-2">General Error</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="p-2 font-mono">2</td>
                          <td className="p-2">Invalid Parameter</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="p-2 font-mono">3</td>
                          <td className="p-2">User Not Found</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="p-2 font-mono">4</td>
                          <td className="p-2">Insufficient Funds</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="p-2 font-mono">5</td>
                          <td className="p-2">Transaction Not Found</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="p-2 font-mono">6</td>
                          <td className="p-2">Invalid Sign</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="p-2 font-mono">8</td>
                          <td className="p-2">Transaction Completed</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="p-2 font-mono">9</td>
                          <td className="p-2">Transaction Rolled Back</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="p-2 font-mono">11</td>
                          <td className="p-2">Duplicate Transaction</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">12</td>
                          <td className="p-2">System Error</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <a href="https://documenter.getpostman.com/view/25695248/2sA3Qy7VR4" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Full Documentation
                      </Button>
                    </a>
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


import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowDownUp, RefreshCw, PlusCircle, MinusCircle, RotateCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { seamlessWalletService, Transaction } from "@/services/seamlessWalletService";

const AggregatorSeamless = () => {
  const [playerId, setPlayerId] = useState("player123");
  const [amount, setAmount] = useState(10);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [playerBalance, setPlayerBalance] = useState(0);
  const [activeTab, setActiveTab] = useState("wallet");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlayerData();
  }, [playerId]);

  const loadPlayerData = () => {
    if (!playerId) return;
    
    setLoading(true);
    try {
      // Get player balance
      const balance = seamlessWalletService.getPlayerBalance(playerId);
      setPlayerBalance(balance);
      
      // Get transactions
      const txList = seamlessWalletService.getPlayerTransactions(playerId);
      setTransactions(txList);
    } catch (error) {
      console.error("Error loading player data:", error);
      toast.error("Failed to load player data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = () => {
    if (!playerId || amount <= 0) {
      toast.error("Please enter a valid player ID and amount");
      return;
    }
    
    const success = seamlessWalletService.deposit(playerId, amount);
    if (success) {
      loadPlayerData();
    }
  };

  const handleWithdraw = () => {
    if (!playerId || amount <= 0) {
      toast.error("Please enter a valid player ID and amount");
      return;
    }
    
    const success = seamlessWalletService.withdraw(playerId, amount);
    if (success) {
      loadPlayerData();
    }
  };

  const handleReset = () => {
    if (!playerId) {
      toast.error("Please enter a valid player ID");
      return;
    }
    
    if (confirm("Are you sure you want to reset this wallet? This will clear all transactions and reset the balance.")) {
      seamlessWalletService.resetWallet(playerId);
      loadPlayerData();
      toast.success("Wallet has been reset");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatAmount = (transaction: Transaction) => {
    const amount = transaction.amount.toFixed(2);
    if (transaction.type === "bet" || transaction.type === "rollback") {
      return `-${amount}`;
    } else if (transaction.type === "win" || transaction.type === "refund") {
      return `+${amount}`;
    }
    return amount;
  };

  const getAmountColor = (transaction: Transaction) => {
    if (transaction.type === "bet" || transaction.type === "rollback") {
      return "text-red-400";
    } else if (transaction.type === "win" || transaction.type === "refund") {
      return "text-green-400";
    }
    return "";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Aggregator Seamless Integration</h1>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowDownUp className="mr-2 h-5 w-5" />
              Wallet Management
            </CardTitle>
            <CardDescription>
              Test the seamless wallet integration with the game aggregator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="wallet">Wallet Operations</TabsTrigger>
                <TabsTrigger value="transactions">Transaction History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="wallet">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm mb-1">Player ID</label>
                        <Input 
                          value={playerId} 
                          onChange={e => setPlayerId(e.target.value)}
                          placeholder="Enter player ID"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-1">Amount</label>
                        <Input 
                          type="number" 
                          value={amount} 
                          onChange={e => setAmount(Number(e.target.value))}
                          min={0}
                          step={1}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button onClick={handleDeposit} className="flex-1">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Deposit
                        </Button>
                        <Button onClick={handleWithdraw} className="flex-1">
                          <MinusCircle className="mr-2 h-4 w-4" />
                          Withdraw
                        </Button>
                      </div>
                      
                      <Button onClick={loadPlayerData} variant="outline" className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </Button>
                      
                      <Button onClick={handleReset} variant="outline" className="w-full text-red-500 hover:text-red-600">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Wallet
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-slate-800 p-4 rounded-lg h-full">
                      <h3 className="text-lg font-medium mb-4">Wallet Information</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-400">Player ID</p>
                          <p className="font-mono">{playerId || "Not specified"}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Balance</p>
                          <p className="text-2xl font-bold">${playerBalance.toFixed(2)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Transactions</p>
                          <p>{transactions.length} total</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Last Updated</p>
                          <p>{new Date().toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="transactions">
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium">Transaction History</h3>
                    <Button 
                      onClick={loadPlayerData} 
                      variant="secondary" 
                      size="sm"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                  
                  {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left p-2">ID</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Amount</th>
                            <th className="text-left p-2">Balance After</th>
                            <th className="text-left p-2">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map(tx => (
                            <tr key={tx.id} className="border-b border-slate-700 hover:bg-slate-700">
                              <td className="p-2 font-mono text-xs">{tx.id.substring(0, 8)}</td>
                              <td className="p-2 capitalize">{tx.type}</td>
                              <td className={`p-2 ${getAmountColor(tx)}`}>{formatAmount(tx)}</td>
                              <td className="p-2">${tx.balanceAfter.toFixed(2)}</td>
                              <td className="p-2 text-xs">{formatTimestamp(tx.timestamp)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No transactions found for this player
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Integration Details</CardTitle>
          <CardDescription>
            Information about the seamless wallet integration with the game aggregator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              This page demonstrates the seamless wallet integration with the game aggregator. 
              It provides tools for testing wallet operations and viewing transaction history.
            </p>
            
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Callback Endpoint</h3>
              <code className="block bg-black p-2 rounded text-sm">
                {window.location.origin}/api/seamless/callback
              </code>
              <p className="text-sm text-gray-400 mt-2">
                This endpoint receives wallet operation requests from the game aggregator
              </p>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Game Launch URL</h3>
              <code className="block bg-black p-2 rounded text-sm">
                {window.location.origin}/api/games/launch?gameId=GAME_ID&amp;playerId=PLAYER_ID
              </code>
              <p className="text-sm text-gray-400 mt-2">
                Use this URL format to launch games with the seamless wallet integration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AggregatorSeamless;


import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { seamlessWalletService, Transaction } from "@/services/seamlessWalletService";
import { Loader2, Wallet, ArrowDownToLine, ArrowUpFromLine, RotateCw, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import GameAggregatorWidget from "@/components/games/GameAggregatorWidget";

const AggregatorSeamless = () => {
  const [activeTab, setActiveTab] = useState("wallet");
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const { isAuthenticated, user } = useAuth();
  
  // Use a mock user ID for demo purposes
  const playerId = isAuthenticated ? user?.id || "demo_player" : "demo_player";
  
  useEffect(() => {
    loadWalletData();
  }, [playerId]);
  
  const loadWalletData = () => {
    setLoading(true);
    try {
      // Get player balance
      const playerBalance = seamlessWalletService.getPlayerBalance(playerId);
      setBalance(playerBalance);
      setCurrency("USD"); // Default currency
      
      // Get player transactions
      const playerTransactions = seamlessWalletService.getPlayerTransactions(playerId);
      setTransactions(playerTransactions);
    } catch (error: any) {
      console.error("Error loading wallet data:", error);
      toast.error(error.message || "Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (seamlessWalletService.deposit(playerId, amount, currency)) {
      setDepositAmount("");
      loadWalletData();
    }
  };
  
  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (seamlessWalletService.withdraw(playerId, amount, currency)) {
      setWithdrawAmount("");
      loadWalletData();
    }
  };
  
  const handleResetWallet = () => {
    if (confirm("Are you sure you want to reset your wallet?")) {
      seamlessWalletService.resetWallet(playerId);
      loadWalletData();
    }
  };
  
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'bet':
        return <Badge variant="destructive">Bet</Badge>;
      case 'win':
        return <Badge variant="success" className="bg-green-600 hover:bg-green-700">Win</Badge>;
      case 'rollback':
        return <Badge>Rollback</Badge>;
      case 'refund':
        return <Badge variant="outline">Refund</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };
  
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy h:mm a");
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Game Aggregator Seamless Wallet</h1>
        <Button variant="outline" onClick={loadWalletData}>
          <RotateCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Your Wallet</CardTitle>
              <CardDescription>
                Manage your funds for game play
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 p-4 rounded-md mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-white/70">Current Balance</p>
                    <p className="text-3xl font-bold">{balance.toFixed(2)} {currency}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-white/50" />
                </div>
              </div>
              
              <Tabs defaultValue="deposit">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="deposit" className="flex-1">
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Deposit
                  </TabsTrigger>
                  <TabsTrigger value="withdraw" className="flex-1">
                    <ArrowUpFromLine className="mr-2 h-4 w-4" />
                    Withdraw
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="deposit">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="deposit-amount">Deposit Amount</Label>
                      <div className="flex items-center mt-1">
                        <Input
                          id="deposit-amount"
                          type="number"
                          min="1"
                          step="1"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="bg-slate-700 border-slate-600"
                        />
                        <span className="ml-2">{currency}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleDeposit} 
                      disabled={!depositAmount || loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowDownToLine className="mr-2 h-4 w-4" />
                          Deposit Funds
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="withdraw">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="withdraw-amount">Withdraw Amount</Label>
                      <div className="flex items-center mt-1">
                        <Input
                          id="withdraw-amount"
                          type="number"
                          min="1"
                          max={balance}
                          step="1"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="bg-slate-700 border-slate-600"
                        />
                        <span className="ml-2">{currency}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleWithdraw} 
                      disabled={!withdrawAmount || loading || parseFloat(withdrawAmount) > balance}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowUpFromLine className="mr-2 h-4 w-4" />
                          Withdraw Funds
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-4 pt-4 border-t border-slate-700">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetWallet}
                  className="w-full"
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Reset Wallet (For Testing)
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Alert className="bg-slate-800 border-yellow-600/50">
            <AlertDescription className="text-yellow-400">
              <p className="font-medium">Test Wallet</p>
              <p className="text-sm mt-1">
                This is a simulated wallet for testing the Game Aggregator integration. 
                All transactions are in-memory only and will reset when the page is refreshed.
              </p>
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="wallet">
                <Clock className="mr-2 h-4 w-4" />
                Transaction History
              </TabsTrigger>
              <TabsTrigger value="games">
                <Calendar className="mr-2 h-4 w-4" />
                Game Aggregator
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="wallet">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    Recent transactions from game play and wallet operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-white/70" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-white/70">
                      No transactions yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((tx) => (
                        <div 
                          key={tx.id} 
                          className="p-3 border border-slate-700 rounded-md bg-slate-900 flex justify-between"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              {getTransactionTypeLabel(tx.type)}
                              {tx.gameId && (
                                <span className="text-xs text-white/70">
                                  Game: {tx.gameId}
                                </span>
                              )}
                            </div>
                            <p className="text-sm mt-1">
                              {tx.amount.toFixed(2)} {tx.currency}
                            </p>
                            <p className="text-xs text-white/50 mt-0.5">
                              {formatDateTime(tx.timestamp)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/70">Balance After</p>
                            <p className={`text-sm font-medium ${
                              tx.type === 'win' ? 'text-green-400' : 
                              tx.type === 'bet' ? 'text-red-400' : ''
                            }`}>
                              {tx.balanceAfter.toFixed(2)} {tx.currency}
                            </p>
                            <p className="text-xs mt-1">
                              {tx.status === 'completed' ? (
                                <Badge variant="outline" className="text-green-400 border-green-400">
                                  Completed
                                </Badge>
                              ) : tx.status === 'pending' ? (
                                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                  Pending
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-400 border-red-400">
                                  Failed
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="games">
              <GameAggregatorWidget />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AggregatorSeamless;

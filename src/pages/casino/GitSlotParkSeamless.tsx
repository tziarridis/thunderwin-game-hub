
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, RefreshCw, DollarSign, Plus, Minus, RotateCw, Clock, Copy, Check, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction } from "@/services/transactionService";
import { gitSlotParkService } from "@/services/gitSlotParkService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GitSlotParkSeamless = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [amount, setAmount] = useState("10.00");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("wallet");
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);
  
  const fetchBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const balanceData = await gitSlotParkService.getBalance(
        isAuthenticated ? user?.id || 'guest' : 'guest'
      );
      setBalance(balanceData.balance);
    } catch (error: any) {
      console.error("Error fetching balance:", error);
      toast.error("Failed to fetch balance");
    } finally {
      setIsLoadingBalance(false);
    }
  };
  
  const fetchTransactions = async () => {
    setIsLoadingTx(true);
    try {
      const txData = await gitSlotParkService.getTransactions(
        isAuthenticated ? user?.id || 'guest' : 'guest'
      );
      setTransactions(txData);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setIsLoadingTx(false);
    }
  };
  
  const handleRefresh = () => {
    fetchBalance();
    fetchTransactions();
    toast.success("Data refreshed");
  };
  
  const handleTransaction = async (type: 'credit' | 'debit') => {
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setIsProcessing(true);
    try {
      const amountValue = parseFloat(amount);
      let result;
      
      if (type === 'credit') {
        result = await gitSlotParkService.credit(
          isAuthenticated ? user?.id || 'guest' : 'guest', 
          amountValue
        );
      } else {
        result = await gitSlotParkService.debit(
          isAuthenticated ? user?.id || 'guest' : 'guest', 
          amountValue
        );
      }
      
      if (result.success) {
        toast.success(`${type === 'credit' ? 'Deposit' : 'Withdrawal'} successful!`);
        fetchBalance();
        fetchTransactions();
      } else {
        toast.error(result.message || `${type === 'credit' ? 'Deposit' : 'Withdrawal'} failed!`);
      }
    } catch (error: any) {
      console.error(`Error processing ${type}:`, error);
      toast.error(error.message || `Failed to process ${type}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-600">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard");
    
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };
  
  // Helper function to determine if transaction is a debit/credit type
  const isDebitType = (type: string): boolean => {
    return type === 'bet' || type === 'withdraw' || type === 'debit';
  };

  const isCreditType = (type: string): boolean => {
    return type === 'win' || type === 'deposit' || type === 'credit';
  };
  
  return (
    <div className="container mx-auto px-4 pt-8 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">GitSlotPark Seamless Wallet</h1>
          <p className="text-white/70">Test and manage your seamless wallet integration</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <a href="/api/seamless/gitslotpark" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              View API
            </Button>
          </a>
        </div>
      </div>
      
      <Card className="bg-casino-thunder-dark border-white/10 mb-6">
        <CardHeader>
          <CardTitle>API Endpoint</CardTitle>
          <CardDescription>
            This is the callback URL for the GitSlotPark integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-800 p-3 rounded-md flex justify-between items-center">
            <code className="text-sm">{window.location.origin}/api/seamless/gitslotpark</code>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleCopy(`${window.location.origin}/api/seamless/gitslotpark`, "endpoint")}
            >
              {copied === "endpoint" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-white/60 mt-2">
            This endpoint should be registered in your GitSlotPark integration dashboard.
          </p>
        </CardContent>
      </Card>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="api">API Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wallet">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-full md:col-span-1 bg-casino-thunder-dark border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-casino-thunder-green" />
                  Wallet Balance
                </CardTitle>
                <CardDescription>Current GitSlotPark wallet balance</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBalance ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-casino-thunder-green" />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      €{balance !== null ? balance.toFixed(2) : "0.00"}
                    </div>
                    <p className="text-white/60 text-sm">
                      Player ID: {isAuthenticated ? user?.id || 'guest' : 'guest'}
                    </p>
                  </div>
                )}
                
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (EUR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-casino-thunder-darker border-white/10"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleTransaction('credit')}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Deposit
                    </Button>
                    
                    <Button
                      onClick={() => handleTransaction('debit')}
                      disabled={isProcessing}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Minus className="mr-2 h-4 w-4" />
                      )}
                      Withdraw
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-full md:col-span-2 bg-casino-thunder-dark border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-casino-thunder-green" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Latest GitSlotPark wallet transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTx ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-casino-thunder-green" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    No transactions found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.filter(tx => tx.provider === 'GitSlotPark').slice(0, 5).map((tx) => (
                          <TableRow key={tx.transactionId}>
                            <TableCell className="font-mono text-xs">
                              {tx.transactionId.substring(0, 8)}...
                            </TableCell>
                            <TableCell>
                              <Badge variant={isDebitType(tx.type) ? 'destructive' : 'default'}>
                                {tx.type}
                              </Badge>
                            </TableCell>
                            <TableCell className={isCreditType(tx.type) ? 'text-green-500' : 'text-red-500'}>
                              {isCreditType(tx.type) ? '+' : '-'}€{tx.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(tx.status)}
                            </TableCell>
                            <TableCell className="text-white/60">
                              {formatDateTime(tx.timestamp)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card className="bg-casino-thunder-dark border-white/10">
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                Complete transaction history for GitSlotPark
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTx ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-casino-thunder-green" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  No transactions found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Game</TableHead>
                        <TableHead>Round ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.filter(tx => tx.provider === 'GitSlotPark').map((tx) => (
                        <TableRow key={tx.transactionId}>
                          <TableCell className="font-mono text-xs">
                            {tx.transactionId}
                          </TableCell>
                          <TableCell>{tx.userId}</TableCell>
                          <TableCell>
                            <Badge variant={isDebitType(tx.type) ? 'destructive' : 'default'}>
                              {tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={isCreditType(tx.type) ? 'text-green-500' : 'text-red-500'}>
                            {isCreditType(tx.type) ? '+' : '-'}€{tx.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>{tx.gameId || '-'}</TableCell>
                          <TableCell className="font-mono text-xs">{tx.roundId || '-'}</TableCell>
                          <TableCell>
                            {getStatusBadge(tx.status)}
                          </TableCell>
                          <TableCell className="text-white/60">
                            {formatDateTime(tx.timestamp)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-casino-thunder-dark border-white/10">
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  GitSlotPark API integration details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Callback URL</h3>
                  <div className="bg-slate-800 p-3 rounded-md flex justify-between items-center">
                    <code className="text-sm">{window.location.origin}/api/seamless/gitslotpark</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleCopy(`${window.location.origin}/api/seamless/gitslotpark`, "api-endpoint")}
                    >
                      {copied === "api-endpoint" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Request Format</h3>
                  <pre className="bg-slate-800 p-3 rounded-md text-xs font-mono overflow-auto">
{`{
  "partnerid": "Partner01",
  "userid": "string",
  "amount": number,
  "transactiontype": "bet" | "win",
  "transactionid": "string",
  "roundid": "string",
  "gamecode": "string"
}`}
                  </pre>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Response Format</h3>
                  <pre className="bg-slate-800 p-3 rounded-md text-xs font-mono overflow-auto">
{`{
  "status": "success" | "error",
  "errorcode": 0 | 1 | 2 | 3,
  "balance": number,
  "transactionid": "string"
}`}
                  </pre>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Error Codes</h3>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>0 - No error</li>
                    <li>1 - General error</li>
                    <li>2 - Invalid transaction</li>
                    <li>3 - Insufficient funds</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-casino-thunder-dark border-white/10">
              <CardHeader>
                <CardTitle>Test API</CardTitle>
                <CardDescription>
                  Use these sample requests to test your integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Example Bet Request</h3>
                  <pre className="bg-slate-800 p-3 rounded-md text-xs font-mono overflow-auto">
{`curl -X POST ${window.location.origin}/api/seamless/gitslotpark \\
  -H "Content-Type: application/json" \\
  -d '{
    "partnerid": "Partner01",
    "userid": "player123",
    "amount": 5.00,
    "transactiontype": "bet",
    "transactionid": "gsp_test_123",
    "roundid": "round_456",
    "gamecode": "GSP-FRUIT"
  }'`}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopy(`curl -X POST ${window.location.origin}/api/seamless/gitslotpark \\
  -H "Content-Type: application/json" \\
  -d '{
    "partnerid": "Partner01",
    "userid": "player123",
    "amount": 5.00,
    "transactiontype": "bet",
    "transactionid": "gsp_test_123",
    "roundid": "round_456",
    "gamecode": "GSP-FRUIT"
  }'`, "curl-bet")}
                  >
                    {copied === "curl-bet" ? (
                      <><Check className="mr-2 h-4 w-4" /> Copied</>
                    ) : (
                      <><Copy className="mr-2 h-4 w-4" /> Copy cURL</>
                    )}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Example Win Request</h3>
                  <pre className="bg-slate-800 p-3 rounded-md text-xs font-mono overflow-auto">
{`curl -X POST ${window.location.origin}/api/seamless/gitslotpark \\
  -H "Content-Type: application/json" \\
  -d '{
    "partnerid": "Partner01",
    "userid": "player123",
    "amount": 15.00,
    "transactiontype": "win",
    "transactionid": "gsp_test_win_123",
    "roundid": "round_456",
    "gamecode": "GSP-FRUIT"
  }'`}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopy(`curl -X POST ${window.location.origin}/api/seamless/gitslotpark \\
  -H "Content-Type: application/json" \\
  -d '{
    "partnerid": "Partner01",
    "userid": "player123",
    "amount": 15.00,
    "transactiontype": "win",
    "transactionid": "gsp_test_win_123",
    "roundid": "round_456",
    "gamecode": "GSP-FRUIT"
  }'`, "curl-win")}
                  >
                    {copied === "curl-win" ? (
                      <><Check className="mr-2 h-4 w-4" /> Copied</>
                    ) : (
                      <><Copy className="mr-2 h-4 w-4" /> Copy cURL</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <Card className="bg-casino-thunder-dark border-white/10 mt-6">
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
          <CardDescription>
            How to test the GitSlotPark seamless wallet integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Use the <strong>Deposit</strong> button to add funds to your wallet.</li>
            <li>Launch a game from the casino lobby that uses the GitSlotPark provider.</li>
            <li>Play the game and observe the transactions being recorded.</li>
            <li>Return to this page and click <strong>Refresh</strong> to see your updated balance and transaction history.</li>
            <li>Use the <strong>API Info</strong> tab to test the API directly with the provided cURL examples.</li>
          </ol>
          
          <div className="bg-casino-thunder-darker p-4 rounded-md mt-4">
            <p className="text-white/80 text-sm">
              <strong>Note:</strong> This is a test environment. In a production environment, deposits and withdrawals would be connected to real payment processors.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GitSlotParkSeamless;

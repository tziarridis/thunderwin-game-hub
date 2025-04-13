
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, RefreshCw, DollarSign, Plus, Minus, RotateCw, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction } from "@/services/transactionService";
import { gitSlotParkService } from "@/services/gitSlotParkService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GitSlotParkSeamless = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [amount, setAmount] = useState("10.00");
  const [isProcessing, setIsProcessing] = useState(false);
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
  
  return (
    <div className="container mx-auto px-4 pt-8 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">GitSlotPark Seamless Wallet</h1>
          <p className="text-white/70">Test and manage your seamless wallet integration</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          className="mt-4 md:mt-0"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    {transactions.filter(tx => tx.provider === 'GitSlotPark').slice(0, 10).map((tx) => (
                      <TableRow key={tx.transactionId}>
                        <TableCell className="font-mono text-xs">
                          {tx.transactionId.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant={tx.type === 'bet' || tx.type === 'debit' ? 'destructive' : 'default'}>
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={tx.type === 'win' || tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}>
                          {tx.type === 'win' || tx.type === 'credit' ? '+' : '-'}€{tx.amount.toFixed(2)}
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
      
      <Card className="bg-casino-thunder-dark border-white/10">
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
            <li>Use the <strong>Withdraw</strong> button to remove funds from your wallet.</li>
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

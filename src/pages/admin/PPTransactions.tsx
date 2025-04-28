
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPragmaticPlayTransactions, TransactionFilter } from "@/services/transactionService";
import { Transaction } from "@/types";
import PPTransactionLogger from "@/components/admin/PPTransactionLogger";

const PPTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getPragmaticPlayTransactions();
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError("Failed to load transactions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pragmatic Play Transactions</h1>
          <p className="text-muted-foreground">View and monitor Pragmatic Play game transactions.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Search..." 
              className="max-w-xs bg-slate-800 text-white"
            />
            <Button variant="default">Search</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="mt-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle>PP Transactions</CardTitle>
              <CardDescription>Showing all transactions from Pragmatic Play</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex justify-center my-8">
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-900/20 border border-red-900 p-4 rounded-md text-red-400">
                  {error}
                </div>
              )}
              
              {!loading && !error && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4">ID</th>
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Game ID</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-right py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                          <td className="py-3 px-4 font-mono text-xs">{transaction.id.substring(0, 8)}...</td>
                          <td className="py-3 px-4">{transaction.userId.substring(0, 8)}...</td>
                          <td className="py-3 px-4">{new Date(transaction.date).toLocaleString()}</td>
                          <td className="py-3 px-4">{transaction.gameId || '-'}</td>
                          <td className="py-3 px-4 capitalize">{transaction.type}</td>
                          <td className={`py-3 px-4 text-right ${transaction.type === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                            {transaction.amount.toFixed(2)} {transaction.currency}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                              transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">{transaction.referenceId || '-'}</td>
                        </tr>
                      ))}
                      
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{transactions.length}</span> transactions
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={true}>Previous</Button>
                  <Button variant="outline">Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="mt-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle>Transaction Logs</CardTitle>
              <CardDescription>Raw transaction logs from Pragmatic Play integration</CardDescription>
            </CardHeader>
            <CardContent>
              <PPTransactionLogger />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PPTransactions;

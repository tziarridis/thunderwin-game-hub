import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getTransactions, TransactionFilter } from "@/services/transactionService";
import { Transaction } from "@/types";

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getTransactions('all');
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
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage all transactions on the platform.</p>
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
      
      <Tabs defaultValue="all">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="bets">Bets</TabsTrigger>
          <TabsTrigger value="wins">Wins</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-wrap gap-4 my-4">
          <Select>
            <SelectTrigger className="w-[180px] bg-slate-800 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger className="w-[180px] bg-slate-800 text-white">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7">Last 7 days</SelectItem>
              <SelectItem value="last30">Last 30 days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger className="w-[180px] bg-slate-800 text-white">
              <SelectValue placeholder="Amount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="0-50">$0 - $50</SelectItem>
              <SelectItem value="51-100">$51 - $100</SelectItem>
              <SelectItem value="101-500">$101 - $500</SelectItem>
              <SelectItem value="501-1000">$501 - $1000</SelectItem>
              <SelectItem value="1000+">$1000+</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="bg-slate-800 text-white">Clear Filters</Button>
        </div>
        
        <TabsContent value="all" className="mt-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Showing all transactions from the platform</CardDescription>
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
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-right py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                          <td className="py-3 px-4 font-mono text-xs">{transaction.id.substring(0, 8)}...</td>
                          <td className="py-3 px-4">{transaction.userId.substring(0, 8)}...</td>
                          <td className="py-3 px-4">{new Date(transaction.date).toLocaleString()}</td>
                          <td className="py-3 px-4 capitalize">{transaction.type}</td>
                          <td className={`py-3 px-4 text-right ${transaction.type === 'deposit' || transaction.type === 'win' || transaction.type === 'bonus' ? 'text-green-500' : 'text-red-500'}`}>
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
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                      
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-500">
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
        
        {/* Add similar TabsContent for other tabs */}
        <TabsContent value="deposits">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle>Deposits</CardTitle>
              <CardDescription>Showing all deposit transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content for deposits tab - similar to All tab but filtered</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdrawals">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle>Withdrawals</CardTitle>
              <CardDescription>Showing all withdrawal transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content for withdrawals tab - similar to All tab but filtered</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bets">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle>Bets</CardTitle>
              <CardDescription>Showing all bet transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content for bets tab - similar to All tab but filtered</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wins">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle>Wins</CardTitle>
              <CardDescription>Showing all win transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content for wins tab - similar to All tab but filtered</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bonuses">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle>Bonuses</CardTitle>
              <CardDescription>Showing all bonus transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content for bonuses tab - similar to All tab but filtered</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Transactions;

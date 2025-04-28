import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { getTransactions, TransactionFilter } from "@/services/transactionService";
import { Transaction } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getTransactions(user.id);
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError("Failed to load your transactions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchTransactions();
    }
  }, [user]);
  
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-8">Transaction History</h1>
      
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="bets">Bets</TabsTrigger>
          <TabsTrigger value="wins">Wins</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-casino-thunder-dark border-casino-thunder-green/50 text-white hover:bg-casino-thunder/80"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-casino-thunder-dark border-casino-thunder-green/50">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="bg-casino-thunder-dark text-white"
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline"
            className="bg-casino-thunder-dark border-casino-thunder-green/50 text-white hover:bg-casino-thunder/80"
            onClick={() => setDate(undefined)}
          >
            Clear Filters
          </Button>
        </div>
        
        <TabsContent value="all">
          <Card className="bg-casino-thunder-dark border-casino-thunder-green/40">
            <CardHeader className="border-b border-casino-thunder-green/20">
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Complete history of all your transactions</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loading && (
                <div className="flex justify-center my-8">
                  <div className="w-12 h-12 rounded-full border-4 border-casino-thunder-green border-t-transparent animate-spin"></div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-900/20 border border-red-800 p-4 rounded-md text-red-400">
                  {error}
                </div>
              )}
              
              {!loading && !error && transactions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-lg text-gray-400">No transactions found</p>
                  <p className="text-sm text-gray-500 mt-2">Your transaction history will appear here</p>
                </div>
              )}
              
              {!loading && !error && transactions.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-casino-thunder-green/20">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-right py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        .filter(transaction => 
                          !date || new Date(transaction.date).toDateString() === date.toDateString()
                        )
                        .map((transaction) => (
                          <tr key={transaction.id} className="border-b border-casino-thunder-green/10 hover:bg-casino-thunder/20">
                            <td className="py-3 px-4">{new Date(transaction.date).toLocaleString()}</td>
                            <td className="py-3 px-4 capitalize">{transaction.type}</td>
                            <td className={`py-3 px-4 text-right ${
                              transaction.type === 'deposit' || transaction.type === 'win' || transaction.type === 'bonus' 
                                ? 'text-green-400' 
                                : 'text-red-400'
                            }`}>
                              {transaction.type === 'deposit' || transaction.type === 'win' || transaction.type === 'bonus' ? '+' : '-'}
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
                              {transaction.description || 
                               (transaction.gameId && `Game: ${transaction.gameId}`) || 
                               (transaction.paymentMethod && `Method: ${transaction.paymentMethod}`) || 
                               '-'}
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Showing {transactions.length} transactions
                </div>
                {transactions.length > 20 && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="bg-casino-thunder-dark border-casino-thunder-green/50 text-white hover:bg-casino-thunder/80"
                      disabled
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline"
                      className="bg-casino-thunder-dark border-casino-thunder-green/50 text-white hover:bg-casino-thunder/80"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deposits">
          <Card className="bg-casino-thunder-dark border-casino-thunder-green/40">
            <CardHeader className="border-b border-casino-thunder-green/20">
              <CardTitle>Deposits</CardTitle>
              <CardDescription>Your deposit transaction history</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-400">Deposit history will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdrawals">
          <Card className="bg-casino-thunder-dark border-casino-thunder-green/40">
            <CardHeader className="border-b border-casino-thunder-green/20">
              <CardTitle>Withdrawals</CardTitle>
              <CardDescription>Your withdrawal transaction history</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-400">Withdrawal history will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bets">
          <Card className="bg-casino-thunder-dark border-casino-thunder-green/40">
            <CardHeader className="border-b border-casino-thunder-green/20">
              <CardTitle>Bets</CardTitle>
              <CardDescription>Your betting history</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-400">Betting history will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wins">
          <Card className="bg-casino-thunder-dark border-casino-thunder-green/40">
            <CardHeader className="border-b border-casino-thunder-green/20">
              <CardTitle>Wins</CardTitle>
              <CardDescription>Your winning history</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-400">Winning history will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bonuses">
          <Card className="bg-casino-thunder-dark border-casino-thunder-green/40">
            <CardHeader className="border-b border-casino-thunder-green/20">
              <CardTitle>Bonuses</CardTitle>
              <CardDescription>Your bonus transaction history</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-400">Bonus history will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Transactions;

import { useState, useEffect } from "react";
import { getUserTransactions } from "@/services/transactionService";
import { TransactionFilter, Transaction } from "@/types/transaction";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, Filter, RefreshCw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilter>({
    limit: 50
  });
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user?.id, filters]);

  const fetchTransactions = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const result = await getUserTransactions(user.id, filters);
      setTransactions(result.data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError("Failed to load transactions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof TransactionFilter, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    
    // Only update filters if we have both dates
    if (range.from && range.to) {
      setFilters(prev => ({
        ...prev,
        startDate: range.from.toISOString(),
        endDate: range.to.toISOString()
      }));
    } else if (!range.from && !range.to) {
      // Clear date filters
      const { startDate, endDate, ...rest } = filters;
      setFilters(rest);
    }
  };

  const clearFilters = () => {
    setFilters({ limit: 50 });
    setDateRange({ from: undefined, to: undefined });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-blue-500/20 text-blue-400';
      case 'withdraw':
        return 'bg-orange-500/20 text-orange-400';
      case 'bet':
        return 'bg-purple-500/20 text-purple-400';
      case 'win':
        return 'bg-green-500/20 text-green-400';
      case 'bonus':
        return 'bg-pink-500/20 text-pink-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'win':
      case 'bonus':
        return 'text-green-500';
      case 'withdraw':
      case 'bet':
        return 'text-red-500';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-casino-thunder-darker">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
          <p className="text-white/70">View and filter your transaction history</p>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <TabsList className="bg-white/5">
              <TabsTrigger value="all" onClick={() => handleFilterChange('type', undefined)}>
                All
              </TabsTrigger>
              <TabsTrigger value="deposits" onClick={() => handleFilterChange('type', 'deposit')}>
                Deposits
              </TabsTrigger>
              <TabsTrigger value="withdrawals" onClick={() => handleFilterChange('type', 'withdraw')}>
                Withdrawals
              </TabsTrigger>
              <TabsTrigger value="bets" onClick={() => handleFilterChange('type', 'bet')}>
                Bets
              </TabsTrigger>
              <TabsTrigger value="wins" onClick={() => handleFilterChange('type', 'win')}>
                Wins
              </TabsTrigger>
              <TabsTrigger value="bonuses" onClick={() => handleFilterChange('type', 'bonus')}>
                Bonuses
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap gap-2">
              <Select onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal bg-white/5 border-white/10",
                      !dateRange.from && !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Date Range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Button 
                variant="outline" 
                className="bg-white/5 border-white/10"
                onClick={clearFilters}
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear
              </Button>

              <Button 
                variant="outline" 
                className="bg-white/5 border-white/10"
                onClick={fetchTransactions}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <Card className="bg-casino-thunder-dark border-casino-thunder-gray/20">
              <CardHeader className="pb-2">
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>Showing your transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="flex justify-center my-8">
                    <div className="w-12 h-12 rounded-full border-4 border-casino-thunder-green border-t-transparent animate-spin"></div>
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
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-left py-3 px-4">Type</th>
                          <th className="text-left py-3 px-4">Description</th>
                          <th className="text-right py-3 px-4">Amount</th>
                          <th className="text-left py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4">
                              {new Date(transaction.date).toLocaleDateString()} 
                              <div className="text-xs text-white/50">
                                {new Date(transaction.date).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`${getTypeColor(transaction.type)}`}>
                                {transaction.type}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">
                                {transaction.description || 
                                  (transaction.type === 'bet' ? 'Game bet' : 
                                   transaction.type === 'win' ? 'Game win' : 
                                   transaction.type === 'deposit' ? 'Deposit' : 
                                   transaction.type === 'withdraw' ? 'Withdrawal' : 
                                   transaction.type === 'bonus' ? 'Bonus credit' : 
                                   'Transaction')}
                              </div>
                              {transaction.provider && (
                                <div className="text-xs text-white/50">
                                  Provider: {transaction.provider}
                                </div>
                              )}
                              {transaction.gameId && (
                                <div className="text-xs text-white/50">
                                  Game ID: {transaction.gameId}
                                </div>
                              )}
                            </td>
                            <td className={`py-3 px-4 text-right font-medium ${getAmountColor(transaction.type)}`}>
                              {transaction.type === 'withdraw' || transaction.type === 'bet' ? '-' : '+'}
                              {transaction.amount.toFixed(2)} {transaction.currency}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                        
                        {transactions.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-white/50">
                              No transactions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="deposits">
            <Card className="bg-casino-thunder-dark border-casino-thunder-gray/20">
              <CardHeader className="pb-2">
                <CardTitle>Deposits</CardTitle>
                <CardDescription>Showing your deposit history</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Same table structure as "all" tab but filtered for deposits */}
                {/* This content is automatically filtered by the tab click handler */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdrawals">
            <Card className="bg-casino-thunder-dark border-casino-thunder-gray/20">
              <CardHeader className="pb-2">
                <CardTitle>Withdrawals</CardTitle>
                <CardDescription>Showing your withdrawal history</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Same table structure as "all" tab but filtered for withdrawals */}
                {/* This content is automatically filtered by the tab click handler */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bets">
            <Card className="bg-casino-thunder-dark border-casino-thunder-gray/20">
              <CardHeader className="pb-2">
                <CardTitle>Bets</CardTitle>
                <CardDescription>Showing your betting history</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Same table structure as "all" tab but filtered for bets */}
                {/* This content is automatically filtered by the tab click handler */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wins">
            <Card className="bg-casino-thunder-dark border-casino-thunder-gray/20">
              <CardHeader className="pb-2">
                <CardTitle>Wins</CardTitle>
                <CardDescription>Showing your winning history</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Same table structure as "all" tab but filtered for wins */}
                {/* This content is automatically filtered by the tab click handler */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bonuses">
            <Card className="bg-casino-thunder-dark border-casino-thunder-gray/20">
              <CardHeader className="pb-2">
                <CardTitle>Bonuses</CardTitle>
                <CardDescription>Showing your bonus history</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Same table structure as "all" tab but filtered for bonuses */}
                {/* This content is automatically filtered by the tab click handler */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Transactions;

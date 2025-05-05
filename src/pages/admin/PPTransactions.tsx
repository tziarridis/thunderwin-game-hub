import { useState, useEffect } from "react";
import { getPragmaticPlayTransactions } from "@/services/transactionService";
import { Transaction, TransactionFilter } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { Download, RefreshCw } from "lucide-react";
import PPTransactionLogger from "@/components/admin/PPTransactionLogger";

const PPTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilter>({
    limit: 100
  });
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getPragmaticPlayTransactions(filters);
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch Pragmatic Play transactions:", err);
      setError("Failed to load transactions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    
    const newFilters = { ...filters };
    if (range.from) {
      newFilters.startDate = format(range.from, "yyyy-MM-dd");
    } else {
      delete newFilters.startDate;
    }
    
    if (range.to) {
      newFilters.endDate = format(range.to, "yyyy-MM-dd");
    } else {
      delete newFilters.endDate;
    }
    
    setFilters(newFilters);
  };

  const handleFilterChange = (key: keyof TransactionFilter, value: string | undefined) => {
    const newFilters = { ...filters };
    
    if (value && value !== "all") {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  const handleExport = () => {
    // Convert transactions to CSV
    const headers = "ID,User ID,Date,Type,Amount,Currency,Status,Game ID,Round ID\n";
    const csv = transactions.map(t => 
      `${t.id},${t.userId},${t.date},${t.type},${t.amount},${t.currency},${t.status},${t.gameId || ''},${t.roundId || ''}`
    ).join("\n");
    
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `pragmatic-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pragmatic Play Transactions</h1>
          <p className="text-muted-foreground">View and analyze all Pragmatic Play game transactions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={loading || transactions.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <Select 
          value={filters.type || "all"} 
          onValueChange={(value) => handleFilterChange("type", value)}
        >
          <SelectTrigger className="w-[150px] bg-slate-800 text-white">
            <SelectValue placeholder="Transaction Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="bet">Bets</SelectItem>
            <SelectItem value="win">Wins</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.status || "all"} 
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-[150px] bg-slate-800 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        
        <DateRangePicker 
          date={dateRange}
          onDateChange={handleDateRangeChange}
        />
        
        <Input 
          placeholder="Player ID" 
          className="w-[200px] bg-slate-800 text-white"
          value={filters.player_id || ""}
          onChange={(e) => handleFilterChange("player_id", e.target.value || undefined)}
        />
      </div>
      
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle>Transaction List</CardTitle>
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
                    <th className="text-left py-3 px-4">Round</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono text-xs">{transaction.id.substring(0, 8)}...</td>
                      <td className="py-3 px-4">{transaction.userId.substring(0, 8)}...</td>
                      <td className="py-3 px-4">{new Date(transaction.date).toLocaleString()}</td>
                      <td className="py-3 px-4">{transaction.gameId || '-'}</td>
                      <td className="py-3 px-4">{transaction.roundId || '-'}</td>
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
          </div>
        </CardContent>
      </Card>
      
      <PPTransactionLogger />
    </div>
  );
};

export default PPTransactions;

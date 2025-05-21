import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Download, RefreshCw, AlertCircle } from 'lucide-react';
// import { DateRangePicker, DateRangePickerProps } from '@/components/ui/daterangepicker'; // Assuming this path
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import Papa from 'papaparse';
import { Transaction } from '@/types/transaction'; // Corrected import path
import { DatePickerWithRange } from '@/components/ui/date-range-picker'; // Assuming this component exists

const ITEMS_PER_PAGE = 20;

const PPTransactionLogger = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const fetchTransactions = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('transactions') // Use the correct table name from your Supabase schema
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`player_id.ilike.%${searchTerm}%,game_id.ilike.%${searchTerm}%,round_id.ilike.%${searchTerm}%`);
      }
      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        // Adjust 'to' date to include the whole day
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', toDate.toISOString());
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error: dbError, count } = await query;

      if (dbError) throw dbError;
      
      // The 'transactions' table has player_id, not user_id.
      // The Transaction type should reflect this.
      setTransactions(data as Transaction[]); // Cast as Transaction[]
      setTotalTransactions(count || 0);
      setCurrentPage(page);

    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(`Failed to fetch transactions: ${err.message}`);
      toast.error(`Failed to fetch transactions: ${err.message}`);
      setTransactions([]);
      setTotalTransactions(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterType, filterStatus, dateRange]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const handleRefresh = () => {
    fetchTransactions(currentPage);
  };

  const handleDateChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
    // fetchTransactions(1); // Fetch on date change
  };
  
  const handleDownloadCSV = () => {
    if (transactions.length === 0) {
      toast.info("No transactions to download.");
      return;
    }
    const csv = Papa.unparse(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions CSV downloaded.");
  };

  const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchTransactions(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchTransactions(currentPage - 1);
    }
  };


  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Transaction Logger</h1>
        <div className="flex items-center gap-2">
           <DatePickerWithRange date={dateRange} onDateChange={handleDateChange} /> {/* Corrected prop usage */}
          <Button onClick={handleDownloadCSV} variant="outline" size="sm" disabled={transactions.length === 0}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="icon" title="Refresh transactions">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-card rounded-lg shadow">
        <div>
          <label htmlFor="search-transactions" className="block text-sm font-medium text-muted-foreground mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-transactions"
              type="search"
              placeholder="Player ID, Game ID, Round ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>
        <div>
          <label htmlFor="filter-type" className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger id="filter-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="bet">Bet</SelectItem>
              <SelectItem value="win">Win</SelectItem>
              <SelectItem value="bonus">Bonus</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="filter-status" className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger id="filter-status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => fetchTransactions(1)} className="self-end">Apply Filters</Button>
      </div>

      {isLoading && transactions.length === 0 && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading transactions...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-10 bg-destructive/10 text-destructive border border-destructive rounded-lg p-4">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="font-semibold">Error loading transactions</p>
          <p className="text-sm">{error}</p>
          <Button onClick={() => fetchTransactions(1)} variant="outline" className="mt-4">Try Again</Button>
        </div>
      )}

      {!isLoading && !error && transactions.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <p>No transactions found matching your criteria.</p>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              Displaying {transactions.length} of {totalTransactions} transactions. 
              Page {currentPage} of {totalPages}.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Player ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Game ID</TableHead>
                <TableHead>Round ID</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium text-xs" title={tx.id}>{tx.id.substring(0, 8)}...</TableCell>
                  <TableCell title={tx.player_id}>{tx.player_id.substring(0,8)}...</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell className="text-right">{tx.amount.toFixed(2)}</TableCell>
                  <TableCell>{tx.currency}</TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === 'completed' ? 'bg-green-500/20 text-green-700' :
                        tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-700' :
                        tx.status === 'failed' ? 'bg-red-500/20 text-red-700' :
                        'bg-gray-500/20 text-gray-700'
                      }`}>
                      {tx.status}
                    </span>
                  </TableCell>
                  <TableCell>{tx.provider || 'N/A'}</TableCell>
                  <TableCell>{tx.game_id || 'N/A'}</TableCell>
                  <TableCell>{tx.round_id || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(tx.created_at), 'PPp')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={10}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalTransactions)} of {totalTransactions} transactions
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1 || isLoading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || isLoading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PPTransactionLogger;

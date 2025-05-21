import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { Transaction, TransactionStatus, TransactionType } from '@/types/transaction';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker'; // Corrected import path
import { DateRange } from "react-day-picker"; // Added this import as it's used in filters state and DatePickerWithRange props
import { Loader2, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner'; // Added toast import as it's used in handleExport
// import { exportToCSV } from '@/utils/exportUtils'; // Assuming a utility for CSV export

const ITEMS_PER_PAGE = 15;

const TransactionsPage = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    type: TransactionType | 'all';
    status: TransactionStatus | 'all';
    dateRange?: DateRange;
  }>({ type: 'all', status: 'all' });

  const { data: queryResponse, isLoading, error } = useQuery<{ transactions: Transaction[], count: number } | undefined, Error>({
    queryKey: ['transactions', user?.id, currentPage, filters],
    queryFn: () => {
        if (!user?.id) return Promise.resolve(undefined); // Or throw error
        return transactionService.getPlayerTransactions(user.id, {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            type: filters.type === 'all' ? undefined : filters.type,
            status: filters.status === 'all' ? undefined : filters.status,
            startDate: filters.dateRange?.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : undefined,
            endDate: filters.dateRange?.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : undefined,
        });
    },
    enabled: !!user?.id,
    keepPreviousData: true,
  });
  
  const transactions = queryResponse?.transactions || [];
  const totalTransactions = queryResponse?.count || 0;
  const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);


  const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  const handleExport = () => {
    if (transactions.length > 0) {
      // exportToCSV(transactions, `transactions_${user?.id}_${new Date().toISOString().split('T')[0]}.csv`);
      toast.info("CSV export functionality placeholder.");
    } else {
      toast.warn("No transactions to export.");
    }
  };


  if (isLoading && transactions.length === 0) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">Error loading transactions: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Transactions</h1>
        <p className="text-muted-foreground">View your complete transaction history.</p>
      </header>

      <div className="mb-6 p-4 bg-card rounded-lg shadow-sm space-y-4 md:flex md:items-end md:justify-between md:space-y-0 md:space-x-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:gap-3 gap-4 w-full">
            <div className="flex-grow">
                <label className="text-xs text-muted-foreground block mb-1">Date Range</label>
                <DatePickerWithRange date={filters.dateRange} onDateChange={(range) => handleFilterChange('dateRange', range)} className="w-full" />
            </div>
             <div className="flex-grow min-w-[150px]">
                <label className="text-xs text-muted-foreground block mb-1">Type</label>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value as TransactionType | 'all')}>
                    <SelectTrigger className="w-full bg-input"><SelectValue placeholder="All Types" /></SelectTrigger>
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
             <div className="flex-grow min-w-[150px]">
                <label className="text-xs text-muted-foreground block mb-1">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value as TransactionStatus | 'all')}>
                    <SelectTrigger className="w-full bg-input"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <Button onClick={handleExport} variant="outline" className="w-full mt-4 md:w-auto md:mt-0">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>
      
      {transactions.length === 0 && !isLoading ? (
         <div className="text-center py-10">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No transactions found matching your criteria.</p>
          </div>
      ) : (
        <div className="overflow-x-auto bg-card p-1 rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider/Game</TableHead>
                <TableHead>Transaction ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{tx.type.replace('_', ' ')}</TableCell>
                  <TableCell className={`font-semibold ${tx.type === 'deposit' || tx.type === 'win' ? 'text-green-500' : tx.type === 'withdrawal' || tx.type === 'bet' ? 'text-red-500' : ''}`}>
                    {tx.type === 'deposit' || tx.type === 'win' ? '+' : tx.type === 'withdrawal' || tx.type === 'bet' ? '-' : ''}
                    {tx.currency}{Math.abs(tx.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                        tx.status === 'completed' ? 'success' : 
                        tx.status === 'pending' ? 'secondary' : 
                        tx.status === 'failed' ? 'destructive' : 'outline'
                    } className="capitalize">
                        {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {tx.provider}{tx.game_id ? ` (${tx.game_id})` : ''}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{tx.provider_transaction_id || tx.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoading}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;

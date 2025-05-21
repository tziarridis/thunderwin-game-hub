import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
// Assuming DateRangePicker props are value and onValueChange
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker';
import { Loader2, Download } from 'lucide-react';
import { Transaction, TRANSACTION_TYPES_ARRAY, TRANSACTION_STATUS_ARRAY } from '@/types/transaction';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 20;

// Interface PPTransaction was Omit<Transaction, 'user_id'> & { player_id: string; }
// We will ensure that the data fetched is mapped to Transaction type directly.

const PPTransactionLogger: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ type: string; status: string }>({ type: '', status: '' });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('transactions') // Corrected table name from 'pp_transactions'
        .select('*', { count: 'exact' });

      if (searchTerm) {
        // Assuming user_id in 'transactions' table corresponds to player_id contextually
        query = query.or(`user_id.ilike.%${searchTerm}%,round_id.ilike.%${searchTerm}%,game_id.ilike.%${searchTerm}%`);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('created_at', new Date(dateRange.to.getTime() + 86399999).toISOString()); // Include end of day
      }

      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      query = query.range(offset, offset + ITEMS_PER_PAGE - 1).order('created_at', { ascending: false });
      
      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;
      
      // Data from 'transactions' should already match Transaction[] if columns are aligned.
      // If 'player_id' specifically exists in your DB table 'transactions' and needs mapping to 'user_id' in the type:
      // const mappedData = data?.map((tx: any) => ({
      //   ...tx,
      //   user_id: tx.player_id || tx.user_id, // Prioritize existing user_id, fallback to player_id if that's the raw column name
      // })) as Transaction[];
      // setTransactions(mappedData || []);

      // Assuming 'transactions' table has 'user_id' column directly.
      setTransactions((data as Transaction[]) || []);
      setTotalTransactions(count || 0);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filters, dateRange, currentPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName: 'type' | 'status', value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
    setCurrentPage(1);
  };
  
  const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);

  const exportToCSV = () => {
    const headers = "ID,User ID,Game ID,Round ID,Type,Amount,Currency,Status,Created At\n"; // Changed Player ID to User ID
    const csvContent = transactions.map(tx => 
        `${tx.id},${tx.user_id},${tx.game_id || ''},${tx.round_id || ''},${tx.type},${tx.amount},${tx.currency},${tx.status},${format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm:ss')}`
    ).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "transactions_log.csv"); // Renamed file
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search by User ID, Round ID, Game ID..." // Changed Player ID
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Transaction Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {TRANSACTION_TYPES_ARRAY.map(type => (
              <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {TRANSACTION_STATUS_ARRAY.map(status => (
              <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Corrected props for DateRangePicker, assuming value and onValueChange */}
        <DateRangePicker value={dateRange} onValueChange={handleDateRangeChange} /> 
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {isLoading && <div className="flex justify-center items-center p-4"><Loader2 className="h-8 w-8 animate-spin" /></div>}
      {error && <div className="text-red-500 p-4">Error: {error}</div>}
      
      {!isLoading && !error && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User ID</TableHead> {/* Changed Player ID */}
                <TableHead>Game ID</TableHead>
                <TableHead>Round ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium truncate max-w-[100px]">{tx.id}</TableCell>
                  <TableCell className="truncate max-w-[150px]">{tx.user_id}</TableCell>
                  <TableCell>{tx.game_id}</TableCell>
                  <TableCell className="truncate max-w-[150px]">{tx.round_id}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell className="text-right">{tx.amount.toFixed(2)}</TableCell>
                  <TableCell>{tx.currency}</TableCell>
                  <TableCell>{tx.status}</TableCell>
                  <TableCell>{format(new Date(tx.created_at), 'Pp')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {transactions.length === 0 && <p className="text-center text-muted-foreground py-4">No transactions found.</p>}
          
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {transactions.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0}-
              {Math.min(currentPage * ITEMS_PER_PAGE, totalTransactions)} of {totalTransactions} transactions.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                disabled={currentPage === 1 || isLoading}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                disabled={currentPage === totalPages || totalTransactions === 0 || isLoading}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PPTransactionLogger;

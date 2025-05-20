
import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction, TransactionStatus, TransactionType } from '@/types/transaction'; // Ensure this type is correct
import { supabase } from '@/integrations/supabase/client'; // Assuming supabase client for direct queries
import { DateRangePicker } from '@/components/ui/date-range-picker'; // Assuming this exists
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Loader2, Search, FileDown } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 15;

const PPTransactionLogger: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const fetchTransactions = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('transactions') // Ensure this table name is correct
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`notes.ilike.%${searchTerm}%,provider_transaction_id.ilike.%${searchTerm}%,user_id.ilike.%${searchTerm}%`);
      }
      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      if (dateRange?.from) {
        query = query.gte('created_at', format(dateRange.from, 'yyyy-MM-dd HH:mm:ss'));
      }
      if (dateRange?.to) {
        query = query.lte('created_at', format(dateRange.to, 'yyyy-MM-dd HH:mm:ss'));
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }
      // Ensure data matches Transaction[] type
      setTransactions(data as Transaction[] || []);
      setTotalTransactions(count || 0);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions: ' + error.message);
      setTransactions([]); // Clear transactions on error
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterType, filterStatus, dateRange]);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [fetchTransactions, currentPage]);

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search/filter
    fetchTransactions(1);
  };
  
  const handleExport = () => {
    // Basic CSV export
    if(transactions.length === 0) {
      toast.info("No transactions to export.");
      return;
    }
    const headers = Object.keys(transactions[0]).join(',');
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers + "\\n"
        + transactions.map(e => Object.values(e).join(',')).join("\\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions exported successfully.");
  };


  const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <h2 className="text-2xl font-semibold">Pragmatic Play Transaction Logger</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-card">
        <Input
          placeholder="Search by User ID, Note, Provider Tx ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="lg:col-span-2"
        />
        <Select value={filterType} onValueChange={(value) => setFilterType(value as TransactionType | 'all')}>
          <SelectTrigger><SelectValue placeholder="Filter by Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {(Object.values(TransactionType) as TransactionType[]).map(type => (
              <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as TransactionStatus | 'all')}>
          <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
             {(Object.values(TransactionStatus) as TransactionStatus[]).map(status => (
              <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="lg:col-span-2">
          <DateRangePicker onUpdate={(values) => setDateRange(values.range)} initialDateFrom={new Date(new Date().setMonth(new Date().getMonth()-1))} />
        </div>
        <Button onClick={handleSearch} className="w-full flex items-center gap-2">
            <Search className="h-4 w-4" /> Search / Filter
        </Button>
        <Button onClick={handleExport} variant="outline" className="w-full flex items-center gap-2">
            <FileDown className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading transactions...</p>
        </div>
      )}

      {!isLoading && transactions.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <p>No transactions found matching your criteria.</p>
        </div>
      )}

      {!isLoading && transactions.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Game ID</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium truncate max-w-[100px]" title={tx.id}>{tx.id}</TableCell>
                    <TableCell className="truncate max-w-[100px]" title={tx.user_id}>{tx.user_id}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell>{tx.amount.toFixed(2)}</TableCell>
                    <TableCell>{tx.currency}</TableCell>
                    <TableCell>{tx.status}</TableCell>
                    <TableCell>{format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                    <TableCell>{tx.provider}</TableCell>
                    <TableCell className="truncate max-w-[100px]" title={tx.game_id || undefined}>{tx.game_id || 'N/A'}</TableCell>
                    <TableCell className="truncate max-w-[150px]" title={tx.notes || undefined}>{tx.notes || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {transactions.length} of {totalTransactions} transactions.
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || isLoading}
              >
                Next
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PPTransactionLogger;

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Search, FileDown, Loader2 } from 'lucide-react';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import { Badge } from '@/components/ui/badge';

// Define a more specific type for transactions coming from the 'pp_transactions' table
interface PPTransaction {
  id: string; // Assuming UUID from DB
  user_id: string; // Assuming this links to your users table
  username?: string; // For display, fetched via join or separate query
  email?: string; // For display
  transaction_id_original: string; // Provider's transaction ID
  payment_method: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'canceled' | 'refunded'; // Adjust as per your statuses
  type: 'deposit' | 'withdrawal'; // Or other types specific to payment processor
  provider: string; // e.g., 'Stripe', 'PayPal', 'PaymentProcessorX'
  created_at: string; // ISO Date string
  updated_at: string; // ISO Date string
  metadata?: Record<string, any>; // Any additional JSON data
  error_message?: string; // If transaction failed
}

const ITEMS_PER_PAGE = 15;

const PPTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<PPTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'deposit' | 'withdrawal' | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PPTransaction['status'] | 'all'>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all'); // New filter for provider
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Mock unique providers for filter - in a real app, fetch these or define them
  const uniqueProviders = ['Stripe', 'PayPal', 'CryptoGateway', 'BankTransfer']; // Example

  const fetchTransactions = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('pp_transactions') // Querying pp_transactions table
        .select('*, user:users(username, email)', { count: 'exact' }); // Adjust join if needed

      if (searchTerm) {
        query = query.or(
          `transaction_id_original.ilike.%${searchTerm}%,user_id.ilike.%${searchTerm}%,provider.ilike.%${searchTerm}%`
          // Add user search if direct column or through related table
          // e.g. if users table is joined and you search by users.email
        );
      }
      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      if (filterProvider !== 'all') {
        query = query.eq('provider', filterProvider);
      }
      if (dateRange?.from) {
        query = query.gte('created_at', format(dateRange.from, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
      }
      if (dateRange?.to) {
        query = query.lte('created_at', format(dateRange.to, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      
      const fetchedTransactions = (data || []).map(txAny => {
        const tx = txAny as any;
        return {
          ...tx,
          username: tx.user?.username,
          email: tx.user?.email,
        } as PPTransaction;
      });

      setTransactions(fetchedTransactions);
      setTotalTransactions(count || 0);

    } catch (error: any) {
      console.error('Error fetching payment processor transactions:', error);
      toast.error('Failed to load transactions: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterType, filterStatus, filterProvider, dateRange]);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [fetchTransactions, currentPage]);

  const handleSearchFilter = () => {
    setCurrentPage(1); // Reset to first page when filters change
    // fetchTransactions(1) will be called by useEffect due to state change
  };
  
  const handleExport = () => {
    if(transactions.length === 0) {
      toast.info("No transactions to export.");
      return;
    }
    // Ensure dates are formatted consistently
    const dataToExport = transactions.map(tx => ({
        ...tx,
        created_at: format(parseISO(tx.created_at), 'yyyy-MM-dd HH:mm:ss'),
        updated_at: format(parseISO(tx.updated_at), 'yyyy-MM-dd HH:mm:ss'),
        metadata: JSON.stringify(tx.metadata) // Stringify JSON metadata
    }));

    const headers = Object.keys(dataToExport[0]).join(',');
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers + "\n"
        + dataToExport.map(e => Object.values(e).map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pp_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions exported successfully.");
  };

  const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);
  const transactionTypes: Array<PPTransaction['type']> = ['deposit', 'withdrawal'];
  const transactionStatuses: Array<PPTransaction['status']> = ['pending', 'completed', 'failed', 'canceled', 'refunded'];

  return (
    <div className="container mx-auto p-4">
      <CMSPageHeader title="Payment Transactions" description="View and manage transactions processed by payment providers." />

      <div className="mb-6 p-4 border rounded-lg bg-card shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
          <Input
            placeholder="Search by Tx ID, User ID, Provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="lg:col-span-2 xl:col-span-1"
          />
          <Select value={filterType} onValueChange={(value) => setFilterType(value as typeof filterType)}>
            <SelectTrigger><SelectValue placeholder="Filter by Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {transactionTypes.map(type => (
                <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as typeof filterStatus)}>
            <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {transactionStatuses.map(status => (
                <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
           <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger><SelectValue placeholder="Filter by Provider" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {uniqueProviders.map(provider => (
                <SelectItem key={provider} value={provider}>{provider}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="lg:col-span-2 xl:col-span-2">
             {/* Corrected DateRangePicker props */}
            <DateRangePicker 
                initialDateRange={dateRange} 
                onUpdate={({range}) => setDateRange(range)} 
                align="start" 
                locale="en-GB"
                showCompare={false}
            />
          </div>
          <Button onClick={handleSearchFilter} className="w-full xl:w-auto flex items-center gap-2 xl:col-start-4">
            <Search className="h-4 w-4" /> Apply Filters
          </Button>
           <Button onClick={handleExport} variant="outline" className="w-full xl:w-auto flex items-center gap-2 xl:col-start-3 xl:row-start-2">
            <FileDown className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>
      
      {isLoading && transactions.length === 0 && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}

      {transactions.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider Tx ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium truncate max-w-[150px]" title={tx.transaction_id_original}>{tx.transaction_id_original}</TableCell>
                  <TableCell className="truncate max-w-[150px]" title={tx.username || tx.email || tx.user_id}>
                    {tx.username || tx.email || tx.user_id.substring(0,8)+'...'}
                  </TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.amount.toFixed(2)} {tx.currency}</TableCell>
                  <TableCell>
                      <Badge variant={
                        tx.status === 'completed' ? 'success' :
                        tx.status === 'failed' || tx.status === 'canceled' ? 'destructive' :
                        tx.status === 'pending' ? 'secondary' : // or use custom 'warning' if defined
                        tx.status === 'refunded' ? 'outline' : 'default'
                      } className="capitalize">
                        {tx.status}
                      </Badge>
                  </TableCell>
                  <TableCell className="truncate max-w-[100px]" title={tx.provider}>{tx.provider}</TableCell>
                  <TableCell>{format(parseISO(tx.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
       {!isLoading && transactions.length === 0 && (
         <p className="text-center text-muted-foreground py-6">No payment transactions found matching your criteria.</p>
       )}

      {totalPages > 1 && (
         <div className="flex justify-between items-center mt-4">
            <Button 
                onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
                disabled={currentPage === 1 || isLoading}
                variant="outline"
            >
                Previous
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
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

export default PPTransactionsPage;


import React, { useState, useMemo } from 'react';
import { useQuery, QueryKey } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionStatusEnum, TransactionTypeEnum } from '@/types/transaction'; // Use the new Transaction type
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
// Assuming DateRangePicker is correctly exported from its file or using a placeholder
// For now, let's ensure the component exists and is imported.
// If it's from shadcn/ui, it might be a composite component.
// Let's use a simpler date input for now if DateRangePicker is problematic.
// import { DateRangePicker } from '@/components/ui/date-range-picker'; 
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 20;

// Function to fetch transactions with pagination and filtering
const fetchTransactions = async (
  page: number,
  filters: {
    userId?: string;
    status?: string;
    type?: string;
    dateRange?: DateRange;
  },
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): Promise<{ data: Transaction[]; count: number }> => {
  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' });

  // Filtering
  if (filters.userId) query = query.eq('player_id', filters.userId); // Assuming player_id is user_id
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.type) query = query.eq('type', filters.type);
  if (filters.dateRange?.from) query = query.gte('created_at', format(filters.dateRange.from, "yyyy-MM-dd'T'HH:mm:ssXXX"));
  if (filters.dateRange?.to) query = query.lte('created_at', format(filters.dateRange.to, "yyyy-MM-dd'T'HH:mm:ssXXX"));
  
  // Sorting
  if (sortBy) query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  
  // Pagination
  const offset = (page - 1) * ITEMS_PER_PAGE;
  query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: (data as Transaction[]) || [], count: count || 0 };
};

const AdminTransactions: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    userId?: string;
    status?: string;
    type?: string;
    dateRange?: DateRange;
  }>({});
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const queryKey: QueryKey = ['transactions', currentPage, filters, sortBy, sortOrder];
  const { data, isLoading, error } = useQuery<{ data: Transaction[]; count: number }, Error>({
    queryKey: queryKey,
    queryFn: () => fetchTransactions(currentPage, filters, sortBy, sortOrder),
    keepPreviousData: true, // Useful for pagination
  });

  const transactions = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };
  
  // DateRangePicker simplified to two date inputs for now to avoid import issues if complex.
  // If you have a working DateRangePicker component, you can use it.
  const [dateRangeFrom, setDateRangeFrom] = useState<string>('');
  const [dateRangeTo, setDateRangeTo] = useState<string>('');

  const handleDateRangeApply = () => {
    const newDateRange: DateRange = {};
    if (dateRangeFrom) newDateRange.from = new Date(dateRangeFrom);
    if (dateRangeTo) newDateRange.to = new Date(dateRangeTo);
    handleFilterChange('dateRange', Object.keys(newDateRange).length > 0 ? newDateRange : undefined);
  };


  if (error) return <div className="p-4">Error loading transactions: {error.message}</div>;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>

      {/* Filters Section */}
      <div className="mb-6 p-4 bg-card rounded-lg shadow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
        <Input
          placeholder="Filter by User ID (Player ID)"
          value={filters.userId || ''}
          onChange={(e) => handleFilterChange('userId', e.target.value)}
          className="bg-background"
        />
        <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}>
          <SelectTrigger className="bg-background"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(TransactionStatusEnum).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.type || ''} onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}>
          <SelectTrigger className="bg-background"><SelectValue placeholder="Filter by Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.values(TransactionTypeEnum).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex gap-2">
                <Input type="date" value={dateRangeFrom} onChange={e => setDateRangeFrom(e.target.value)} className="bg-background" />
                <Input type="date" value={dateRangeTo} onChange={e => setDateRangeTo(e.target.value)} className="bg-background" />
            </div>
            <Button onClick={handleDateRangeApply} size="sm" variant="outline">Apply Dates</Button>
        </div>
        {/* Add DateRangePicker here if available and working */}
        {/* <DateRangePicker
          date={filters.dateRange}
          onDateChange={(range) => handleFilterChange('dateRange', range)}
          className="bg-background"
        /> */}
      </div>
      
      <div className="flex justify-end mb-4">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
      </div>


      {isLoading && <p>Loading transactions...</p>}
      {!isLoading && (
        <div className="overflow-x-auto bg-card rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                {['id', 'player_id', 'type', 'amount', 'currency', 'status', 'provider', 'created_at'].map(col => (
                  <TableHead key={col}>
                    <Button variant="ghost" onClick={() => handleSort(col)} className="px-1">
                      {col.replace('_', ' ').toUpperCase()}
                      {sortBy === col && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center h-24">No transactions found.</TableCell></TableRow>
              )}
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs" title={tx.id}>{tx.id.substring(0, 8)}...</TableCell>
                  <TableCell title={tx.player_id}>{tx.player_id.substring(0,8)}...</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                  <TableCell>{tx.currency}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === TransactionStatusEnum.COMPLETED ? 'bg-green-500 text-white' :
                        tx.status === TransactionStatusEnum.PENDING ? 'bg-yellow-500 text-black' :
                        tx.status === TransactionStatusEnum.FAILED ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                        {tx.status}
                    </span>
                  </TableCell>
                  <TableCell>{tx.provider}</TableCell>
                  <TableCell>{format(new Date(tx.created_at), 'PPp')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages} (Total: {totalCount})
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AdminTransactions;

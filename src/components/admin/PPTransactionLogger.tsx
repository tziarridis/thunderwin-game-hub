
import React, { useState, useEffect } from 'react';
import { useQuery, QueryKey } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Transaction, TransactionStatusEnum } from '@/types/transaction'; // Use standardized Transaction type
import { toast } from 'sonner';
import Papa from 'papaparse';
import { format } from 'date-fns';
import { Loader2, Search, Filter, Download, ArrowUpDown } from 'lucide-react';

const ITEMS_PER_PAGE = 15;

// Mock API call - replace with actual Supabase query or API call
// This function signature now matches what fetchTransactions in AdminTransactions expects
const fetchPPTransactions = async (
  page: number,
  filters: { playerId?: string; gameId?: string; roundId?: string; status?: string; dateFrom?: string; dateTo?: string; },
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): Promise<{ data: Transaction[]; count: number }> => {
  console.log("Fetching PP Transactions:", { page, filters, sortBy, sortOrder });
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock data structure matching Transaction type from src/types/transaction.ts
  const mockRawData = Array.from({ length: 50 }).map((_, i) => {
    const baseId = (page - 1) * ITEMS_PER_PAGE + i + 1;
    return {
      id: `pp_tx_${baseId}_${Date.now()}`,
      player_id: filters.playerId || `user${100 + (baseId % 5)}`,
      type: baseId % 3 === 0 ? 'bet' : 'win',
      amount: parseFloat((Math.random() * (baseId % 3 === 0 ? -10 : 20)).toFixed(2)),
      currency: 'USD',
      status: baseId % 5 === 0 ? TransactionStatusEnum.FAILED : TransactionStatusEnum.COMPLETED,
      provider: 'PragmaticPlay',
      game_id: filters.gameId || `game_${1 + (baseId % 3)}`,
      round_id: filters.roundId || `round_${baseId * 10}`,
      created_at: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      updated_at: new Date().toISOString(),
      balance_before: Math.random() * 1000,
      balance_after: Math.random() * 1000 + (baseId % 3 === 0 ? -10 : 20),
      session_id: `session_${baseId}`,
    };
  });
  
  // Basic filtering mock
  let filteredData = mockRawData;
  if(filters.status) filteredData = filteredData.filter(tx => tx.status === filters.status);
  // Add more mock filtering as needed

  // Basic sorting mock
  filteredData.sort((a, b) => {
    const valA = (a as any)[sortBy];
    const valB = (b as any)[sortBy];
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  const paginatedData = filteredData.slice(0, ITEMS_PER_PAGE); // Mock pagination after filtering and sorting full set

  return { data: paginatedData as Transaction[], count: mockRawData.length }; // Return full count for totalPages calculation
};


const PPTransactionLogger: React.FC = () => {
  // ... keep existing code (useState for filters, currentPage, sortBy, sortOrder)
  const [filters, setFilters] = useState<{
    playerId?: string; gameId?: string; roundId?: string; status?: string; dateFrom?: string; dateTo?: string;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');


  const queryKey: QueryKey = ['ppTransactions', currentPage, filters, sortBy, sortOrder];
  const { data: queryData, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchPPTransactions(currentPage, filters, sortBy, sortOrder),
    staleTime: 60000, // Replace keepPreviousData with appropriate modern options
  });

  const transactions = queryData?.data || [];
  const totalCount = queryData?.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value || undefined }));
    setCurrentPage(1);
  };

  const handleSort = (columnId: keyof Transaction) => {
    if (sortBy === columnId) {
      setSortOrder(currentOrder => currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };
  
  const exportToCSV = () => {
    if(!transactions.length) {
        toast.error("No data to export.");
        return;
    }
    const csv = Papa.unparse(transactions.map(tx => ({
        ID: tx.id,
        PlayerID: tx.player_id,
        Type: tx.type,
        Amount: tx.amount,
        Currency: tx.currency,
        Status: tx.status,
        Provider: tx.provider,
        GameID: tx.game_id,
        RoundID: tx.round_id,
        SessionID: tx.session_id,
        BalanceBefore: tx.balance_before,
        BalanceAfter: tx.balance_after,
        CreatedAt: format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm:ss'),
        UpdatedAt: tx.updated_at ? format(new Date(tx.updated_at), 'yyyy-MM-dd HH:mm:ss') : '',
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pragmaticplay_transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  // ... keep existing code (JSX for filters, table, pagination)
  // Minor adjustments for pagination link might be needed if 'disabled' is not directly supported.
  // Shadcn PaginationLink uses `aria-disabled` and styling, not a direct `disabled` prop.
  // The `Pagination` component itself usually handles disabling logic.

  return (
    <div className="p-4 md:p-6 bg-card text-card-foreground rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Pragmatic Play Transaction Logger</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Input placeholder="Player ID" value={filters.playerId || ''} onChange={e => handleFilterChange('playerId', e.target.value)} />
        <Input placeholder="Game ID" value={filters.gameId || ''} onChange={e => handleFilterChange('gameId', e.target.value)} />
        <Input placeholder="Round ID" value={filters.roundId || ''} onChange={e => handleFilterChange('roundId', e.target.value)} />
        <Select value={filters.status || ''} onValueChange={value => handleFilterChange('status', value === 'all' ? '' : value)}>
          <SelectTrigger><SelectValue placeholder="Status (All)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(TransactionStatusEnum).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={filters.dateFrom || ''} onChange={e => handleFilterChange('dateFrom', e.target.value)} />
        <Input type="date" value={filters.dateTo || ''} onChange={e => handleFilterChange('dateTo', e.target.value)} />
      </div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">Displaying {transactions.length} of {totalCount} transactions.</p>
        <Button onClick={exportToCSV} variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export CSV</Button>
      </div>

      {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && <p className="text-red-500">Error loading transactions: {error.message}</p>}
      
      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Update TableHead to use keyof Transaction for sorting */}
                {(['id', 'created_at', 'player_id', 'type', 'amount', 'status', 'game_id', 'round_id'] as (keyof Transaction)[]).map(headerKey => (
                    <TableHead key={headerKey}>
                        <Button variant="ghost" onClick={() => handleSort(headerKey)} className="px-1 text-xs">
                        {String(headerKey).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {sortBy === headerKey && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                        </Button>
                    </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs font-mono" title={tx.id}>{tx.id.substring(0,15)}...</TableCell>
                  <TableCell>{format(new Date(tx.created_at), 'PPp')}</TableCell>
                  <TableCell>{tx.player_id}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell className={tx.amount < 0 ? 'text-red-500' : 'text-green-500'}>
                    {tx.amount.toFixed(2)} {tx.currency}
                  </TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === TransactionStatusEnum.COMPLETED ? 'bg-green-100 text-green-700' :
                        tx.status === TransactionStatusEnum.PENDING ? 'bg-yellow-100 text-yellow-700' :
                        tx.status === TransactionStatusEnum.FAILED ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                        {tx.status}
                    </span>
                  </TableCell>
                  <TableCell>{tx.game_id}</TableCell>
                  <TableCell>{tx.round_id}</TableCell>
                </TableRow>
              ))}
               {transactions.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center h-24">No transactions found for current filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
                aria-disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : undefined}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
            {/* Simplified pagination display for brevity */}
            <PaginationItem>
                <PaginationLink isActive>
                    Page {currentPage} of {totalPages}
                </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
                aria-disabled={currentPage === totalPages}
                tabIndex={currentPage === totalPages ? -1 : undefined}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default PPTransactionLogger;

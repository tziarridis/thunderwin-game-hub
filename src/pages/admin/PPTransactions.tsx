import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// import { pragmaticPlayService } from '@/services/pragmaticPlayService'; // Assuming this service exists
import { Transaction, DateRange } from '@/types'; // Ensure DateRange is exported from types
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker'; // Ensure this exists
import { format } from 'date-fns';
import { RefreshCw, Loader2, Filter } from 'lucide-react';
import { toast } from 'sonner';

// Mock pragmaticPlayService if not available
const mockPragmaticPlayService = {
  getTransactions: async (params: { 
    userId?: string; 
    status?: string; 
    type?: string; 
    dateFrom?: string; 
    dateTo?: string; 
    page?: number; 
    limit?: number; 
  }): Promise<{ transactions: Transaction[], totalCount: number }> => {
    console.log("Fetching mock PP transactions with params:", params);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return mock data - adjust fields to match Transaction type
    const mockTx: Transaction[] = [
      { id: 'tx123', user_id: params.userId || 'user1', amount: 100, currency: 'USD', type: 'bet', status: 'completed', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), provider_transaction_id: 'pp_tx_abc' },
      { id: 'tx124', user_id: params.userId || 'user2', amount: 50, currency: 'USD', type: 'win', status: 'completed', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), provider_transaction_id: 'pp_tx_def' },
    ];
    return { transactions: mockTx.filter(tx => !params.status || params.status === 'all' || tx.status === params.status), totalCount: mockTx.length };
  }
};
const pragmaticPlayService = mockPragmaticPlayService; // Use mock if real service not ready


const PPTransactionsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    userId: '',
    status: 'all',
    type: 'all',
    dateRange: undefined as DateRange | undefined,
    page: 0,
    limit: 10,
  });

  const { data: transactionsData, isLoading, refetch } = useQuery<{ transactions: Transaction[], totalCount: number }, Error>({
    queryKey: ['ppTransactions', filters],
    queryFn: () => pragmaticPlayService.getTransactions({
      userId: filters.userId || undefined,
      status: filters.status === 'all' ? undefined : filters.status,
      type: filters.type === 'all' ? undefined : filters.type,
      dateFrom: filters.dateRange?.from?.toISOString(),
      dateTo: filters.dateRange?.to?.toISOString(),
      page: filters.page,
      limit: filters.limit,
    }),
    onError: (error) => {
        toast.error(`Failed to load Pragmatic Play transactions: ${error.message}`);
    }
  });

  const transactions = transactionsData?.transactions || [];
  const totalCount = transactionsData?.totalCount || 0;
  const pageCount = Math.ceil(totalCount / filters.limit);

  const columns: ColumnDef<Transaction>[] = [
    { accessorKey: 'id', header: 'Transaction ID' },
    { accessorKey: 'provider_transaction_id', header: 'PP ID' },
    { accessorKey: 'user_id', header: 'User ID' },
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => `${row.original.amount} ${row.original.currency}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'completed' ? 'default' : 'secondary'}>{row.original.status}</Badge> },
    { accessorKey: 'created_at', header: 'Timestamp', cell: ({ row }) => format(new Date(row.original.created_at), 'PPpp') },
    // Add more columns as needed (e.g., gameId, roundId)
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    pageCount: pageCount,
    state: { pagination: { pageIndex: filters.page, pageSize: filters.limit } },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater({pageIndex: filters.page, pageSize: filters.limit}) : updater;
      setFilters(prev => ({ ...prev, page: newPagination.pageIndex, limit: newPagination.pageSize }));
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const handleFilterChange = (key: keyof typeof filters, value: string | DateRange | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const breadcrumbs = [
    { label: "Admin", href: "/admin" },
    { label: "Integrations" },
    { label: "Pragmatic Play Transactions" },
  ];
  
  const headerActions = (
     <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        Refresh Transactions
      </Button>
  );

  return (
    <AdminPageLayout title="Pragmatic Play Transactions" breadcrumbs={breadcrumbs} headerActions={headerActions}>
      <div className="p-4 bg-card rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input 
            placeholder="User ID"
            value={filters.userId}
            onChange={e => handleFilterChange('userId', e.target.value)}
          />
          {/* Add Selects for status and type if needed */}
          <DateRangePicker
            date={filters.dateRange}
            onDateChange={(range) => handleFilterChange('dateRange', range)} // Adjusted prop
            className="w-full"
          />
          <Button onClick={() => refetch()} disabled={isLoading} className="w-full lg:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
        </div>
      </div>

      <DataTable table={table} columns={columns} isLoading={isLoading} />
    </AdminPageLayout>
  );
};

export default PPTransactionsPage;

import React, { useState } from 'react';
import { useQuery, QueryKey } from '@tanstack/react-query';
import { Transaction, DateRange } from '@/types/index.d'; // Import from index.d.ts
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { DataTable, DataTableProps } from '@/components/ui/data-table'; // DataTableProps
import { ColumnDef, useReactTable, getCoreRowModel, Table as ReactTableType } from '@tanstack/react-table'; // Added Table
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker'; 
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
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockTx: Transaction[] = [
      { id: 'tx123', user_id: params.userId || 'user1', amount: 100, currency: 'USD', type: 'bet', status: 'completed', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), provider_transaction_id: 'pp_tx_abc' },
      { id: 'tx124', user_id: params.userId || 'user2', amount: 50, currency: 'USD', type: 'win', status: 'completed', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), provider_transaction_id: 'pp_tx_def' },
    ];
    return { transactions: mockTx.filter(tx => !params.status || params.status === 'all' || tx.status === params.status), totalCount: mockTx.length };
  }
};
const pragmaticPlayService = mockPragmaticPlayService;

const PPTransactionsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    userId: '',
    status: 'all',
    type: 'all',
    dateRange: undefined as DateRange | undefined,
    page: 0,
    limit: 10,
  });

  const { data: transactionsData, isLoading, refetch } = useQuery<{ transactions: Transaction[], totalCount: number }, Error, { transactions: Transaction[], totalCount: number }, QueryKey>({
    queryKey: ['ppTransactions', filters] as QueryKey,
    queryFn: () => pragmaticPlayService.getTransactions({
      userId: filters.userId || undefined,
      status: filters.status === 'all' ? undefined : filters.status,
      type: filters.type === 'all' ? undefined : filters.type,
      dateFrom: filters.dateRange?.from?.toISOString(),
      dateTo: filters.dateRange?.to?.toISOString(),
      page: filters.page,
      limit: filters.limit,
    }),
    meta: { 
      onError: (error: Error) => {
          toast.error(`Failed to load Pragmatic Play transactions: ${error.message}`);
      }
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
          <DateRangePicker
            date={filters.dateRange}
            onDateChange={(range) => handleFilterChange('dateRange', range)}
            className="w-full"
          />
          <Button onClick={() => refetch()} disabled={isLoading} className="w-full lg:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
        </div>
      </div>

      <DataTable table={table as ReactTableType<Transaction>} columns={columns} isLoading={isLoading} />
    </AdminPageLayout>
  );
};

export default PPTransactionsPage;


import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService'; // Assuming this service exists
import { Transaction as TransactionType, TransactionStatus, TransactionType as TxType } from '@/types'; // Renamed Transaction to TransactionType
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker'; // Assuming this exists
import { DateRange } from '@/types'; // Make sure DateRange is exported
import { format } from 'date-fns';
import { ArrowLeft, Download, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UserLayout from '@/components/layout/UserLayout';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const transactionTypeOptions: { value: TxType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'bet', label: 'Bet' },
  { value: 'win', label: 'Win' },
  { value: 'bonus', label: 'Bonus' },
  // Add other types as needed
];

const transactionStatusOptions: { value: TransactionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
  // Add other statuses
];


const TransactionsPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    type: TxType | 'all';
    status: TransactionStatus | 'all';
    dateRange?: DateRange;
    page: number;
    limit: number;
  }>({
    type: 'all',
    status: 'all',
    page: 0,
    limit: 10,
  });

  const { data: transactionsData, isLoading, error } = useQuery<{ transactions: TransactionType[], totalCount: number }, Error>({
    queryKey: ['userTransactions', user?.id, filters],
    queryFn: () => {
      if (!user?.id) throw new Error("User not authenticated");
      return transactionService.getUserTransactions(user.id, {
        type: filters.type === 'all' ? undefined : filters.type,
        status: filters.status === 'all' ? undefined : filters.status,
        dateFrom: filters.dateRange?.from?.toISOString(),
        dateTo: filters.dateRange?.to?.toISOString(),
        page: filters.page,
        limit: filters.limit,
      });
    },
    enabled: !!user?.id && isAuthenticated && !authLoading,
  });
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please log in to view transactions.");
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const transactions = transactionsData?.transactions || [];
  const totalCount = transactionsData?.totalCount || 0;
  const pageCount = Math.ceil(totalCount / filters.limit);

  const columns: ColumnDef<TransactionType>[] = [
    { accessorKey: 'id', header: 'Transaction ID' },
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => `${row.original.amount.toFixed(2)} ${row.original.currency}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'completed' ? 'default' : 'secondary'}>{row.original.status}</Badge> },
    { accessorKey: 'created_at', header: 'Date', cell: ({ row }) => format(new Date(row.original.created_at), 'PPpp') },
    { accessorKey: 'description', header: 'Description', cell: ({row}) => row.original.description || 'N/A' },
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
  
  if (authLoading || (isLoading && !transactionsData)) {
    return <UserLayout><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div></UserLayout>;
  }
  
  if (error) {
    return <UserLayout><div className="text-red-500 text-center py-8">Error loading transactions: {error.message}</div></UserLayout>;
  }

  return (
    <UserLayout>
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">My Transactions</h1>
          <Button variant="outline" disabled> {/* Placeholder for export */}
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        <div className="p-4 bg-card rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Select value={filters.type} onValueChange={(value: TxType | 'all') => handleFilterChange('type', value)}>
              <SelectTrigger><SelectValue placeholder="Filter by Type" /></SelectTrigger>
              <SelectContent>
                {transactionTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value: TransactionStatus | 'all') => handleFilterChange('status', value)}>
              <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
              <SelectContent>
                {transactionStatusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <DateRangePicker 
              date={filters.dateRange}
              onDateChange={(range) => handleFilterChange('dateRange', range)}
              className="w-full"
            />
             <Button onClick={() => table.setPageIndex(0)} className="w-full lg:w-auto" disabled={isLoading}>
                <Filter className="mr-2 h-4 w-4"/>
                Apply Filters
            </Button>
          </div>
        </div>
        
        <DataTable table={table} columns={columns} isLoading={isLoading} />
      </div>
    </UserLayout>
  );
};

export default TransactionsPage;

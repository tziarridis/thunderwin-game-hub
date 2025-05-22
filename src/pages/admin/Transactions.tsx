import React, { useState } from 'react';
import { Transaction } from '@/types';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { DataTable } from "@/components/ui/data-table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { ColumnDef, SortingState, useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileSearch, Loader2, RefreshCw } from 'lucide-react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';

const TransactionsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    userId: '',
    type: '', // deposit, withdrawal, bet, win, bonus, adjustment, refund
    status: '', // pending, completed, failed, cancelled, approved, rejected
    currency: '',
    minAmount: '',
    maxAmount: '',
    dateRange: { from: undefined, to: undefined } as DateRange | undefined,
  });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const { data, isLoading, error: queryError, refetch } = useQuery<{ transactions: Transaction[], totalCount: number }, Error>({
    queryKey: ['adminTransactions', filters, pagination, sorting],
    queryFn: async () => {
      // const result = await transactionService.getAllTransactions({ /* params */ });
      // return { transactions: result.data, totalCount: result.count };
      return { transactions: [], totalCount: 0 }; // Placeholder
    },
  });

  const transactions = data?.transactions || [];
  const totalCount = data?.totalCount || 0;
  const pageCount = Math.ceil(totalCount / pagination.pageSize);
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);


  const columns: ColumnDef<Transaction>[] = [
    { accessorKey: "id", header: "ID", cell: ({row}) => <div className="truncate w-24">{row.original.id}</div> },
    { accessorKey: "user_id", header: "User ID" },
    { accessorKey: "type", header: "Type", cell: ({row}) => <Badge variant="outline">{row.original.type}</Badge>},
    { accessorKey: "amount", header: "Amount", cell: ({row}) => `${row.original.amount.toFixed(2)} ${row.original.currency}`},
    { accessorKey: "status", header: "Status", cell: ({row}) => <Badge style={{backgroundColor: getStatusColor(row.original.status)}} className="text-white">{row.original.status}</Badge>},
    { accessorKey: "created_at", header: "Date", cell: ({row}) => format(new Date(row.original.created_at), "PPpp")},
    {
        id: "actions",
        cell: ({ row }) => (
            <Button variant="outline" size="sm" onClick={() => {setSelectedTransaction(row.original); setIsDetailModalOpen(true);}}>
                <FileSearch className="mr-2 h-4 w-4" /> Details
            </Button>
        ),
    },
  ];
  
  const table = useReactTable({
    data: transactions,
    columns,
    pageCount,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
  });
  
  const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleDateRangeChange = (range?: DateRange) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };
  
  // Helper for status badge color
  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': case 'approved': return 'hsl(var(--primary))';
      case 'pending': return 'hsl(var(--muted-foreground))';
      case 'failed': case 'rejected': case 'cancelled': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--muted))';
    }
  };


  if (queryError) return <AdminPageLayout title="All Transactions"><div className="text-red-500 p-4">Error loading transactions: {queryError.message}</div></AdminPageLayout>;
  return (
    <AdminPageLayout title="All Transactions" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Transactions" }]}>
       <Card className="mb-6">
        <CardHeader><CardTitle>Filter Transactions</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Input placeholder="User ID" value={filters.userId} onChange={e => handleFilterChange('userId', e.target.value)} />
            <Select value={filters.type} onValueChange={value => handleFilterChange('type', value)}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {['deposit', 'withdrawal', 'bet', 'win', 'bonus', 'adjustment', 'refund'].map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                </SelectContent>
            </Select>
             <Select value={filters.status} onValueChange={value => handleFilterChange('status', value)}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                     {['pending', 'completed', 'failed', 'cancelled', 'approved', 'rejected'].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                </SelectContent>
            </Select>
            <Input placeholder="Currency (e.g. USD)" value={filters.currency} onChange={e => handleFilterChange('currency', e.target.value.toUpperCase())} />
            <Input type="number" placeholder="Min Amount" value={filters.minAmount} onChange={e => handleFilterChange('minAmount', e.target.value)} />
            <Input type="number" placeholder="Max Amount" value={filters.maxAmount} onChange={e => handleFilterChange('maxAmount', e.target.value)} />
             <DateRangePicker
                date={filters.dateRange}
                onDateChange={handleDateRangeChange}
                className="col-span-full md:col-span-1 lg:col-span-1 xl:col-span-2"
             />
        </CardContent>
        <CardFooter>
          <Button onClick={() => { setPagination(prev => ({...prev, pageIndex: 0})); refetch(); }} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Apply Filters
          </Button>
           <Button onClick={() => refetch()} variant="outline" className="ml-auto" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh Data
          </Button>
        </CardFooter>
      </Card>

      {isLoading && transactions.length === 0 ? (
          <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <DataTable table={table} columns={columns} isLoading={isLoading} />
       )}
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
        <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
      </div>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction: {selectedTransaction?.id}</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="py-4 space-y-1 text-sm">
              <p><strong>User ID:</strong> {selectedTransaction.user_id}</p>
              <p><strong>Type:</strong> <Badge variant="secondary">{selectedTransaction.type}</Badge></p>
              <p><strong>Amount:</strong> {selectedTransaction.amount.toFixed(2)} {selectedTransaction.currency}</p>
              <p><strong>Status:</strong> <Badge style={{backgroundColor: getStatusColor(selectedTransaction.status)}} className="text-white">{selectedTransaction.status}</Badge></p>
              <p><strong>Description:</strong> {selectedTransaction.description || 'N/A'}</p>
              <p><strong>Provider:</strong> {selectedTransaction.provider || 'N/A'}</p>
              <p><strong>Created At:</strong> {format(new Date(selectedTransaction.created_at), 'PPpp')}</p>
              <p><strong>Updated At:</strong> {format(new Date(selectedTransaction.updated_at), 'PPpp')}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default TransactionsPage;

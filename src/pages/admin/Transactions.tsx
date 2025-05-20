
import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, ColumnFiltersState, getFilteredRowModel } from '@tanstack/react-table';
import { Transaction, TransactionStatus, TransactionType } from '@/types/transaction'; // Use the new Transaction type
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { transactionService } from '@/services/transactionService'; 
import { Eye, RefreshCw, Search, Download, Filter, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer } from '@/components/ui/responsive-container'; // Named import
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
// import { DateRangePicker } from '@/components/ui/date-range-picker'; // Assuming you have this
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
// import { DateRange } from 'react-day-picker'; // If using DateRangePicker

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  // const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Construct filters based on state (globalFilter, columnFilters, dateRange)
      const filters: any = {};
      if (globalFilter) filters.search = globalFilter;
      columnFilters.forEach(f => {
        if (f.id && f.value) filters[f.id] = f.value;
      });
      // if (dateRange?.from) filters.startDate = dateRange.from.toISOString();
      // if (dateRange?.to) filters.endDate = dateRange.to.toISOString();
      
      // Assuming transactionService.getAllTransactions exists and accepts filters
      const data = await transactionService.getAllTransactions(filters); 
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions.');
      setTransactions([]); // Clear on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce fetchTransactions or fetch on explicit action (e.g., Apply Filters button)
    const handler = setTimeout(() => {
        fetchTransactions();
    }, 500); // Debounce global search
    return () => clearTimeout(handler);
  }, [globalFilter, columnFilters/*, dateRange*/]); // Add other dependencies that trigger re-fetch

  const columns = useMemo<ColumnDef<Transaction>[]>(() => [
    {
        accessorKey: "id",
        header: "TXN ID",
        cell: ({ row }) => <span className="font-mono text-xs">{String(row.original.id).substring(0, 8)}...</span>,
    },
    {
        accessorKey: "user_id", 
        header: "User ID", // Or join to get user email/username
        cell: ({ row }) => <span className="text-xs">{row.original.user_id}</span>,
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => `${Number(row.original.amount).toFixed(2)} ${row.original.currency}`,
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({row}) => <Badge variant="outline" className="capitalize">{row.original.type.replace(/_/g, ' ')}</Badge>
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";
            if (status === 'completed' || status === 'approved') badgeVariant = "default"; // Greenish
            else if (status === 'failed' || status === 'rejected') badgeVariant = "destructive";
            else if (status === 'pending') badgeVariant = "outline"; // Yellowish/Orangeish if themed
            
            return <Badge variant={badgeVariant} className={`capitalize ${status === 'completed' || status === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}`}>{status.replace(/_/g, ' ')}</Badge>;
        }
    },
    {
        accessorKey: "provider",
        header: "Provider/Details",
        cell: ({ row }) => row.original.provider || row.original.gameName || 'N/A',
    },
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
        sortingFn: 'datetime',
    },
    {
        id: "actions",
        header: "View",
        cell: ({ row }) => (
            <Button variant="outline" size="icon" onClick={() => alert(`Viewing details for TXN ID: ${row.original.id}`)} title="View Details">
                <Eye className="h-4 w-4" />
            </Button>
        ),
    },
  ], []);


  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters, // For individual column filters
    // onGlobalFilterChange: setGlobalFilter, // Already handled by input's onChange
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // For client-side filtering if API doesn't handle it all
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } }
  });
  
  const transactionStatuses: TransactionStatus[] = ['pending', 'completed', 'failed', 'cancelled', 'approved', 'rejected'];
  const transactionTypes: TransactionType[] = ['deposit', 'withdrawal', 'bet', 'win', 'bonus', 'adjustment', 'refund'];


  return (
    <ResponsiveContainer className="p-4 md:p-6">
      <CMSPageHeader 
        title="Financial Transactions" 
        description="Monitor all financial activities on the platform."
        actions={
            <div className="flex gap-2">
                <Button onClick={fetchTransactions} variant="outline" disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} mr-2`} />
                    Refresh
                </Button>
                <Button variant="outline" disabled> {/* Implement CSV export later */}
                    <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
            </div>
        }
      />

      <div className="mb-6 mt-6 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
                <Label htmlFor="globalSearch" className="sr-only">Search All</Label>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="globalSearch"
                        placeholder="Search transactions..."
                        value={globalFilter ?? ''}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="pl-8 w-full"
                    />
                </div>
            </div>
            {/* <div>
                <Label htmlFor="dateRangePicker" className="text-sm font-medium mb-1 block">Date Range</Label>
                <DateRangePicker id="dateRangePicker" onUpdate={({range}) => setDateRange(range)} />
            </div> */}
            <div>
                <Label htmlFor="statusFilter" className="text-sm font-medium mb-1 block">Status</Label>
                <Select 
                    value={table.getColumn('status')?.getFilterValue() as string || ''}
                    onValueChange={(value) => table.getColumn('status')?.setFilterValue(value || undefined)}
                >
                    <SelectTrigger id="statusFilter" className="w-full"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        {transactionStatuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="typeFilter" className="text-sm font-medium mb-1 block">Type</Label>
                 <Select
                    value={table.getColumn('type')?.getFilterValue() as string || ''}
                    onValueChange={(value) => table.getColumn('type')?.setFilterValue(value || undefined)}
                 >
                    <SelectTrigger id="typeFilter" className="w-full"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        {transactionTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            {/* <Button onClick={fetchTransactions} className="self-end md:col-span-1 lg:col-span-1">
                <Filter className="h-4 w-4 mr-2" /> Apply Filters
            </Button> */}
        </div>
      </div>


      {isLoading && transactions.length === 0 && (
          <div className="space-y-2 mt-4">
              {[...Array(10)].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
      )}
      {!isLoading && transactions.length === 0 && (
        <div className="text-center py-16 bg-card rounded-lg shadow-md mt-4">
            <AlertTriangle className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">No transactions found.</p>
            <p className="mt-2">Transactions will appear here as they occur on the platform.</p>
        </div>
      )}
      
      {transactions.length > 0 && (
        <>
            <div className="rounded-md border overflow-x-auto mt-4">
            <Table>
                <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                        <TableHead key={header.id} onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                            className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                            asc: ' ▲',
                            desc: ' ▼',
                        }[header.column.getIsSorted() as string] ?? null}
                        </TableHead>
                    ))}
                    </TableRow>
                ))}
                </TableHeader>
                <TableBody>
                {table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                        ))}
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                >
                Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                >
                Next
                </Button>
            </div>
        </>
      )}
    </ResponsiveContainer>
  );
};

export default AdminTransactions;

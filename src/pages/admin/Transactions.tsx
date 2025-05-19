import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, ColumnFiltersState, getFilteredRowModel } from '@tanstack/react-table';
import { Transaction } from '@/types'; // Ensure this matches your actual type definition
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { transactionService } from '@/services/transactionService'; // Main service for transactions
import { Eye, RefreshCw, Search, Download, Filter } from 'lucide-react';
import ResponsiveContainer from '@/components/ui/responsive-container';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import { DateRangePicker } from '@/components/ui/date-range-picker'; // Assuming you have this
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  // const [dateRange, setDateRange] = useState<DateRange | undefined>(); // For DateRangePicker

  const fetchTransactions = async (filters?: any) => {
    setIsLoading(true);
    try {
      const data = await transactionService.getTransactions(filters); // Pass filters if service supports it
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // const handleFilter = () => {
  //   const filters = {
  //     // ...(dateRange && { startDate: dateRange.from, endDate: dateRange.to }),
  //     // ...(columnFilters.find(f => f.id === 'status')?.value && { status: columnFilters.find(f => f.id === 'status')?.value }),
  //     // ...(columnFilters.find(f => f.id === 'type')?.value && { type: columnFilters.find(f => f.id === 'type')?.value }),
  //   };
  //   fetchTransactions(filters);
  // };
  
  const columns = useMemo<ColumnDef<Transaction>[]>(() => [
    {
        accessorKey: "id",
        header: "Transaction ID",
        cell: ({ row }) => <span className="font-mono text-xs">{String(row.original.id).substring(0, 8)}...</span>,
    },
    {
        accessorKey: "user_id", // Or a more user-friendly field like user_email if available
        header: "User",
        cell: ({ row }) => row.original.player_id || row.original.user_id, // player_id from Supabase table
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => `${Number(row.original.amount).toFixed(2)} ${row.original.currency}`,
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            let colorClass = "";
            if (status === 'completed' || status === 'approved') colorClass = "text-green-600 bg-green-100";
            else if (status === 'failed' || status === 'rejected') colorClass = "text-red-600 bg-red-100";
            else if (status === 'pending') colorClass = "text-yellow-600 bg-yellow-100";
            else if (status === 'cancelled') colorClass = "text-gray-600 bg-gray-100";
            return <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>{status}</span>;
        }
    },
    {
        accessorKey: "provider",
        header: "Provider/Game",
        cell: ({ row }) => row.original.provider || row.original.gameName || 'N/A',
    },
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => new Date(row.original.created_at || Date.now()).toLocaleString(),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <Button variant="outline" size="sm" onClick={() => alert(`Viewing details for TXN ID: ${row.original.id}`)} title="View Details">
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
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <ResponsiveContainer>
      <CMSPageHeader title="Financial Transactions" description="Monitor all financial activities on the platform.">
        <div className="flex gap-2">
            <Button onClick={() => fetchTransactions()} variant="outline" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} mr-2`} />
                Refresh Transactions
            </Button>
            <Button variant="outline" disabled>
                <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
        </div>
      </CMSPageHeader>

      <div className="mb-4 p-4 border rounded-lg bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
                <Label htmlFor="globalSearch" className="sr-only">Search All</Label>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="globalSearch"
                        placeholder="Search all transactions..."
                        value={globalFilter ?? ''}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="pl-8 w-full"
                    />
                </div>
            </div>
            {/* <div>
                <Label htmlFor="dateRange" className="text-sm font-medium">Date Range</Label>
                <DateRangePicker onUpdate={({range}) => setDateRange(range)} />
            </div> */}
            <div>
                <Label htmlFor="statusFilter" className="text-sm font-medium">Status</Label>
                <Select 
                    value={columnFilters.find(f => f.id === 'status')?.value as string || ''}
                    onValueChange={(value) => table.getColumn('status')?.setFilterValue(value || undefined)}
                >
                    <SelectTrigger id="statusFilter"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="typeFilter" className="text-sm font-medium">Type</Label>
                 <Select
                    value={columnFilters.find(f => f.id === 'type')?.value as string || ''}
                    onValueChange={(value) => table.getColumn('type')?.setFilterValue(value || undefined)}
                 >
                    <SelectTrigger id="typeFilter"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="deposit">Deposit</SelectItem>
                        <SelectItem value="withdrawal">Withdrawal</SelectItem>
                        <SelectItem value="bet">Bet</SelectItem>
                        <SelectItem value="win">Win</SelectItem>
                        <SelectItem value="bonus">Bonus</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {/* <Button onClick={handleFilter} className="self-end">
                <Filter className="h-4 w-4 mr-2" /> Apply Filters
            </Button> */}
        </div>
      </div>


      {isLoading && <p className="text-center py-4">Loading transactions...</p>}
      {!isLoading && (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()}>
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
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
    </ResponsiveContainer>
  );
};

export default AdminTransactions;

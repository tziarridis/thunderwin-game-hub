import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { DateRangePicker } from "@/components/ui/date-range-picker"; // Ensure this is the correct component

// Icons
import { Loader2, RefreshCw, FileSearch } from 'lucide-react';

// Layout
import AdminPageLayout from '@/components/layout/AdminPageLayout';

// Types
import { DateRange } from '@/types';
import { ColumnDef, SortingState, useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { toast } from 'sonner';

// Define PPTransaction type if not imported
interface PPTransaction {
  transactionId: string;
  userId: string;
  gameId: string;
  roundId: string;
  providerRoundId?: string;
  providerTransactionId?: string;
  type: string; // 'bet', 'win', 'refund', etc.
  amount: number;
  currency: string;
  status: string; // 'OK', 'FAILED', etc.
  timestamp: string;
  bonusCode?: string;
  platform?: string;
  roundDetails?: any; // JSON data about the round
}

const PPTransactionsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    transactionId: '',
    userId: '',
    roundId: '',
    gameId: '',
    type: '', // e.g., 'bet', 'win', 'refund'
    status: '', // Specific to Pragmatic Play if different from general transaction statuses
    dateRange: { from: undefined, to: undefined } as DateRange | undefined,
  });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<PPTransaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data, isLoading, error: queryError, refetch } = useQuery<{ transactions: PPTransaction[], totalCount: number}, Error>({
    queryKey: ['ppTransactions', filters, pagination, sorting],
    queryFn: async () => {
      // const result = await pragmaticPlayService.getTransactions({
      //   ...filters,
      //   page: pagination.pageIndex + 1,
      //   limit: pagination.pageSize,
      //   // Pass sorting if API supports it
      // });
      // return { transactions: result.data, totalCount: result.meta.totalItems };
      return { transactions: [], totalCount: 0 }; // Placeholder
    },
    // keepPreviousData: true, // Consider for smoother UX
  });

  const transactions = data?.transactions || [];
  const totalCount = data?.totalCount || 0;
  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  const columns: ColumnDef<PPTransaction>[] = [
    { accessorKey: "transactionId", header: "Transaction ID" },
    { accessorKey: "userId", header: "User ID" },
    { accessorKey: "gameId", header: "Game ID" },
    { accessorKey: "roundId", header: "Round ID" },
    { accessorKey: "type", header: "Type" }, // bet, win, refund
    { accessorKey: "amount", header: "Amount", cell: ({row}) => `${row.original.amount.toFixed(2)} ${row.original.currency}`},
    { accessorKey: "status", header: "Status" }, // e.g. 'OK', 'Failed' - specific to PP
    { accessorKey: "timestamp", header: "Timestamp", cell: ({row}) => format(new Date(row.original.timestamp), "PPpp")},
    {
        id: "actions",
        cell: ({ row }) => (
            <Button variant="outline" size="sm" onClick={() => {setSelectedTransaction(row.original); setIsDetailModalOpen(true);}}>
                Details
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

  if (queryError) return <AdminPageLayout title="Pragmatic Play Transactions"><div className="text-red-500 p-4">Error loading transactions: {queryError.message}</div></AdminPageLayout>;

  return (
    <AdminPageLayout title="Pragmatic Play Transactions" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "PP Transactions" }]}>
      {/* Filters Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input placeholder="Transaction ID" value={filters.transactionId} onChange={e => handleFilterChange('transactionId', e.target.value)} />
          <Input placeholder="User ID" value={filters.userId} onChange={e => handleFilterChange('userId', e.target.value)} />
          <Input placeholder="Round ID" value={filters.roundId} onChange={e => handleFilterChange('roundId', e.target.value)} />
          <Input placeholder="Game ID" value={filters.gameId} onChange={e => handleFilterChange('gameId', e.target.value)} />
          <Select value={filters.type} onValueChange={value => handleFilterChange('type', value)}>
            <SelectTrigger><SelectValue placeholder="Type (bet/win/refund)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="bet">Bet</SelectItem>
              <SelectItem value="win">Win</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={value => handleFilterChange('status', value)}>
            <SelectTrigger><SelectValue placeholder="Status (OK/Failed)" /></SelectTrigger>
            <SelectContent>
               <SelectItem value="">All Statuses</SelectItem>
               <SelectItem value="OK">OK</SelectItem>
               <SelectItem value="FAILED">Failed</SelectItem> {/* Check actual PP status values */}
            </SelectContent>
          </Select>
          <DateRangePicker
            date={filters.dateRange} // Changed from initialDateRange
            onDateChange={handleDateRangeChange} // Changed from onUpdate, and simplified signature
            // Removed align, locale, showCompare as they might not be supported by the current component
            className="col-span-full md:col-span-1 lg:col-span-1"
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

      {/* Table Section */}
       {isLoading && transactions.length === 0 ? (
          <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <DataTable table={table} columns={columns} isLoading={isLoading} />
       )}
      
      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
        <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
      </div>
      
      {/* Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details: {selectedTransaction?.transactionId}</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="py-4 space-y-2 text-sm">
              <p><strong>User ID:</strong> {selectedTransaction.userId}</p>
              <p><strong>Game ID:</strong> {selectedTransaction.gameId}</p>
              <p><strong>Round ID:</strong> {selectedTransaction.roundId}</p>
              <p><strong>Type:</strong> {selectedTransaction.type}</p>
              <p><strong>Amount:</strong> {selectedTransaction.amount.toFixed(2)} {selectedTransaction.currency}</p>
              <p><strong>Provider Round ID:</strong> {selectedTransaction.providerRoundId}</p>
              <p><strong>Provider Transaction ID:</strong> {selectedTransaction.providerTransactionId}</p>
              <p><strong>Status:</strong> {selectedTransaction.status}</p>
              <p><strong>Timestamp:</strong> {format(new Date(selectedTransaction.timestamp), "PPpp")}</p>
              {selectedTransaction.bonusCode && <p><strong>Bonus Code:</strong> {selectedTransaction.bonusCode}</p>}
              {selectedTransaction.platform && <p><strong>Platform:</strong> {selectedTransaction.platform}</p>}
              {selectedTransaction.roundDetails && <pre className="mt-2 p-2 bg-muted rounded text-xs whitespace-pre-wrap"><strong>Round Details:</strong> {JSON.stringify(selectedTransaction.roundDetails, null, 2)}</pre>}
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

export default PPTransactionsPage;

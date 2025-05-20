
import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { kycService, KycRequest } from '@/services/kycService'; // kycService and KycRequest are now exported
import { Eye, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer } from '@/components/ui/responsive-container'; // Named import
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

const KycManagement = () => {
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // To track which row is being updated
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchKycRequests = async () => {
    setIsLoading(true);
    try {
      const data = await kycService.getAllKycRequests();
      setKycRequests(data);
    } catch (error) {
      console.error('Failed to fetch KYC requests:', error);
      toast.error('Failed to load KYC requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const handleUpdateRequestStatus = async (id: string, status: KycRequest['status']) => {
    setIsUpdating(id);
    try {
      await kycService.updateKycRequestStatus(id, status);
      toast.success(`KYC request ${status}.`);
      fetchKycRequests(); // Refresh list
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Failed to update KYC status.'}`);
    } finally {
        setIsUpdating(null);
    }
  };
  
  const columns = useMemo<ColumnDef<KycRequest>[]>(() => [
    {
        accessorKey: "user_id", 
        header: "User",
        cell: ({ row }) => row.original.user_details?.email || row.original.user_details?.username || row.original.user_id,
    },
    {
        accessorKey: "document_type",
        header: "Document Type",
        cell: ({ row }) => <span className="capitalize">{row.original.document_type.replace(/_/g, ' ')}</span>
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
            if (status === 'approved') variant = "default"; // Greenish in default theme
            else if (status === 'rejected') variant = "destructive";
            // 'pending' and 'resubmit_required' can use secondary or outline
            return <Badge variant={variant} className={`capitalize ${status === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}`}>{status.replace(/_/g, ' ')}</Badge>;
        }
    },
    {
        accessorKey: "created_at",
        header: "Submission Date",
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
        accessorKey: "updated_at",
        header: "Last Update",
        cell: ({ row }) => new Date(row.original.updated_at).toLocaleDateString(),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => alert(`Viewing details for ${row.original.id}`)} title="View Details">
                    <Eye className="h-4 w-4" />
                </Button>
                 <Select 
                    value={row.original.status} // Use value instead of defaultValue for controlled component
                    onValueChange={(newStatus: KycRequest['status']) => 
                        handleUpdateRequestStatus(row.original.id, newStatus)}
                    disabled={isUpdating === row.original.id}
                 >
                    <SelectTrigger className="h-9 text-xs w-[130px]">
                        <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approve</SelectItem>
                        <SelectItem value="rejected">Reject</SelectItem>
                        <SelectItem value="resubmit_required">Resubmit Required</SelectItem>
                    </SelectContent>
                </Select>
                {isUpdating === row.original.id && <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>
        ),
    },
  ], [isUpdating]);

  const table = useReactTable({
    data: kycRequests,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

 return (
    <ResponsiveContainer className="p-4 md:p-6">
      <CMSPageHeader 
        title="KYC Management" 
        description="Review and manage user KYC submissions."
        actions={
            <Button onClick={fetchKycRequests} variant="outline" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} mr-2`} />
                Refresh Requests
            </Button>
        }
      />

      {isLoading && kycRequests.length === 0 && (
        <div className="space-y-2 mt-4">
            {[...Array(5)].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      )}
      {!isLoading && kycRequests.length === 0 && (
        <div className="text-center py-16 bg-card rounded-lg shadow-md mt-4">
            <AlertTriangle className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">No KYC requests found.</p>
            <p className="mt-2">Users will appear here once they submit their documents.</p>
        </div>
      )}

      {kycRequests.length > 0 && (
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

export default KycManagement;

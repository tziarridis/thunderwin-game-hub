import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { kycService, KycRequest } from '@/services/kycService'; // Assume kycService exists
import { Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import ResponsiveContainer from '@/components/ui/responsive-container';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const KycManagement = () => {
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleUpdateRequestStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    try {
      await kycService.updateKycRequestStatus(id, status);
      toast.success(`KYC request ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'set to pending'}.`);
      fetchKycRequests(); // Refresh list
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Failed to update KYC status.'}`);
    }
  };
  
  const columns = useMemo<ColumnDef<KycRequest>[]>(() => [
    {
        accessorKey: "user_id", // Or a username/email if joined
        header: "User ID / Email",
        cell: ({ row }) => row.original.user_details?.email || row.original.user_id,
    },
    {
        accessorKey: "document_type",
        header: "Document Type",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            let colorClass = "";
            if (status === 'approved') colorClass = "text-green-600 bg-green-100";
            else if (status === 'rejected') colorClass = "text-red-600 bg-red-100";
            else if (status === 'pending') colorClass = "text-yellow-600 bg-yellow-100";
            return <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>{status}</span>;
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
                <Button variant="outline" size="sm" onClick={() => alert(`Viewing details for ${row.original.id}`)} title="View Details">
                    <Eye className="h-4 w-4" />
                </Button>
                 <Select 
                    defaultValue={row.original.status}
                    onValueChange={(newStatus: 'approved' | 'rejected' | 'pending') => 
                        handleUpdateRequestStatus(row.original.id, newStatus)}
                 >
                    <SelectTrigger className="h-9 text-xs w-[120px]">
                        <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approve</SelectItem>
                        <SelectItem value="rejected">Reject</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        ),
    },
  ], []);

  const table = useReactTable({
    data: kycRequests,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

 return (
    <ResponsiveContainer>
      <CMSPageHeader title="KYC Management" description="Review and manage user KYC submissions.">
        <Button onClick={fetchKycRequests} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} mr-2`} />
            Refresh Requests
        </Button>
      </CMSPageHeader>

      {isLoading && <p className="text-center py-4">Loading KYC requests...</p>}
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
                    No KYC requests found.
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

export default KycManagement;

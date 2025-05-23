import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { ColumnDef, useReactTable, getCoreRowModel, Table as ReactTableType } from '@tanstack/react-table';
import { KycRequest, KycStatus, KycDocumentTypeEnum } from '@/types/kyc'; // Assuming KycRequest includes user details or userId
import { kycService } from '@/services/kycService';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { DataTable } from '@/components/ui/data-table'; // DataTableProps removed
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle, XCircle, Eye, Loader2, Filter } from 'lucide-react';
import { format } from 'date-fns';


const KycManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: 'all',
    userId: '',
    pageIndex: 0,
    pageSize: 10,
  });


  const { data: kycData, isLoading, refetch } = useQuery<{ requests: KycRequest[], totalCount: number }, Error, { requests: KycRequest[], totalCount: number }, QueryKey>({
    queryKey: ['kycRequests', filters] as QueryKey,
    queryFn: async (): Promise<{ requests: KycRequest[], totalCount: number }> => {
      const params = {
        status: filters.status === 'all' ? undefined : filters.status as KycStatus,
        user_id: filters.userId || undefined,
        page: filters.pageIndex,
        limit: filters.pageSize,
      };
      // Assuming kycService.getAllKycRequests returns { data: KycRequest[], count: number }
      // or kycService.getAllKycAttempts which might be more appropriate for admin
      // Let's use a placeholder or adapt if service method is different
      // For now, assuming getAllKycRequests exists and can be adapted
      const result = await kycService.getAllKycRequests(params); // Or getAllKycAttempts
      return { 
        requests: result.data || [], // Adjust if structure is different e.g. result.requests
        totalCount: result.count || 0 // Adjust if structure is different e.g. result.totalCount
      };
    },
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to load KYC requests: ${error.message}`);
      },
    }
  });

  const kycRequests = kycData?.requests || [];
  const totalCount = kycData?.totalCount || 0;
  const pageCount = Math.ceil(totalCount / filters.pageSize);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: KycStatus }) => kycService.updateKycAttemptStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycRequests'] });
      toast.success('KYC status updated successfully.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update KYC status: ${error.message}`);
    },
  });
  
  const handleViewDetails = (request: KycRequest) => {
    // Placeholder for viewing details, e.g., open a modal
    toast.info(`Viewing details for KYC ID: ${request.id} (User ID: ${request.user_id}) - UI not implemented.`);
    console.log("KYC Request Details:", request);
  };
  
  const columns: ColumnDef<KycRequest>[] = [
    { accessorKey: 'id', header: 'Attempt ID' },
    { accessorKey: 'user_id', header: 'User ID' }, // Assuming user_id is directly on KycRequest
    { 
      accessorKey: 'document_type', 
      header: 'Document Type', 
      cell: ({ row }) => <Badge variant="outline">{row.original.document_type || 'N/A'}</Badge>
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
        if (status === 'approved') variant = 'default'; // typically green
        else if (status === 'rejected') variant = 'destructive';
        else if (status === 'pending') variant = 'secondary'; // typically yellow/blue
        return <Badge variant={variant}>{status}</Badge>;
      }
    },
    { 
      accessorKey: 'created_at', 
      header: 'Submitted At', 
      cell: ({ row }) => format(new Date(row.original.created_at), 'PPpp') 
    },
    { 
      accessorKey: 'updated_at', 
      header: 'Last Updated', 
      cell: ({ row }) => format(new Date(row.original.updated_at), 'PPpp') 
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleViewDetails(row.original)}>
            <Eye className="mr-1 h-4 w-4" /> View
          </Button>
          {row.original.status === 'pending' && (
            <>
              <Button 
                variant="default"  // typically green
                size="sm" 
                onClick={() => updateStatusMutation.mutate({ id: row.original.id, status: 'approved' })}
                disabled={updateStatusMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="mr-1 h-4 w-4" /> Approve
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => updateStatusMutation.mutate({ id: row.original.id, status: 'rejected' })}
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="mr-1 h-4 w-4" /> Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: kycRequests,
    columns,
    pageCount: pageCount,
    state: {
      pagination: {
        pageIndex: filters.pageIndex,
        pageSize: filters.pageSize,
      },
    },
    onPaginationChange: (updater) => {
        const newPagination = typeof updater === 'function' 
            ? updater({pageIndex: filters.pageIndex, pageSize: filters.pageSize}) 
            : updater;
        setFilters(prev => ({ ...prev, pageIndex: newPagination.pageIndex, pageSize: newPagination.pageSize }));
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const handleFilterChange = (key: keyof typeof filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, pageIndex: 0 }));
  };


  const breadcrumbs = [
    { label: "Admin", href: "/admin" },
    { label: "Users" },
    { label: "KYC Management" },
  ];

  const headerActions = (
    <Button onClick={() => refetch()} variant="outline" disabled={isLoading || updateStatusMutation.isPending}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
      Refresh Requests
    </Button>
  );


  return (
    <AdminPageLayout title="KYC Management" breadcrumbs={breadcrumbs} headerActions={headerActions}>
       <div className="p-4 bg-card rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="resubmit_required">Resubmit Required</SelectItem>
            </SelectContent>
          </Select>
           <Input 
            placeholder="Filter by User ID"
            value={filters.userId}
            onChange={e => handleFilterChange('userId', e.target.value)}
          />
          <Button onClick={() => refetch()} disabled={isLoading} className="w-full lg:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
        </div>
      </div>
      <DataTable table={table as ReactTableType<KycRequest>} columns={columns as any} isLoading={isLoading} />
    </AdminPageLayout>
  );
};

export default KycManagementPage;

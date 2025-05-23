
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { ColumnDef, useReactTable, getCoreRowModel, Table as ReactTableInstance } from '@tanstack/react-table'; // Renamed Table
import { KycRequest, KycStatus } from '@/types'; // KycDocumentTypeEnum might be in @/types or kyc.ts
import { kycService } from '@/services/kycService';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle, XCircle, Eye, Loader2, Filter } from 'lucide-react';
import { format } from 'date-fns';

type KycQueryResponse = { requests: KycRequest[], totalCount: number };

const KycManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: 'all',
    userId: '',
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: kycData, isLoading, refetch } = useQuery<KycQueryResponse, Error, KycQueryResponse, QueryKey>({
    queryKey: ['kycRequests', filters] as QueryKey,
    queryFn: async (): Promise<KycQueryResponse> => {
      const params: any = { // Use 'any' for params flexibility if service expects slightly different names
        page: filters.pageIndex, // Supabase often uses 0-based offset
        limit: filters.pageSize,
      };
      if (filters.status !== 'all') params.status = filters.status as KycStatus;
      if (filters.userId) params.user_id = filters.userId; // Ensure service expects user_id
      
      const result = await kycService.getAllKycRequests(params);
      // Adapt to actual response structure from kycService.getAllKycRequests
      // Assuming it returns { data: KycRequest[], count: number } or { requests: KycRequest[], totalCount: number }
      const requests = result.data || result.requests || (Array.isArray(result) ? result : []);
      const totalCount = result.count || result.totalCount || requests.length;
      
      return { 
        requests: requests,
        totalCount: totalCount
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
  const pageCount = totalCount > 0 ? Math.ceil(totalCount / filters.pageSize) : 0;

  const updateStatusMutation = useMutation({
    // Ensure kycService.updateKycRequestStatus exists and matches these params
    mutationFn: ({ id, status, adminId, rejectionReason }: { id: string; status: KycStatus; adminId?: string; rejectionReason?: string }) => 
      kycService.updateKycRequestStatus(id, status, adminId, rejectionReason), // Use updateKycRequestStatus
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycRequests'] });
      toast.success('KYC status updated successfully.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update KYC status: ${error.message}`);
    },
  });
  
  const handleViewDetails = (request: KycRequest) => {
    toast.info(`Viewing details for KYC ID: ${request.id} (User ID: ${request.user_id}) - UI not implemented.`);
    console.log("KYC Request Details:", request);
    // Implement modal or dedicated view page here
  };
  
  const columns: ColumnDef<KycRequest>[] = [
    { accessorKey: 'id', header: 'Attempt ID', cell: ({row}) => <span className="text-xs">{row.original.id}</span> },
    { accessorKey: 'user_id', header: 'User ID', cell: ({row}) => <span className="text-xs">{row.original.user_id}</span> },
    { 
      accessorKey: 'document_type', 
      header: 'Doc Type', 
      cell: ({ row }) => <Badge variant="outline">{String(row.original.document_type || 'N/A').toUpperCase()}</Badge>
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
        let badgeClass = "";
        if (status === KycStatus.APPROVED) { badgeVariant = 'default'; badgeClass="bg-green-500 hover:bg-green-600"; }
        else if (status === KycStatus.REJECTED) badgeVariant = 'destructive';
        else if (status === KycStatus.PENDING) { badgeVariant = 'secondary'; badgeClass="bg-yellow-500 hover:bg-yellow-600"; }
        else if (status === KycStatus.RESUBMIT_REQUIRED) { badgeVariant = 'secondary'; badgeClass="bg-blue-500 hover:bg-blue-600"; }
        return <Badge variant={badgeVariant} className={badgeClass}>{String(status).toUpperCase()}</Badge>;
      }
    },
    { 
      accessorKey: 'created_at', 
      header: 'Submitted', 
      cell: ({ row }) => format(new Date(row.original.created_at), 'MMM d, yyyy HH:mm') 
    },
    { 
      accessorKey: 'updated_at', 
      header: 'Updated', 
      cell: ({ row }) => format(new Date(row.original.updated_at), 'MMM d, yyyy HH:mm') 
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="space-x-1">
          <Button variant="outline" size="sm" onClick={() => handleViewDetails(row.original)}>
            <Eye className="mr-1 h-3 w-3" /> View
          </Button>
          {row.original.status === KycStatus.PENDING && (
            <>
              <Button 
                variant="default"
                size="sm" 
                onClick={() => updateStatusMutation.mutate({ id: row.original.id, status: KycStatus.APPROVED })}
                disabled={updateStatusMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="mr-1 h-3 w-3" /> Approve
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => {
                  // Optionally, prompt for rejection reason here
                  updateStatusMutation.mutate({ id: row.original.id, status: KycStatus.REJECTED, rejectionReason: "Generic rejection" })
                }}
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="mr-1 h-3 w-3" /> Reject
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
        const newPaginationState = typeof updater === 'function' 
            ? updater({pageIndex: filters.pageIndex, pageSize: filters.pageSize}) 
            : updater;
        setFilters(prev => ({ ...prev, pageIndex: newPaginationState.pageIndex, pageSize: newPaginationState.pageSize }));
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const handleFilterChange = (key: keyof typeof filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, pageIndex: 0 })); // Reset to first page on filter change
  };


  const breadcrumbs = [
    { label: "Admin", href: "/admin" },
    { label: "Users" }, // Or KYC directly if it's top-level in admin
    { label: "KYC Management" },
  ];

  const headerActions = (
    <Button onClick={() => refetch()} variant="outline" disabled={isLoading || updateStatusMutation.isPending}>
      {isLoading || updateStatusMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
      Refresh Requests
    </Button>
  );

  return (
    <AdminPageLayout title="KYC Management" breadcrumbs={breadcrumbs} headerActions={headerActions}>
       <div className="p-4 bg-card rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Filter by status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.values(KycStatus).map(status => (
                  <SelectItem key={status} value={status}>{status.toUpperCase().replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="userid-filter" className="text-sm font-medium">User ID</Label>
            <Input 
              id="userid-filter"
              placeholder="Filter by User ID"
              value={filters.userId}
              onChange={e => handleFilterChange('userId', e.target.value)}
            />
          </div>
          <Button onClick={() => refetch()} disabled={isLoading} className="w-full md:w-auto self-end">
            <Filter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={kycRequests} isLoading={isLoading} />
    </AdminPageLayout>
  );
};

export default KycManagementPage;

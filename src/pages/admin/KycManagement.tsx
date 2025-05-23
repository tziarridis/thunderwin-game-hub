import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { kycService } from '@/services/kycService';
import { KycAttempt, KycStatus as KycStatusType, User, KycRequest } from '@/types/index.d'; // Import KycRequest from index.d.ts
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { DataTable, DataTableProps } from '@/components/ui/data-table'; // DataTableProps
import { ColumnDef, useReactTable, getCoreRowModel, Table as ReactTableType } from '@tanstack/react-table'; // Added Table
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import KycStatusDisplay from '@/components/kyc/KycStatusDisplay';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Eye, CheckCircle, XCircle, RefreshCw, Loader2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

const kycStatusOptions: { value: KycStatusType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'resubmit_required', label: 'Resubmit Required' },
  { value: 'failed', label: 'Failed' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'verified', label: 'Verified' },
];

const KycManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ userId: '', status: 'all' as KycStatusType | 'all', page: 0, limit: 10 });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedKycAttempt, setSelectedKycAttempt] = useState<KycAttempt | null>(null);


  const { data: kycData, isLoading, refetch } = useQuery<{ requests: KycRequest[], totalCount: number }, Error, { requests: KycRequest[], totalCount: number }, QueryKey>({
    queryKey: ['kycRequests', filters] as QueryKey,
    queryFn: async () => {
        const serviceParams: { userId?: string; status?: KycStatusType; page?: number; limit?: number } = {
          limit: filters.limit,
          page: filters.page,
        };
        if (filters.userId) serviceParams.userId = filters.userId;
        if (filters.status !== 'all') serviceParams.status = filters.status;

        // Assuming kycService.getAllKycRequests returns { requests: KycRequest[], totalCount: number }
        // If it returns KycRequest[] and a separate count, adjust here.
        // For now, assume it matches the type. If getAllKycRequests returns just KycRequest[]:
        // const requests = await kycService.getAllKycRequests(serviceParams);
        // return { requests, totalCount: requests.length }; // This would be a mock totalCount.
        // The service MUST return totalCount for proper pagination.
        const result = await kycService.getAllKycRequests(serviceParams);
        return result; 
    },
  });

  // The type KycAttempt might be different from KycRequest.
  // If columns are for KycAttempt, this cast might be problematic.
  // For now, we assume KycRequest can be displayed by columns meant for KycAttempt.
  const requestsToDisplay = (kycData?.requests || []) as KycRequest[]; // Use KycRequest for data
  const totalCount = kycData?.totalCount || 0;
  const pageCount = Math.ceil(totalCount / filters.limit);

  const updateKycStatusMutation = useMutation({
    mutationFn: ({ attemptId, status, remarks, adminId }: { attemptId: string; status: KycStatusType; remarks?: string, adminId: string }) =>
      kycService.updateKycRequestStatus(attemptId, status, adminId, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycRequests'] });
      toast.success('KYC status updated successfully.');
      if (isDetailsModalOpen) setIsDetailsModalOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update KYC status: ${error.message}`);
    },
  });

  const handleViewDetails = (request: KycRequest) => { // Changed param type to KycRequest
    // If KycAttempt is truly needed for modal, map KycRequest to KycAttempt or adjust modal.
    // For now, casting to KycAttempt for the modal.
    setSelectedKycAttempt(request as unknown as KycAttempt); 
    setIsDetailsModalOpen(true);
  };
  
  const handleUpdateStatus = (requestId: string, status: KycStatusType, remarks?: string) => { // Changed param name
    const adminId = "current_admin_user_id_placeholder"; 
    updateKycStatusMutation.mutate({ attemptId: requestId, status, remarks, adminId });
  };

  // Columns should be ColumnDef<KycRequest> if data is KycRequest[]
  const columns: ColumnDef<KycRequest>[] = [
    { accessorKey: 'id', header: 'Request ID', cell: ({ row }) => <span className="truncate w-20 block">{row.original.id}</span> },
    { 
      accessorKey: 'user_id', 
      header: 'User ID / Email',
      cell: ({ row }) => {
        const user = row.original.user as User; // User associated with KycRequest
        return user ? (
            <div className="flex flex-col">
                <span>{user.username || user.email || row.original.user_id}</span>
                <span className="text-xs text-muted-foreground">{row.original.user_id}</span>
            </div>
        ) : row.original.user_id;
      } 
    },
    { 
      accessorKey: 'status', 
      header: 'Status', 
      cell: ({ row }) => <KycStatusDisplay status={row.original.status} />
    },
    { 
      accessorKey: 'document_type', // This was KycAttempt specific. KycRequest might have documents array
      header: 'Doc Type(s)',
      cell: ({ row }) => {
        // Accessing documents on KycRequest
        if (row.original.documents && row.original.documents.length > 0) {
          return row.original.documents.map(doc => doc.document_type).join(', ');
        }
        return 'N/A'; 
      }
    },
    { 
      accessorKey: 'created_at', 
      header: 'Submitted At', 
      cell: ({ row }) => format(new Date(row.original.created_at), 'PPpp') 
    },
    { 
      accessorKey: 'reviewed_at', 
      header: 'Reviewed At', 
      cell: ({ row }) => row.original.reviewed_at ? format(new Date(row.original.reviewed_at), 'PPpp') : (row.original.updated_at !== row.original.created_at ? format(new Date(row.original.updated_at), 'PPpp') : 'N/A')
    },
    { 
      accessorKey: 'reviewed_by_admin_id', // Assuming KycRequest has reviewed_by_admin_id
      header: 'Reviewed By',
      // cell: ({row}) => (row.original as any).reviewed_by_admin?.username || (row.original as any).admin_id || 'N/A' // Needs actual admin relation
      cell: ({row}) => row.original.reviewed_by_admin_id || 'N/A'
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleViewDetails(row.original)}>
            <Eye className="mr-1 h-4 w-4" /> View
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: requestsToDisplay, // Use KycRequest[]
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
  
  const handleFilterChange = (key: keyof typeof filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const pageHeaderActions = (
     <Button onClick={() => refetch()} variant="outline" disabled={isLoading || updateKycStatusMutation.isPending}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        Refresh List
      </Button>
  );

  return (
    <AdminPageLayout title="KYC Management" headerActions={pageHeaderActions}>
      <div className="p-4 bg-card rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input 
            placeholder="Search by User ID or Email"
            value={filters.userId}
            onChange={e => handleFilterChange('userId', e.target.value)}
          />
          <Select 
            value={filters.status} 
            onValueChange={(value: KycStatusType | 'all') => handleFilterChange('status', value as string)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              {kycStatusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => refetch()} disabled={isLoading}>
            <Filter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
        </div>
      </div>

      <DataTable table={table as ReactTableType<KycRequest>} columns={columns} isLoading={isLoading} />

      {isDetailsModalOpen && selectedKycAttempt && ( // selectedKycAttempt is used for the modal
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">KYC Attempt Details (ID: {selectedKycAttempt.id})</h2>
            <p>User ID: {selectedKycAttempt.user_id}</p>
            <p>Status: <KycStatusDisplay status={selectedKycAttempt.status} /></p>
            <p>Document Type: {(selectedKycAttempt as any).document_type || selectedKycAttempt.documents?.map(d => d.document_type).join(', ') || 'N/A'}</p>
            <p>Submitted: {format(new Date(selectedKycAttempt.created_at), 'PPpp')}</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
              {selectedKycAttempt.status === 'pending_review' && (
                <>
                  <Button 
                    variant="default"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleUpdateStatus(selectedKycAttempt.id, 'approved', 'Looks good.')}
                    disabled={updateKycStatusMutation.isPending}
                  >
                    Approve
                  </Button>
                   <Button 
                    variant="destructive"
                    onClick={() => handleUpdateStatus(selectedKycAttempt.id, 'rejected', 'Information mismatch.')}
                    disabled={updateKycStatusMutation.isPending}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </AdminPageLayout>
  );
};

export default KycManagementPage;


import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kycService } from '@/services/kycService';
import { KycAttempt, KycStatus as KycStatusType, User, KycRequest } from '@/types'; // Added KycRequest for service return
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import KycStatusDisplay from '@/components/kyc/KycStatusDisplay';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Eye, CheckCircle, XCircle, RefreshCw, Loader2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
// import KycDetailsModal from '@/components/admin/KycDetailsModal'; 

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
  const [selectedKycAttempt, setSelectedKycAttempt] = useState<KycAttempt | null>(null); // Keeping KycAttempt for now
  // const [selectedKycRequest, setSelectedKycRequest] = useState<KycRequest | null>(null); // If using KycRequest

  // Assuming kycService.getAllKycRequests is the correct method
  // and it returns { requests: KycRequest[], totalCount: number }
  // Need to adapt KycAttempt type if KycRequest is structurally different
  const { data: kycData, isLoading, refetch } = useQuery<{ attempts: KycAttempt[], totalCount: number }, Error>({
    queryKey: ['kycRequests', filters], // Changed from kycAttempts to kycRequests
    queryFn: async () => {
        const result = await kycService.getAllKycRequests({ // Changed from getAllKycAttempts
            userId: filters.userId || undefined, 
            status: filters.status === 'all' ? undefined : filters.status,
            page: filters.page,
            limit: filters.limit,
        });
        // Adapt result.requests (KycRequest[]) to KycAttempt[] if needed for the DataTable
        // For now, assuming KycRequest is compatible enough or we adjust columns for KycRequest
        return { attempts: result.requests as unknown as KycAttempt[], totalCount: result.totalCount }; 
    },
  });


  const attempts = kycData?.attempts || [];
  const totalCount = kycData?.totalCount || 0;
  const pageCount = Math.ceil(totalCount / filters.limit);

  // Assuming kycService.updateKycRequestStatus is the correct method
  const updateKycStatusMutation = useMutation({
    mutationFn: ({ attemptId, status, remarks, adminId }: { attemptId: string; status: KycStatusType; remarks?: string, adminId: string }) => // adminId might be needed
      kycService.updateKycRequestStatus(attemptId, status, adminId, remarks), // Changed from updateKycAttemptStatus
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycRequests'] }); // Changed from kycAttempts
      toast.success('KYC status updated successfully.');
      if (isDetailsModalOpen) setIsDetailsModalOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update KYC status: ${error.message}`);
    },
  });

  const handleViewDetails = (attempt: KycAttempt) => { // or KycRequest
    setSelectedKycAttempt(attempt);
    // setSelectedKycRequest(attempt as KycRequest); // if using KycRequest type for modal
    setIsDetailsModalOpen(true);
  };
  
  const handleUpdateStatus = (attemptId: string, status: KycStatusType, remarks?: string) => {
    // TODO: Get current adminId, perhaps from AuthContext
    const adminId = "current_admin_user_id_placeholder"; // Placeholder
    updateKycStatusMutation.mutate({ attemptId, status, remarks, adminId });
  };

  // Columns might need adjustment if KycRequest properties differ significantly from KycAttempt
  const columns: ColumnDef<KycAttempt>[] = [
    { accessorKey: 'id', header: 'Attempt ID', cell: ({ row }) => <span className="truncate w-20 block">{row.original.id}</span> },
    { 
      accessorKey: 'user_id', 
      header: 'User ID / Email',
      cell: ({ row }) => {
        // Assuming user is populated or can be fetched. KycRequest might have user details.
        const user = (row.original as any).user as User; // Cast to any if user is not on KycAttempt
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
      accessorKey: 'document_type',  // This might be on KycDocument within KycAttempt/KycRequest
      header: 'Doc Type(s)',
      // cell: ({row}) => (row.original as any).document_type || (row.original.documents?.[0]?.document_type) || 'N/A'
      cell: ({ row }) => {
        const attempt = row.original as KycAttempt; // or KycRequest if types are aligned
        if (attempt.documents && attempt.documents.length > 0) {
          return attempt.documents.map(doc => doc.document_type).join(', ');
        }
        return (attempt as any).document_type || 'N/A'; // Fallback if document_type is a direct prop
      }
    },
    { 
      accessorKey: 'created_at', 
      header: 'Submitted At', 
      cell: ({ row }) => format(new Date(row.original.created_at), 'PPpp') 
    },
    { 
      accessorKey: 'reviewed_at', // This might be 'updated_at' or a specific review timestamp
      header: 'Reviewed At', 
      cell: ({ row }) => (row.original as any).reviewed_at ? format(new Date((row.original as any).reviewed_at), 'PPpp') : (row.original.updated_at !== row.original.created_at ? format(new Date(row.original.updated_at), 'PPpp') : 'N/A')
    },
    { 
      accessorKey: 'reviewed_by',  // This needs to come from KycRequest or related data
      header: 'Reviewed By',
      cell: ({row}) => (row.original as any).reviewed_by_admin?.username || (row.original as any).admin_id || 'N/A'
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
    data: attempts,
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

  const pageHeaderActions = ( // Renamed to avoid conflict
     <Button onClick={() => refetch()} variant="outline" disabled={isLoading || updateKycStatusMutation.isPending}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        Refresh List
      </Button>
  );

  return (
    <AdminPageLayout title="KYC Management" actions={pageHeaderActions}> {/* Changed to actions */}
      <div className="p-4 bg-card rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input 
            placeholder="Search by User ID or Email"
            value={filters.userId}
            onChange={e => handleFilterChange('userId', e.target.value)}
          />
          <Select 
            value={filters.status} 
            onValueChange={(value: KycStatusType | 'all') => handleFilterChange('status', value)}
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

      <DataTable table={table} columns={columns} isLoading={isLoading} />

      {isDetailsModalOpen && selectedKycAttempt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">KYC Attempt Details (ID: {selectedKycAttempt.id})</h2>
            <p>User ID: {selectedKycAttempt.user_id}</p>
            <p>Status: <KycStatusDisplay status={selectedKycAttempt.status} /></p>
            <p>Document Type: {(selectedKycAttempt as any).document_type || selectedKycAttempt.documents?.map(d => d.document_type).join(', ') || 'N/A'}</p>
            <p>Submitted: {format(new Date(selectedKycAttempt.created_at), 'PPpp')}</p>
            {/* Display more details, documents, etc. */}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
              {selectedKycAttempt.status === 'pending_review' && (
                <>
                  <Button 
                    variant="success" // This variant might not exist by default in shadcn Button
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

import React, { useState } from 'react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, SortingState, ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTable } from "@/components/ui/data-table";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import KycStatusDisplay from '@/components/kyc/KycStatusDisplay';

import { FileSearch, RefreshCw, Loader2 } from 'lucide-react';
import { KycStatus, KycDocumentTypeEnum, KycDocument, KycAttempt } from '@/types/kyc';

const KycManagementPage = () => {
  const [filters, setFilters] = useState({ status: '', searchTerm: '' });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKycAttempt, setSelectedKycAttempt] = useState<KycAttempt | null>(null);
  const [updateStatus, setUpdateStatus] = useState<KycStatus | ''>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<{ attempts: KycAttempt[], totalCount: number }, Error>({
    queryKey: ['kycAttempts', filters, pagination],
    queryFn: async () => {
      // Replace with actual kycService.getKycAttempts call
      // This is a placeholder structure
      console.log("Fetching KYC attempts with filters:", filters, "pagination:", pagination);
      // Simulate API call
      // const fetchedData = await kycService.getAllAttempts({ ...filters, ...pagination });
      // return { attempts: fetchedData.data, totalCount: fetchedData.count };
      
      // Placeholder data for now
      const mockAttempts: KycAttempt[] = [
        { id: '1', user_id: 'user123', status: 'pending_review', documents: [{id: 'doc1', user_id: 'user123', document_type: KycDocumentTypeEnum.ID_CARD_FRONT, file_url: '/placeholder.svg', status: 'pending', uploaded_at: new Date().toISOString()}], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), notes: 'First attempt' },
        { id: '2', user_id: 'user456', status: 'approved', documents: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      return { attempts: mockAttempts, totalCount: mockAttempts.length };
    },
    // keepPreviousData: true, // Consider this for smoother pagination
  });

  const kycAttempts = data?.attempts || [];
  const totalCount = data?.totalCount || 0;
  const pageCount = Math.ceil(totalCount / pagination.pageSize);


  const updateKycMutation = useMutation({
    mutationFn: async (payload: { attemptId: string; status: KycStatus; rejectionReason?: string; adminNotes?: string }) => {
      // Replace with actual kycService.updateKycAttemptStatus call
      console.log("Updating KYC attempt:", payload);
      // await kycService.updateAttemptStatus(payload.attemptId, payload.status, payload.rejectionReason, payload.adminNotes);
      // Simulate update
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success('KYC status updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['kycAttempts'] });
      setIsModalOpen(false);
      setSelectedKycAttempt(null);
      setUpdateStatus('');
      setRejectionReason('');
      setAdminNotes('');
    },
    onError: (err: Error) => {
      toast.error(`Failed to update KYC status: ${err.message}`);
    },
  });

  const handleViewDetails = (attempt: KycAttempt) => {
    setSelectedKycAttempt(attempt);
    setUpdateStatus(attempt.status); // Pre-fill current status
    setAdminNotes(attempt.notes || '');
    setRejectionReason(attempt.documents.find(doc => doc.status === 'rejected')?.rejection_reason || ''); // Example prefill
    setIsModalOpen(true);
  };

  const handleSubmitUpdate = () => {
    if (!selectedKycAttempt || !updateStatus) {
      toast.error("No KYC attempt selected or status is missing.");
      return;
    }
    if (updateStatus === 'rejected' && !rejectionReason) {
      toast.error("Rejection reason is required for rejected status.");
      return;
    }
    updateKycMutation.mutate({
      attemptId: selectedKycAttempt.id,
      status: updateStatus as KycStatus, // Cast as KycStatus because '' is not valid for mutation
      rejectionReason: updateStatus === 'rejected' ? rejectionReason : undefined,
      adminNotes: adminNotes,
    });
  };

  const columns: ColumnDef<KycAttempt>[] = [
    { accessorKey: "id", header: "Attempt ID" },
    { accessorKey: "user_id", header: "User ID" }, // TODO: Fetch and show username/email
    { 
      accessorKey: "status", 
      header: "Status",
      cell: ({ row }) => <KycStatusDisplay status={row.original.status} />
    },
    { 
      accessorKey: "documents", 
      header: "Documents",
      cell: ({ row }) => row.original.documents.length 
    },
    { 
      accessorKey: "created_at", 
      header: "Submitted At",
      cell: ({ row }) => format(new Date(row.original.created_at), "PPpp")
    },
    { 
      accessorKey: "updated_at", 
      header: "Last Updated",
      cell: ({ row }) => format(new Date(row.original.updated_at), "PPpp")
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => handleViewDetails(row.original)}>
          <FileSearch className="mr-2 h-4 w-4" /> View/Update
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: kycAttempts,
    columns,
    pageCount: pageCount,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
  });


  if (error) return <AdminPageLayout title="KYC Management"><div className="text-red-500 p-4">Error loading KYC attempts: {error.message}</div></AdminPageLayout>;

  return (
    <AdminPageLayout title="KYC Management" headerActions={<Button onClick={() => refetch()} disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Refresh Data</Button>}>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg shadow">
          <Input
            placeholder="Search by User ID or Attempt ID..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="max-w-sm"
          />
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {(Object.keys(KycDocumentTypeEnum) as Array<keyof typeof KycDocumentTypeEnum>).map(key => (
                <SelectItem key={KycDocumentTypeEnum[key]} value={KycDocumentTypeEnum[key]}>
                  {KycDocumentTypeEnum[key].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { setPagination(prev => ({ ...prev, pageIndex: 0 })); refetch(); }} disabled={isLoading}>
            Apply Filters
          </Button>
        </div>

        {isLoading && kycAttempts.length === 0 ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading KYC attempts...</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <DataTable table={table} columns={columns} isLoading={isLoading} />
            </CardContent>
          </Card>
        )}
        
        {/* Pagination Controls (Simplified example, use DataTable's built-in or custom component) */}
         <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span className="text-sm">
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

      </div>

      {/* Modal for Viewing/Updating KYC Attempt */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>KYC Attempt Details: {selectedKycAttempt?.id}</DialogTitle>
            <DialogDescription>User ID: {selectedKycAttempt?.user_id}</DialogDescription>
          </DialogHeader>
          {selectedKycAttempt && (
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-semibold mb-2">Submitted Documents:</h4>
                {selectedKycAttempt.documents.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedKycAttempt.documents.map(doc => (
                      <li key={doc.id} className="border p-2 rounded-md">
                        <p>Type: <Badge variant="secondary">{doc.document_type.replace(/_/g, ' ')}</Badge></p>
                        <p>Status: <Badge variant={doc.status === 'approved' ? 'default' : doc.status === 'rejected' ? 'destructive' : 'outline'}>{doc.status}</Badge></p>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">View Document</a>
                        {doc.rejection_reason && <p className="text-red-500 text-xs">Reason: {doc.rejection_reason}</p>}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-muted-foreground">No documents submitted.</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current-status">Current Status</Label>
                  <Input id="current-status" value={selectedKycAttempt.status.replace(/_/g, ' ')} readOnly className="bg-muted" />
                </div>
                 <div>
                  <Label htmlFor="update-status">Update Status</Label>
                  <Select value={updateStatus} onValueChange={(value) => setUpdateStatus(value as KycStatus)}>
                    <SelectTrigger id="update-status">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                       {(Object.keys(KycDocumentTypeEnum) as Array<keyof typeof KycDocumentTypeEnum>).map(key => (
                          <SelectItem key={KycDocumentTypeEnum[key]} value={KycDocumentTypeEnum[key]}>
                            {KycDocumentTypeEnum[key].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {updateStatus === 'rejected' && (
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                  />
                </div>
              )}
              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes for this attempt..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitUpdate} disabled={updateKycMutation.isPending || !updateStatus}>
              {updateKycMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default KycManagementPage;

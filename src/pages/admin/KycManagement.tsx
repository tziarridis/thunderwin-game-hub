import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KycRequest, KycStatus, KycStatusEnum, KycDocumentTypeEnum } from '@/types/kyc';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, CheckCircle, XCircle, Edit, AlertTriangle, Search, FileText, Clock, UserCircle } from 'lucide-react';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import { formatDistanceToNow, parseISO } from 'date-fns';
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog';


const fetchKycRequests = async (searchTerm: string = '', statusFilter: KycStatus | '' = ''): Promise<KycRequest[]> => {
  let query = supabase
    .from('kyc_requests')
    .select(`
      *,
      user:users (id, email, full_name) 
    `)
    .order('submitted_at', { ascending: false });

  if (searchTerm) {
    query = query.or(`user.email.ilike.%${searchTerm}%,user.full_name.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`);
  }
  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching KYC requests:', error);
    toast.error(`Failed to fetch KYC requests: ${error.message}`);
    throw new Error('Failed to fetch KYC requests');
  }
  return (data || []) as KycRequest[];
};

const KycManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<KycStatus>(KycStatusEnum.PENDING);
  const [rejectionReason, setRejectionReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<KycStatus | ''>('');

  const { data: kycRequests = [], isLoading: isLoadingKyc, error: kycError, refetch } = useQuery<KycRequest[], Error>({
    queryKey: ['kycRequests', searchTerm, statusFilter],
    queryFn: () => fetchKycRequests(searchTerm, statusFilter),
  });

  const updateKycStatusMutation = useMutation<KycRequest, Error, { id: string; status: KycStatus; rejection_reason?: string; notes?: string }>({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from('kyc_requests')
        .update({ 
          status: payload.status,
          rejection_reason: payload.rejection_reason,
          notes: payload.notes, // formerly review_notes
          reviewed_at: new Date().toISOString(),
          // reviewed_by: authUser.id // Get current admin user ID
        })
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      return data as KycRequest;
    },
    onSuccess: (data) => {
      toast.success(`KYC Request ${data.id} status updated to ${data.status}.`);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['kycRequests'] });
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error(`Failed to update KYC status: ${error.message}`);
    },
  });

  const handleOpenReviewModal = (request: KycRequest) => {
    setSelectedRequest(request);
    setReviewStatus(request.status);
    setRejectionReason(request.rejection_reason || '');
    setInternalNotes(request.notes || '');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedRequest) return;
    if ((reviewStatus === KycStatusEnum.REJECTED || reviewStatus === KycStatusEnum.RESUBMIT) && !rejectionReason.trim()) {
      toast.error('Rejection reason is required for this status.');
      return;
    }
    updateKycStatusMutation.mutate({
      id: selectedRequest.id,
      status: reviewStatus,
      rejection_reason: (reviewStatus === KycStatusEnum.REJECTED || reviewStatus === KycStatusEnum.RESUBMIT) ? rejectionReason : undefined,
      notes: internalNotes || undefined,
    });
  };

  const getStatusBadge = (status: KycStatus) => {
    switch (status) {
      case KycStatusEnum.APPROVED:
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Approved</Badge>;
      case KycStatusEnum.PENDING:
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
      case KycStatusEnum.REJECTED:
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>;
      case KycStatusEnum.RESUBMIT:
        return <Badge variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50"><AlertTriangle className="mr-1 h-3 w-3" /> Resubmit</Badge>;
      case KycStatusEnum.NOT_SUBMITTED:
         return <Badge variant="outline"><FileText className="mr-1 h-3 w-3" /> Not Submitted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const filteredKycRequests = useMemo(() => {
    // Client-side filtering if server-side is commented out
    return kycRequests.filter(req => {
        const matchesSearch = searchTerm ? 
            (req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
             req.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             req.id.toLowerCase().includes(searchTerm.toLowerCase())) 
            : true;
        const matchesStatus = statusFilter ? req.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });
  }, [kycRequests, searchTerm, statusFilter]);


  return (
    <div className="p-6">
      <CMSPageHeader
        title="KYC Management"
        description="Review and manage user KYC submissions."
      />
      
      {kycError && (
        <div className="my-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Database Error</p>
          <p>{kycError.message}</p>
        </div>
      )}

      <div className="my-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Input
            placeholder="Search by User Email, Name, or Request ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={!!kycError}
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as KycStatus | '')} disabled={!!kycError}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {Object.values(KycStatusEnum).map(status => (
              <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoadingKyc && !kycError && <p>Loading KYC requests...</p>}
      
      {!isLoadingKyc && !kycError && filteredKycRequests.length === 0 && (
         <div className="text-center py-10 text-muted-foreground">
            <FileText size={48} className="mx-auto mb-4" />
            <p className="text-lg">No KYC requests match your criteria.</p>
            <p>Try adjusting your search or filters.</p>
        </div>
      )}

      {!isLoadingKyc && !kycError && filteredKycRequests.length > 0 && (
        <div className="bg-card p-4 rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKycRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground"/> 
                        <div>
                            <div className="font-medium">{request.user?.full_name || request.user_id}</div>
                            <div className="text-xs text-muted-foreground">{request.user?.email}</div>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>{request.document_type.toString().toUpperCase().replace('_', ' ')}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(parseISO(request.submitted_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenReviewModal(request)}>
                      <Eye className="mr-2 h-4 w-4" /> Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedRequest && (
        <Dialog open={isReviewModalOpen} onOpenChange={(isOpen) => {
            if (!isOpen) {
                setSelectedRequest(null);
                setIsReviewModalOpen(false);
            } else {
                setIsReviewModalOpen(true);
            }
        }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Review KYC Request: {selectedRequest.id}</DialogTitle>
              <DialogDescription>
                User: {selectedRequest.user?.full_name || selectedRequest.user_id} ({selectedRequest.user?.email})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-semibold mb-2">Documents:</h4>
                {/* Basic display, can be enhanced with image previews */}
                {selectedRequest.document_front_url && <a href={selectedRequest.document_front_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block">View Front Document</a>}
                {selectedRequest.document_back_url && <a href={selectedRequest.document_back_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block">View Back Document</a>}
                {selectedRequest.selfie_url && <a href={selectedRequest.selfie_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block">View Selfie</a>}
                 {!selectedRequest.document_front_url && !selectedRequest.document_back_url && !selectedRequest.selfie_url && <p className="text-sm text-muted-foreground">No documents uploaded for this request (or URLs are missing).</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Update Status</Label>
                <Select value={reviewStatus} onValueChange={(value) => setReviewStatus(value as KycStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(KycStatusEnum)
                      .filter(s => s !== KycStatusEnum.NOT_SUBMITTED) // Cannot manually set to not_submitted
                      .map(status => (
                      <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(reviewStatus === KycStatusEnum.REJECTED || reviewStatus === KycStatusEnum.RESUBMIT) && (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Rejection Reason (Required)</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why the request is rejected or needs resubmission..."
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes (Optional)</Label>
                <Textarea
                  id="internalNotes"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add any internal notes for this review..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitReview} disabled={updateKycStatusMutation.isPending}>
                {updateKycStatusMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default KycManagement;

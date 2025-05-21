
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Corrected import path
import { KycRequest, KycStatusEnum, KycDocumentTypeEnum } from '@/types/kyc';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Eye, CheckCircle, XCircle, RefreshCw, FileText, UserCircle2 } from 'lucide-react';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const KycManagement = () => {
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<KycStatusEnum | ''>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<KycStatusEnum | 'all'>('all');
  const [filterDocumentType, setFilterDocumentType] = useState<KycDocumentTypeEnum | 'all'>('all');
  const [sortBy, setSortBy] = useState<keyof KycRequest>('submitted_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchKycRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase.from('kyc_requests').select(`
        *,
        user:users (id, email, full_name)
      `); // Changed from supabaseClient to supabase

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      if (filterDocumentType !== 'all') {
        query = query.eq('document_type', filterDocumentType);
      }
      if (searchTerm) {
        // This is a simplified search. For more complex search, consider a textSearch function in Supabase.
        query = query.or(`user_id.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%,rejection_reason.ilike.%${searchTerm}%`);
        // If user names/emails are in a related table, you'd search there too.
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error: dbError } = await query;

      if (dbError) throw dbError;
      setKycRequests(data as KycRequest[] || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KYC requests.');
      toast.error('Error fetching KYC requests', { description: err.message });
      console.error("Error fetching KYC requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKycRequests();
  }, [filterStatus, filterDocumentType, sortBy, sortOrder, searchTerm]); // Added searchTerm to dependencies

  const handleReview = (request: KycRequest) => {
    setSelectedRequest(request);
    setReviewStatus(request.status as KycStatusEnum || ''); // Initialize with current status
    setRejectionReason(request.rejection_reason || '');
    setReviewNotes(request.notes || '');
    setIsReviewModalOpen(true);
  };

  const submitReview = async () => {
    if (!selectedRequest || !reviewStatus) {
      toast.warning('Please select a status for the review.');
      return;
    }
    if (reviewStatus === KycStatusEnum.REJECTED && !rejectionReason.trim()) {
      toast.warning('Please provide a rejection reason.');
      return;
    }

    setIsLoading(true);
    try {
      const updateData: Partial<KycRequest> = {
        status: reviewStatus,
        reviewed_at: new Date().toISOString(),
        // reviewed_by: 'admin_user_id', // This should be the ID of the logged-in admin
        rejection_reason: reviewStatus === KycStatusEnum.REJECTED ? rejectionReason : null,
        notes: reviewNotes,
      };

      const { error: updateError } = await supabase // Changed from supabaseClient to supabase
        .from('kyc_requests')
        .update(updateData)
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      toast.success('KYC request updated successfully.');
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      fetchKycRequests(); // Refresh the list
    } catch (err: any) {
      toast.error('Failed to update KYC request.', { description: err.message });
      console.error("Error updating KYC request:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: KycStatus) => {
    switch (status) {
      case KycStatusEnum.APPROVED: return 'success';
      case KycStatusEnum.PENDING: return 'default';
      case KycStatusEnum.REJECTED: return 'destructive';
      case KycStatusEnum.RESUBMIT: return 'warning';
      default: return 'secondary';
    }
  };

  const getDocumentTypeFriendlyName = (docType: KycDocumentType | string) => {
    switch (docType) {
        case KycDocumentTypeEnum.PASSPORT: return 'Passport';
        case KycDocumentTypeEnum.NATIONAL_ID: return 'National ID';
        case KycDocumentTypeEnum.DRIVING_LICENSE: return 'Driving License';
        case KycDocumentTypeEnum.UTILITY_BILL: return 'Utility Bill';
        case KycDocumentTypeEnum.BANK_STATEMENT: return 'Bank Statement';
        default: return docType;
    }
  };

  const renderDocumentLink = (url: string | null | undefined, label: string) => {
    if (!url) return <span className="text-muted-foreground">Not Provided</span>;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
        <FileText className="w-4 h-4 mr-1" /> {label}
      </a>
    );
  };
  
  const memoizedKycRequests = useMemo(() => {
    // This is where client-side filtering/sorting would go if not handled by Supabase query
    // For now, it just returns kycRequests as Supabase query handles it.
    return kycRequests;
  }, [kycRequests]);


  return (
    <AdminPageLayout title="KYC Management" description="Review and manage user KYC submissions.">
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search by User ID, notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as KycStatusEnum | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(KycStatusEnum).map(status => (
              <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDocumentType} onValueChange={(value) => setFilterDocumentType(value as KycDocumentTypeEnum | 'all')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Document Types</SelectItem>
            {Object.values(KycDocumentTypeEnum).map(docType => (
              <SelectItem key={docType} value={docType}>{getDocumentTypeFriendlyName(docType)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={fetchKycRequests} variant="outline" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading && !memoizedKycRequests.length && <p className="text-center py-8">Loading KYC requests...</p>}
      {error && <p className="text-red-500 text-center py-8">Error: {error}</p>}
      {!isLoading && !error && memoizedKycRequests.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No KYC requests found matching your criteria.</p>
      )}

      {!error && memoizedKycRequests.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              {/* Add sorting controls to headers if needed */}
              <TableHead>User</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Reviewed At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memoizedKycRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  <div className="flex items-center">
                    <UserCircle2 className="w-5 h-5 mr-2 text-muted-foreground" />
                    <div>
                      <div>{req.user?.full_name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">{req.user?.email || req.user_id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getDocumentTypeFriendlyName(req.document_type)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(req.status)}>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</Badge>
                </TableCell>
                <TableCell>{new Date(req.submitted_at).toLocaleString()}</TableCell>
                <TableCell>{req.reviewed_at ? new Date(req.reviewed_at).toLocaleString() : 'N/A'}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleReview(req)}>
                    <Eye className="w-4 h-4 mr-1" /> Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedRequest && (
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review KYC Request</DialogTitle>
            </DialogHeader>
            <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Request Details</h3>
                <p><strong>User ID:</strong> {selectedRequest.user_id}</p>
                 <p><strong>User Email:</strong> {selectedRequest.user?.email || 'N/A'}</p>
                <p><strong>Document Type:</strong> {getDocumentTypeFriendlyName(selectedRequest.document_type)}</p>
                <p><strong>Submitted At:</strong> {new Date(selectedRequest.submitted_at).toLocaleString()}</p>
                <p><strong>Current Status:</strong> <Badge variant={getStatusBadgeVariant(selectedRequest.status)}>{selectedRequest.status}</Badge></p>
                
                <h3 className="font-semibold mt-4 mb-2">Documents</h3>
                <div className="space-y-2">
                    {renderDocumentLink(selectedRequest.document_front_url, 'Document Front')}
                    {renderDocumentLink(selectedRequest.document_back_url, 'Document Back')}
                    {renderDocumentLink(selectedRequest.selfie_url, 'Selfie')}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Review Action</h3>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="reviewStatus">New Status</Label>
                        <Select value={reviewStatus} onValueChange={(value) => setReviewStatus(value as KycStatusEnum)}>
                            <SelectTrigger id="reviewStatus">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                            {Object.values(KycStatusEnum).map(s => (
                                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {reviewStatus === KycStatusEnum.REJECTED && (
                        <div>
                            <Label htmlFor="rejectionReason">Rejection Reason</Label>
                            <Textarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Provide a reason for rejection"
                            />
                        </div>
                    )}
                    <div>
                        <Label htmlFor="reviewNotes">Internal Notes</Label>
                        <Textarea
                        id="reviewNotes"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add internal notes (optional)"
                        />
                    </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={submitReview} disabled={isLoading}>
                {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                {reviewStatus === KycStatusEnum.APPROVED ? <CheckCircle className="w-4 h-4 mr-2"/> : 
                 reviewStatus === KycStatusEnum.REJECTED ? <XCircle className="w-4 h-4 mr-2"/> : null}
                Submit Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminPageLayout>
  );
};

export default KycManagement;

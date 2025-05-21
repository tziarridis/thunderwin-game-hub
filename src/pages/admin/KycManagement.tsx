import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KycRequest, KycStatus, KycDocument, KycRequestUpdatePayload } from '@/types/kyc'; // Ensure types are correct
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Search, Filter, Eye, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type KycRequestWithUser = KycRequest & { user_email?: string; user_name?: string };

const ITEMS_PER_PAGE = 10;

const KycManagementPage = () => {
  const [requests, setRequests] = useState<KycRequestWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<KycRequestWithUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<KycStatus | ''>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<KycStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

  const fetchKycRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('kyc_requests') // Assuming 'kyc_requests' is your table name
        .select(`
          *,
          user:users (email, username)
        `, { count: 'exact' }) // Fetch user email for display
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (searchTerm) {
        // This part needs to search user email/name - requires an RPC or more complex query
        // For now, it might only search fields directly on kyc_requests table if user isn't joined for search term
         query = query.or(`id.ilike.%${searchTerm}%`); // Example search on request ID
      }

      const { data, error, count } = await query;
      if (error) throw error;
      
      const formattedData = data.map(req => ({
        ...req,
        user_email: (req.user as any)?.email, // Type assertion for user
        user_name: (req.user as any)?.username,
      })) as KycRequestWithUser[];

      setRequests(formattedData);
      setTotalRequests(count || 0);
    } catch (error: any) {
      toast.error("Failed to fetch KYC requests: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    fetchKycRequests();
  }, [fetchKycRequests]);

  const openReviewModal = (request: KycRequestWithUser) => {
    setSelectedRequest(request);
    setUpdateStatus(request.status || '');
    setRejectionReason(request.rejection_reason || '');
    setReviewNotes(request.review_notes || '');
    setIsModalOpen(true);
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest || !updateStatus) return;
    setIsLoading(true);
    
    const payload: KycRequestUpdatePayload = {
      status: updateStatus,
      rejection_reason: updateStatus === 'rejected' ? rejectionReason : null,
      review_notes: reviewNotes || null,
      reviewed_by: 'admin_user_id', // Replace with actual admin user ID
      reviewed_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('kyc_requests')
        .update(payload)
        .eq('id', selectedRequest.id);
      
      if (error) throw error;

      // Also update user's KYC status (e.g., in 'users' or 'profiles' table)
      // This depends on your schema
      // Example:
      // await supabase.from('users').update({ kyc_status: updateStatus }).eq('id', selectedRequest.user_id);

      toast.success(`KYC request ${updateStatus}.`);
      fetchKycRequests();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error("Failed to update KYC request: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderDocument = (doc: KycDocument) => (
    <div key={doc.id || doc.file_name} className="mb-2 p-2 border rounded-md">
        <p className="font-medium text-sm capitalize">{doc.document_type?.replace('_', ' ') || 'Document'}</p>
        <p className="text-xs text-muted-foreground">File: {doc.file_name}</p>
        {doc.file_url && (
            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                View Document
            </a>
        )}
    </div>
  );

  const user = { aud: '' }; // Placeholder for user object if needed for `aud`

  return (
    <AdminPageLayout title="KYC Management">
       <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
         <div className="relative w-full sm:w-auto">
            <Input
                type="text"
                placeholder="Search by User ID, Email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 w-full sm:w-64 bg-background"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
         </div>
         <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value as KycStatus | 'all'); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="resubmit_required">Resubmit Required</SelectItem>
            </SelectContent>
         </Select>
       </div>

      {isLoading && requests.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead> {/* e.g., ID, Address Proof */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="font-medium">{req.user_name || req.user_id}</div>
                    <div className="text-xs text-muted-foreground">{req.user_email}</div>
                  </TableCell>
                  <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      req.status === 'approved' ? 'success' :
                      req.status === 'rejected' ? 'destructive' :
                      req.status === 'pending' ? 'secondary' :
                      'outline' // for resubmit_required or other
                    }>
                      {req.status?.replace('_', ' ') || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {/* Display document types submitted */}
                    {req.documents?.map(d => d.document_type).join(', ').replace('_', ' ') || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openReviewModal(req)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
         {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
            <Button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1 || isLoading}
                variant="outline"
            >
                Previous
            </Button>
            <span className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalRequests / ITEMS_PER_PAGE)}
            </span>
            <Button 
                onClick={() => setCurrentPage(p => p + 1)} 
                disabled={currentPage * ITEMS_PER_PAGE >= totalRequests || isLoading}
                variant="outline"
            >
                Next
            </Button>
        </div>
        </>
      )}
       {!isLoading && requests.length === 0 && (
        <p className="text-center py-10 text-muted-foreground">No KYC requests found matching your criteria.</p>
      )}


      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px] bg-card">
          <DialogHeader>
            <DialogTitle>Review KYC Request</DialogTitle>
            <DialogDescription>
              User: {selectedRequest?.user_name || selectedRequest?.user_id} ({selectedRequest?.user_email})
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4 max-h-[70vh] overflow-y-auto pr-2 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Submitted Documents:</h4>
                {selectedRequest.documents && selectedRequest.documents.length > 0 ? (
                    selectedRequest.documents.map(doc => renderDocument(doc as KycDocument)) // Cast to KycDocument
                ) : <p className="text-sm text-muted-foreground">No documents submitted with this request.</p>}
              </div>
               {selectedRequest.user_details && typeof selectedRequest.user_details === 'object' && Object.keys(selectedRequest.user_details).length > 0 && (
                <div>
                    <h4 className="font-semibold mb-1">User Provided Details:</h4>
                    <pre className="text-xs bg-muted p-2 rounded-md whitespace-pre-wrap">
                        {JSON.stringify(selectedRequest.user_details, null, 2)}
                    </pre>
                </div>
               )}


              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1">Update Status</label>
                <Select value={updateStatus || ''} onValueChange={(value) => setUpdateStatus(value as KycStatus)}>
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                    <SelectItem value="resubmit_required">Request Resubmission</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {updateStatus === 'rejected' && (
                <div>
                  <label htmlFor="rejectionReason" className="block text-sm font-medium mb-1">Rejection Reason</label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection"
                    className="bg-input"
                  />
                </div>
              )}
              
              <div>
                  <label htmlFor="reviewNotes" className="block text-sm font-medium mb-1">Internal Review Notes</label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add internal notes (optional)"
                    className="bg-input"
                  />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateRequest} disabled={isLoading || !updateStatus}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {updateStatus === 'approved' ? <CheckCircle className="mr-2 h-4 w-4"/> : 
               updateStatus === 'rejected' ? <XCircle className="mr-2 h-4 w-4"/> :
               <Edit className="mr-2 h-4 w-4"/> 
              }
              Submit Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default KycManagementPage;

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KycSubmission, KycStatus as KycStatusType } from '@/types/kyc'; // Renamed KycStatus to KycStatusType
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Eye, CheckCircle, XCircle, Clock, Loader2, Filter } from 'lucide-react';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import { kycService } from '@/services/kycService';

const ITEMS_PER_PAGE = 10;

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null; // User associated with the KYC
  submission?: KycSubmission | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, user, submission }) => {
  if (!user || !submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>KYC Submission Details</DialogTitle>
          <DialogDescription>Reviewing submission for {user.username || user.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
          <h4 className="font-semibold">User Information</h4>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username || 'N/A'}</p>
          
          <hr className="my-4"/>
          <h4 className="font-semibold">Submission Details (ID: {submission.id})</h4>
          <p><strong>Status:</strong> <Badge variant={
              submission.status === 'approved' ? 'success' : 
              submission.status === 'rejected' ? 'destructive' : 
              submission.status === 'pending' ? 'secondary' : 'outline'
            }>{submission.status.toUpperCase()}</Badge>
          </p>
          <p><strong>Submitted At:</strong> {new Date(submission.submitted_at).toLocaleString()}</p>
          {submission.reviewed_at && <p><strong>Reviewed At:</strong> {new Date(submission.reviewed_at).toLocaleString()}</p>}
          {submission.reviewed_by && <p><strong>Reviewed By:</strong> {submission.reviewed_by}</p>}
          {submission.rejection_reason && <p><strong>Rejection Reason:</strong> {submission.rejection_reason}</p>}
          {submission.notes && <p><strong>Admin Notes:</strong> {submission.notes}</p>}
          
          <hr className="my-4"/>
          <h4 className="font-semibold">Submitted Documents & Data</h4>
          {/* Display form_data fields; ensure sensitive data is handled appropriately */}
          {submission.form_data && typeof submission.form_data === 'object' && Object.entries(submission.form_data).map(([key, value]) => (
            <p key={key}><strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {String(value)}</p>
          ))}

          {submission.document_urls && submission.document_urls.length > 0 && (
            <div>
              <h5 className="font-medium mt-2">Document Links:</h5>
              <ul className="list-disc list-inside">
                {submission.document_urls.map((url, index) => (
                  <li key={index}><a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Document {index + 1}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


const AdminKycManagement: React.FC = () => {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [usersData, setUsersData] = useState<Record<string, User>>({}); // Store user data by user_id
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<KycStatusType | 'all'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  const fetchKycSubmissions = useCallback(async (page: number, status: KycStatusType | 'all') => {
    setIsLoading(true);
    try {
      const { data, error, count } = await kycService.getSubmissions({
        page,
        limit: ITEMS_PER_PAGE,
        status: status === 'all' ? undefined : status,
      });

      if (error) throw error;
      setSubmissions(data || []);
      setTotalSubmissions(count || 0);

      // Fetch user details for the submissions if not already fetched
      const userIdsToFetch = (data || [])
        .map(s => s.user_id)
        .filter(id => !usersData[id]);
      
      if (userIdsToFetch.length > 0) {
        // This is a simplified fetch; in reality, you might have a userService.getUsersByIds
        const { data: fetchedUsers, error: userError } = await supabase
          .from('users') // Assuming 'users' table
          .select('id, username, email') // Select fields you need
          .in('id', userIdsToFetch);
        
        if (userError) throw userError;

        const newUsersData = { ...usersData };
        (fetchedUsers || []).forEach(u => newUsersData[u.id] = u as User);
        setUsersData(newUsersData);
      }

    } catch (error: any) {
      toast.error(`Failed to fetch KYC submissions: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [usersData]); // Add usersData as dependency

  useEffect(() => {
    fetchKycSubmissions(currentPage, filterStatus);
  }, [fetchKycSubmissions, currentPage, filterStatus]);

  const handleUpdateStatus = async (submissionId: string, newStatus: KycStatusType, rejectionReason?: string) => {
    setIsLoading(true);
    try {
      await kycService.updateSubmissionStatus(submissionId, newStatus, rejectionReason); // Pass adminId if needed by service
      toast.success(`KYC submission status updated to ${newStatus}.`);
      fetchKycSubmissions(currentPage, filterStatus); // Refresh list
      if (selectedSubmission?.id === submissionId) { // If updating the currently viewed submission
        setSelectedSubmission(prev => prev ? {...prev, status: newStatus, rejection_reason: rejectionReason} : null);
      }
    } catch (error: any) {
      toast.error(`Failed to update status: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openDetailsModal = (submission: KycSubmission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
  };
  
  const getStatusBadgeVariant = (status: KycStatusType) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const totalPages = Math.ceil(totalSubmissions / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto p-4">
      <CMSPageHeader
        title="KYC Management"
        description="Review and manage user KYC submissions."
      />

      <div className="mb-4 flex items-center space-x-4 p-4 border rounded-lg bg-card shadow-sm">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value as KycStatusType | 'all'); setCurrentPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="resubmission_required">Resubmission Required</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading && submissions.length === 0 && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}

      {submissions.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Reviewed At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => {
                const user = usersData[submission.user_id];
                return (
                  <TableRow key={submission.id}>
                    <TableCell>{user?.username || user?.email || submission.user_id.substring(0,8)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(submission.status)}>
                        {submission.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(submission.submitted_at).toLocaleString()}</TableCell>
                    <TableCell>{submission.reviewed_at ? new Date(submission.reviewed_at).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell className="space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openDetailsModal(submission)} title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {submission.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(submission.id, 'approved')} title="Approve">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                              const reason = prompt("Enter rejection reason (optional):");
                              if (reason !== null) { // User didn't cancel prompt
                                handleUpdateStatus(submission.id, 'rejected', reason || undefined);
                              }
                            }} title="Reject">
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
       {!isLoading && submissions.length === 0 && (
         <p className="text-center text-muted-foreground py-6">No KYC submissions found for the selected filter.</p>
       )}


      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
            <Button 
                onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
                disabled={currentPage === 1 || isLoading}
                variant="outline"
            >
                Previous
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
                disabled={currentPage === totalPages || isLoading}
                variant="outline"
            >
                Next
            </Button>
        </div>
      )}
      
      {selectedSubmission && usersData[selectedSubmission.user_id] && (
        <UserDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          submission={selectedSubmission}
          user={usersData[selectedSubmission.user_id]}
        />
      )}
    </div>
  );
};

export default AdminKycManagement;

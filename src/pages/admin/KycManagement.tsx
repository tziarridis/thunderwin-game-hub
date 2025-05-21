
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { KycRequestWithUser, KycStatus, KycRequestUpdatePayload } from '@/types/kyc';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Eye, CheckCircle, XCircle, Search, Filter, Edit } from 'lucide-react';
import { Label } from '@/components/ui/label';

const KYC_REQUESTS_QUERY_KEY = 'admin_kyc_requests';

const KycManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<KycStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<KycRequestWithUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatePayload, setUpdatePayload] = useState<Partial<KycRequestUpdatePayload>>({});

  const { data: kycRequests = [], isLoading } = useQuery<KycRequestWithUser[], Error>(
    [KYC_REQUESTS_QUERY_KEY, searchTerm, filterStatus],
    async () => {
      // Assuming your Supabase table is named 'kyc_requests' and has a 'user_id' foreign key to 'users' or 'profiles'
      // Adjust the select query for user details as per your schema.
      let query = supabase
        .from('kyc_requests') // Ensure this table name is correct in your Supabase schema
        .select(`
          *,
          user:profiles (id, email, username, first_name, last_name)
        `); // Change 'profiles' if your user table is named 'users'

      if (searchTerm) {
        // This is a basic search. For searching user email/name, you might need a more complex query or function.
        query = query.or(`id.ilike.%${searchTerm}%,user_id.ilike.%${searchTerm}%`);
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query.order('submitted_at', { ascending: false });
      if (error) {
        console.error("Error fetching KYC requests:", error);
        throw error;
      }
      return data as KycRequestWithUser[];
    }
  );
  
  const updateKycMutation = useMutation<any, Error, { id: string; payload: KycRequestUpdatePayload }>(
    async ({ id, payload }) => {
      const { data, error } = await supabase
        .from('kyc_requests')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([KYC_REQUESTS_QUERY_KEY]);
        toast.success('KYC request updated successfully.');
        setIsModalOpen(false);
        setSelectedRequest(null);
      },
      onError: (error) => {
        toast.error(`Failed to update KYC request: ${error.message}`);
      },
    }
  );

  const handleViewDetails = (request: KycRequestWithUser) => {
    setSelectedRequest(request);
    setUpdatePayload({ status: request.status, rejection_reason: request.rejection_reason || '', notes: request.notes || '' });
    setIsModalOpen(true);
  };

  const handleSaveChanges = () => {
    if (selectedRequest && updatePayload) {
        const payloadToSend: KycRequestUpdatePayload = {
            status: updatePayload.status,
            rejection_reason: updatePayload.rejection_reason || null, // Send null if empty
            notes: updatePayload.notes || null, // Send null if empty
        };
      updateKycMutation.mutate({ id: selectedRequest.id, payload: payloadToSend });
    }
  };
  
  const getStatusBadgeColor = (status: KycStatus) => {
    switch (status) {
      case KycStatus.VERIFIED: return "bg-green-500";
      case KycStatus.PENDING: return "bg-yellow-500";
      case KycStatus.REJECTED: return "bg-red-500";
      case KycStatus.ACTION_REQUIRED: return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const kycStatuses = Object.values(KycStatus);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">KYC Management</h1>

      <div className="mb-6 p-4 bg-card rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Input
          type="search"
          placeholder="Search by Request ID or User ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as KycStatus | 'all')}>
          <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {kycStatuses.map(status => (
              <SelectItem key={status} value={status}>{status.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <p>Loading KYC requests...</p> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reviewed At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kycRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div>{request.user?.username || request.user?.email || request.user_id}</div>
                  <div className="text-xs text-muted-foreground">{request.user_id}</div>
                </TableCell>
                <TableCell>{request.submitted_at ? format(parseISO(request.submitted_at), 'PPpp') : 'N/A'}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusBadgeColor(request.status)} text-white hover:${getStatusBadgeColor(request.status)}`}>
                    {request.status.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{request.reviewed_at ? format(parseISO(request.reviewed_at), 'PPpp') : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(request)}>
                    <Eye className="mr-1 h-4 w-4" /> View/Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {kycRequests.length === 0 && !isLoading && <p className="text-center py-4">No KYC requests found.</p>}

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
          if (!isOpen) setSelectedRequest(null);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>KYC Request Details: {selectedRequest?.id}</DialogTitle>
            <DialogDescription>
              User: {selectedRequest?.user?.email || selectedRequest?.user_id}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <p><strong>Current Status:</strong> {selectedRequest.status.replace(/_/g, ' ')}</p>
              {selectedRequest.first_name && <p><strong>Name:</strong> {selectedRequest.first_name} {selectedRequest.last_name}</p>}
              {selectedRequest.date_of_birth && <p><strong>DOB:</strong> {format(parseISO(selectedRequest.date_of_birth), 'P')}</p>}
              {/* Display documents if available */}
              {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                <div>
                  <strong>Documents:</strong>
                  <ul className="list-disc pl-5">
                    {selectedRequest.documents.map(doc => (
                      <li key={doc.id}><a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{doc.document_type} - {doc.file_name || 'View Document'}</a></li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="kycStatus">Update Status</Label>
                <Select
                  value={updatePayload.status || selectedRequest.status}
                  onValueChange={(value) => setUpdatePayload(prev => ({ ...prev, status: value as KycStatus }))}
                >
                  <SelectTrigger id="kycStatus"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {kycStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(updatePayload.status === KycStatus.REJECTED || updatePayload.status === KycStatus.ACTION_REQUIRED) && (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Rejection Reason / Action Required Note</Label>
                  <Textarea
                    id="rejectionReason"
                    value={updatePayload.rejection_reason || ''}
                    onChange={(e) => setUpdatePayload(prev => ({ ...prev, rejection_reason: e.target.value }))}
                    placeholder="Provide clear reason for rejection or required action"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={updatePayload.notes || ''}
                  onChange={(e) => setUpdatePayload(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Internal notes (optional)"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSaveChanges} disabled={updateKycMutation.isLoading}>
              {updateKycMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KycManagementPage;

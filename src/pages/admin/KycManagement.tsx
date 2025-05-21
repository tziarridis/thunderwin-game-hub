import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client'; // Corrected import path
import { KycRequest, KycStatus as KycStatusType, KycStatusEnum } from '@/types/kyc'; // Assuming KycStatusEnum will be added
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const fetchKycRequests = async (): Promise<KycRequest[]> => {
  const { data, error } = await supabase
    .from('kyc_requests')
    .select(`
      id,
      user_id,
      status,
      document_type,
      document_front_url,
      document_back_url,
      selfie_url,
      submitted_at,
      reviewed_at,
      reviewed_by,
      rejection_reason,
      notes,
      created_at,
      updated_at,
      user:profiles (id, email, full_name)
    `)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching KYC requests:', error);
    throw new Error(error.message);
  }
  // TODO: Fix this type assertion once `profiles` is correctly typed or joined
  return data as unknown as KycRequest[];
};

const KycManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingRequest, setEditingRequest] = useState<KycRequest | null>(null);
  const [newStatus, setNewStatus] = useState<KycStatusType | ''>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');

  const { data: kycRequests, isLoading, error } = useQuery<KycRequest[], Error>({
    queryKey: ['kycRequests'],
    queryFn: fetchKycRequests,
  });

  const updateKycMutation = useMutation<KycRequest, Error, { id: string; status: KycStatusType; rejection_reason?: string; notes?: string }>({
    mutationFn: async ({ id, status, rejection_reason, notes }) => {
      const { data, error } = await supabase
        .from('kyc_requests')
        .update({ 
            status, 
            rejection_reason: status === KycStatusEnum.REJECTED ? rejection_reason : null,
            notes, 
            reviewed_at: new Date().toISOString(), 
            // reviewed_by: 'admin_user_id' // TODO: Get actual admin user ID
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as KycRequest;
    },
    onSuccess: () => {
      toast.success('KYC status updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['kycRequests'] });
      setEditingRequest(null);
      setNewStatus('');
      setRejectionReason('');
      setNotes('');
    },
    onError: (err) => {
      toast.error(`Failed to update KYC status: ${err.message}`);
    },
  });

  const handleEdit = (request: KycRequest) => {
    setEditingRequest(request);
    setNewStatus(request.status);
    setRejectionReason(request.rejection_reason || '');
    setNotes(request.notes || '');
  };

  const handleCancelEdit = () => {
    setEditingRequest(null);
    setNewStatus('');
    setRejectionReason('');
    setNotes('');
  };
  
  const handleSubmitUpdate = () => {
    if (editingRequest && newStatus) {
      updateKycMutation.mutate({
        id: editingRequest.id,
        status: newStatus as KycStatusType, // newStatus is KycStatusType or ''
        rejection_reason: newStatus === KycStatusEnum.REJECTED ? rejectionReason : undefined,
        notes: notes,
      });
    }
  };

  const getStatusBadge = (status: KycStatusType | null | undefined) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    switch (status) {
      case KycStatusEnum.APPROVED:
        return <Badge variant="default" className="bg-green-500 text-white"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case KycStatusEnum.REJECTED:
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      case KycStatusEnum.PENDING:
        return <Badge variant="secondary" className="bg-yellow-500 text-black"><AlertTriangle className="mr-1 h-3 w-3" />Pending</Badge>;
      case KycStatusEnum.RESUBMIT:
         return <Badge variant="outline" className="border-orange-500 text-orange-500"><RefreshCw className="mr-1 h-3 w-3" />Resubmit</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Manage KYC Requests</CardTitle></CardHeader>
          <CardContent><Skeleton className="h-64 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error loading KYC requests: {error.message}</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">KYC Management</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending KYC Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {kycRequests && kycRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.user?.email || req.user_id}</TableCell>
                    <TableCell>{req.document_type}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell>{new Date(req.submitted_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(req)}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No KYC requests found.</p>
          )}
        </CardContent>
      </Card>

      {editingRequest && (
        <Card>
          <CardHeader>
            <CardTitle>Review KYC Request for {editingRequest.user?.email || editingRequest.user_id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Documents:</h3>
              {editingRequest.document_front_url && <a href={editingRequest.document_front_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block">View Document Front</a>}
              {editingRequest.document_back_url && <a href={editingRequest.document_back_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block">View Document Back</a>}
              {editingRequest.selfie_url && <a href={editingRequest.selfie_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block">View Selfie</a>}
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">Update Status</label>
              <Select 
                value={newStatus || undefined}
                onValueChange={(value) => setNewStatus(value as KycStatusType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(KycStatusEnum).map(statusVal => (
                    <SelectItem key={statusVal} value={statusVal}>{statusVal.charAt(0).toUpperCase() + statusVal.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newStatus === KycStatusEnum.REJECTED && (
              <div>
                <label htmlFor="rejectionReason" className="block text-sm font-medium mb-1">Rejection Reason</label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason"
                />
              </div>
            )}
             <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">Review Notes (Optional)</label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter internal notes"
                />
              </div>

            <div className="flex space-x-2">
              <Button onClick={handleSubmitUpdate} disabled={updateKycMutation.isPending || !newStatus}>
                {updateKycMutation.isPending ? 'Updating...' : 'Submit Update'}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KycManagement;

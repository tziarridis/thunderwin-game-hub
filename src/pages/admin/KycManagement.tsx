import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as AppUser } from '@/types/user'; // Using AppUser from user.d.ts
import { KycAttempt, KycDocument, KycStatus, KycDocumentTypeEnum } from '@/types/kyc'; // Corrected imports
import AdminPageLayout, { AdminPageLayoutProps } from '@/components/layout/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, CheckCircle2, XCircle, RefreshCcw, FileText, UserSearch, BadgeHelp } from 'lucide-react';
import { Badge, BadgeProps } from '@/components/ui/badge'; // Import BadgeProps
import { Input } from '@/components/ui/input';

const ITEMS_PER_PAGE = 10;

const getStatusVariant = (status: KycStatus): BadgeProps['variant'] => {
  switch (status) {
    case 'approved':
    case 'verified':
      return 'success';
    case 'rejected':
    case 'failed':
      return 'destructive';
    case 'pending_review':
      return 'secondary'; // Or another color like 'warning' if you add it
    case 'resubmit_required':
      return 'outline'; // Or 'warning'
    default:
      return 'default';
  }
};

const KycManagementPage: React.FC = () => {
  const [kycAttempts, setKycAttempts] = useState<KycAttempt[]>([]);
  const [users, setUsers] = useState<Record<string, Pick<AppUser, 'id' | 'username' | 'email'>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<KycAttempt | null>(null);
  const [updateStatus, setUpdateStatus] = useState<KycStatus | ''>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<KycStatus | 'all'>('all');


  const fetchKycAttempts = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('kyc_attempts')
        .select('*, user:users(id, username, email)', { count: 'exact' });

      if (searchTerm) {
         query = query.or(`user_id.ilike.%${searchTerm}%, notes.ilike.%${searchTerm}%`);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      query = query.order('created_at', { ascending: false }).range(from, to);
      
      const { data, error, count } = await query;
      if (error) throw error;

      const attempts = data as any[]; // Temp cast
      setKycAttempts(attempts as KycAttempt[]);
      setTotalAttempts(count || 0);

      const userMap: Record<string, Pick<AppUser, 'id' | 'username' | 'email'>> = {};
      attempts.forEach(attempt => {
        if (attempt.user) {
          userMap[attempt.user_id] = { 
            id: attempt.user.id, 
            username: attempt.user.username, 
            email: attempt.user.email 
          };
        }
      });
      setUsers(prev => ({...prev, ...userMap}));

    } catch (error: any) {
      toast.error("Failed to load KYC attempts: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    fetchKycAttempts(currentPage);
  }, [fetchKycAttempts, currentPage]);

  const handleSelectAttempt = (attempt: KycAttempt) => {
    setSelectedAttempt(attempt);
    setUpdateStatus(attempt.status || '');
    setRejectionReason((attempt as any).rejection_reason || ''); // Assuming rejection_reason might be a field
    setAdminNotes(attempt.notes || '');
  };

  const handleUpdateAttempt = async () => {
    if (!selectedAttempt || !updateStatus) {
      toast.error("No attempt selected or status chosen.");
      return;
    }
    setIsSubmitting(true);
    try {
      const updatePayload: Partial<KycAttempt> & { rejection_reason?: string } = {
        status: updateStatus,
        notes: adminNotes,
        updated_at: new Date().toISOString(),
      };
      if (updateStatus === 'rejected' || updateStatus === 'resubmit_required') {
        updatePayload.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('kyc_attempts')
        .update(updatePayload)
        .eq('id', selectedAttempt.id);
      
      if (error) throw error;

      // Optionally, update user's main kyc_status if you have one on the users table
      if (updateStatus === 'approved' || updateStatus === 'verified') {
        await supabase.from('users').update({ kyc_status: updateStatus }).eq('id', selectedAttempt.user_id);
      }


      toast.success("KYC attempt updated successfully.");
      fetchKycAttempts(currentPage); // Refresh list
      setSelectedAttempt(prev => prev ? {...prev, ...updatePayload} : null);
    } catch (error: any) {
      toast.error("Failed to update KYC attempt: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const kycPageLayoutProps: AdminPageLayoutProps = {
    title: "KYC Management",
    headerContent: <p className="text-muted-foreground">Review and manage user KYC submissions.</p>
  };
  
  const allKycStatuses: KycStatus[] = ['not_started', 'pending_review', 'approved', 'rejected', 'resubmit_required', 'verified', 'failed'];


  return (
    <AdminPageLayout {...kycPageLayoutProps}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KYC Attempts List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>KYC Submissions</CardTitle>
            <div className="mt-4 flex gap-2">
              <Input 
                placeholder="Search by User ID or Notes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as KycStatus | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {allKycStatuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => fetchKycAttempts(1)}><RefreshCcw className="mr-2 h-4 w-4"/>Refresh</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && kycAttempts.length === 0 ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : kycAttempts.length === 0 ? (
              <p className="text-muted-foreground text-center py-10">No KYC attempts found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kycAttempts.map((attempt) => (
                    <TableRow key={attempt.id} onClick={() => handleSelectAttempt(attempt)} className={`cursor-pointer ${selectedAttempt?.id === attempt.id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                      <TableCell>
                        <div className="font-medium">{users[attempt.user_id]?.username || 'Unknown User'}</div>
                        <div className="text-xs text-muted-foreground">{users[attempt.user_id]?.email || attempt.user_id}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(attempt.status)} className="capitalize">
                          {attempt.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(attempt.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleSelectAttempt(attempt); }}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {/* Pagination */}
            {totalAttempts > ITEMS_PER_PAGE && (
              <div className="flex justify-end items-center space-x-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {Math.ceil(totalAttempts / ITEMS_PER_PAGE)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalAttempts / ITEMS_PER_PAGE), prev + 1))}
                  disabled={currentPage === Math.ceil(totalAttempts / ITEMS_PER_PAGE)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KYC Attempt Details and Actions */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Attempt Details</CardTitle>
            {selectedAttempt && <CardDescription>User: {users[selectedAttempt.user_id]?.username || selectedAttempt.user_id}</CardDescription>}
          </CardHeader>
          <CardContent>
            {isSubmitting && <Loader2 className="animate-spin h-5 w-5 mx-auto mb-4" />}
            {!selectedAttempt ? (
              <p className="text-muted-foreground text-center py-10">Select an attempt to view details.</p>
            ) : (
              <Tabs defaultValue="documents" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                <TabsContent value="documents">
                  <h4 className="font-semibold mb-2 mt-4">Submitted Documents:</h4>
                  {(selectedAttempt.documents && selectedAttempt.documents.length > 0) ? (
                    <ul className="space-y-2">
                      {selectedAttempt.documents.map(doc => (
                        <li key={doc.id} className="border p-2 rounded-md">
                          <p className="text-sm font-medium">{doc.document_type.replace(/_/g, ' ').toUpperCase()}</p>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">View Document</a>
                          <Badge variant={doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'destructive' : 'secondary'} className="ml-2 text-xs capitalize">{doc.status}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents submitted for this attempt.</p>
                  )}
                  <h4 className="font-semibold mb-2 mt-4">Current Status:</h4>
                   <Badge variant={getStatusVariant(selectedAttempt.status)} className="text-base capitalize">
                    {selectedAttempt.status.replace(/_/g, ' ')}
                  </Badge>
                </TabsContent>
                <TabsContent value="actions" className="space-y-4">
                  <div>
                    <Label htmlFor="status-update">Update Status</Label>
                    <Select value={updateStatus} onValueChange={(val) => setUpdateStatus(val as KycStatus)}>
                      <SelectTrigger id="status-update"><SelectValue placeholder="Select new status" /></SelectTrigger>
                      <SelectContent>
                        {allKycStatuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {(updateStatus === 'rejected' || updateStatus === 'resubmit_required') && (
                    <div>
                      <Label htmlFor="rejection-reason">Rejection Reason / Resubmit Instructions</Label>
                      <Textarea id="rejection-reason" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Provide clear reasons or instructions..." />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="admin-notes">Admin Notes (Internal)</Label>
                    <Textarea id="admin-notes" value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add internal notes for this attempt..." />
                  </div>
                  <Button onClick={handleUpdateAttempt} disabled={isSubmitting || !updateStatus} className="w-full">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update KYC Status
                  </Button>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
};

export default KycManagementPage;

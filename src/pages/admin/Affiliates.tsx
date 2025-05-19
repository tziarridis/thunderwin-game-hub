import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Filter, Edit, Trash2, ChevronLeft, ChevronRight, User as UserIcon, DollarSign, BarChart3, Users, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Affiliate, AffiliateStatSummary } from '@/types'; // Assuming these types exist
import { Affiliate, AffiliateStatSummary } from '@/types/affiliate'; // Corrected import
import { User } from '@/types/user'; // For user details
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client'; // For fetching data
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Mock service, replace with actual service calls
const affiliateService = {
  getAffiliates: async (searchTerm?: string): Promise<Affiliate[]> => {
    let query = supabase.from('users').select(`
      id, 
      email, 
      user_metadata, 
      created_at,
      raw_user_meta_data->>'name' as name, 
      raw_user_meta_data->>'affiliate_code' as code, 
      raw_user_meta_data->>'total_commissions' as totalCommissions
    `).eq('raw_user_meta_data->>is_affiliate', 'true'); // Example: filter for affiliates

    if (searchTerm) {
      query = query.or(`email.ilike.%${searchTerm}%,user_metadata->>name.ilike.%${searchTerm}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      userId: item.id,
      name: (item.user_metadata as any)?.name || item.email?.split('@')[0] || 'N/A',
      email: item.email || 'N/A',
      code: (item.user_metadata as any)?.affiliate_code || 'N/A',
      totalCommissions: parseFloat((item.user_metadata as any)?.total_commissions) || 0,
      clicks: parseInt((item.user_metadata as any)?.clicks) || 0,
      signUps: parseInt((item.user_metadata as any)?.sign_ups) || 0,
      depositingUsers: parseInt((item.user_metadata as any)?.depositing_users) || 0,
      createdAt: item.created_at || new Date().toISOString(),
      updatedAt: item.created_at || new Date().toISOString(),
    }));
  },
  getAffiliateStats: async (): Promise<AffiliateStatSummary> => {
    // Mock data, replace with actual aggregation
    return { totalAffiliates: 0, totalCommissionsPaid: 0, newSignUpsThisMonth: 0 };
  },
  createAffiliate: async (data: Partial<Affiliate>): Promise<Affiliate> => {
    // This would typically involve creating/updating a user and setting affiliate flags/data
    console.log('Creating affiliate', data);
    toast.info("Affiliate creation endpoint not fully implemented.");
    return { ...data, id: 'new-id', userId: 'new-user-id', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Affiliate;
  },
  updateAffiliate: async (id: string, data: Partial<Affiliate>): Promise<Affiliate> => {
    console.log('Updating affiliate', id, data);
    toast.info("Affiliate update endpoint not fully implemented.");
    return { ...data, id, userId: id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Affiliate;
  },
  deleteAffiliate: async (id: string): Promise<void> => {
    console.log('Deleting affiliate', id);
    toast.info("Affiliate deletion endpoint not fully implemented.");
  }
};


const AdminAffiliates = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [stats, setStats] = useState<AffiliateStatSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const affiliatesPerPage = 10;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  
  const fetchAffiliatesAndStats = async () => {
    setIsLoading(true);
    try {
      const [affiliateData, statData] = await Promise.all([
        affiliateService.getAffiliates(searchQuery),
        affiliateService.getAffiliateStats()
      ]);
      setAffiliates(affiliateData);
      setStats(statData);
    } catch (error) {
      toast.error("Failed to load affiliate data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliatesAndStats();
  }, [searchQuery]);

  const filteredAffiliates = useMemo(() => {
    // Search is handled by the service now, so this might be simpler
    return affiliates;
  }, [affiliates]);

  const currentAffiliates = useMemo(() => {
    const startIndex = (currentPage - 1) * affiliatesPerPage;
    return filteredAffiliates.slice(startIndex, startIndex + affiliatesPerPage);
  }, [filteredAffiliates, currentPage, affiliatesPerPage]);

  const totalPages = Math.ceil(filteredAffiliates.length / affiliatesPerPage);

  const handleEdit = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this affiliate? This might involve demoting a user.")) {
      try {
        await affiliateService.deleteAffiliate(id);
        toast.success("Affiliate status removed.");
        fetchAffiliatesAndStats(); // Refresh
      } catch (error) {
        toast.error("Failed to remove affiliate status.");
      }
    }
  };
  
  const handleFormSubmit = async (formData: Partial<Affiliate>) => {
    try {
      if (editingAffiliate) {
        await affiliateService.updateAffiliate(editingAffiliate.id, formData);
        toast.success("Affiliate updated.");
      } else {
        await affiliateService.createAffiliate(formData);
        toast.success("Affiliate created.");
      }
      setIsFormOpen(false);
      setEditingAffiliate(null);
      fetchAffiliatesAndStats(); // Refresh
    } catch (error) {
      toast.error("Failed to save affiliate.");
    }
  };

  // ... (render logic with Skeleton for loading)
  // ... (AffiliateForm component - simplified for brevity)

  if (isLoading && affiliates.length === 0) {
    return <div className="p-6"><Skeleton className="w-full h-64" /></div>;
  }
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Affiliate Management</h1>
        <Button onClick={() => { setEditingAffiliate(null); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Affiliate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAffiliates ?? <Skeleton className="h-8 w-16 inline-block" />}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.totalCommissionsPaid ?? 0).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Sign-ups (Month)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.newSignUpsThisMonth ?? <Skeleton className="h-8 w-16 inline-block" />}</div>
          </CardContent>
        </Card>
      </div>
      
      <Input 
        placeholder="Search affiliates by name, email, or code..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      {/* Affiliates Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Referral Code</TableHead>
              <TableHead>Commissions</TableHead>
              <TableHead>Sign-ups</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                </TableRow>
              ))
            ) : currentAffiliates.length > 0 ? currentAffiliates.map((aff) => (
              <TableRow key={aff.id}>
                <TableCell>{aff.name || 'N/A'}</TableCell>
                <TableCell>{aff.email || 'N/A'}</TableCell>
                <TableCell>
                  {aff.code ? <Badge variant="outline">{aff.code}</Badge> : 'N/A'}
                </TableCell>
                <TableCell>${(aff.totalCommissions ?? 0).toFixed(2)}</TableCell>
                <TableCell>{aff.signUps ?? 0}</TableCell>
                <TableCell className="space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(aff)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(aff.id)} className="text-destructive hover:text-destructive-foreground"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={6} className="text-center">No affiliates found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center space-x-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
        </div>
      )}

      {/* Form Dialog (Simplified) */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAffiliate ? 'Edit Affiliate' : 'Add New Affiliate'}</DialogTitle>
          </DialogHeader>
          {/* Simplified Form: In a real app, use react-hook-form */}
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const data = Object.fromEntries(formData.entries());
            // Transform data if necessary
            handleFormSubmit({
              name: data.name as string,
              email: data.email as string,
              code: data.code as string,
              // ... other fields
            });
          }} className="space-y-4 py-4">
             <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name (or User ID to promote)</label>
              <Input id="name" name="name" defaultValue={editingAffiliate?.name || ''} required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <Input id="email" name="email" type="email" defaultValue={editingAffiliate?.email || ''} required />
            </div>
             <div>
              <label htmlFor="code" className="block text-sm font-medium mb-1">Affiliate Code</label>
              <Input id="code" name="code" defaultValue={editingAffiliate?.code || ''} />
            </div>
            <Button type="submit">Save Affiliate</Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminAffiliates;

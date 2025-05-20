
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Users, DollarSign, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Affiliate, AffiliateStatSummary } from '@/types/affiliate';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader'; // Assuming this component exists

// Mock service, replace with actual service calls that interact with your Supabase tables
// For example, you might have an 'affiliates' table or store affiliate data in 'users' table with a role/flag.
const affiliateService = {
  getAffiliates: async (searchTerm?: string): Promise<Affiliate[]> => {
    // This query assumes affiliate-specific data is stored in `raw_user_meta_data` of the `auth.users` table
    // or you have joined with a `profiles` or `users` table that contains this info.
    // It's generally better to have a dedicated 'affiliates' table or clear fields in 'users' table.
    
    // Let's assume you have a 'users' table that mirrors 'auth.users' via a trigger
    // and has affiliate-specific columns or a JSONB column for metadata.
    let query = supabase
      .from('users') // Querying your public 'users' table
      .select(`
        id, 
        email, 
        username, 
        created_at,
        updated_at,
        status, 
        affiliate_code:raw_user_meta_data->>'affiliate_code', 
        affiliate_total_commissions:raw_user_meta_data->>'total_commissions',
        affiliate_clicks:raw_user_meta_data->>'clicks',
        affiliate_sign_ups:raw_user_meta_data->>'sign_ups',
        affiliate_depositing_users:raw_user_meta_data->>'depositing_users',
        is_affiliate:raw_user_meta_data->>'is_affiliate'
      `)
      .eq('raw_user_meta_data->>is_affiliate', 'true'); // Filter for users marked as affiliates

    if (searchTerm) {
      query = query.or(`email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,raw_user_meta_data->>'affiliate_code'.ilike.%${searchTerm}%`);
    }
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching affiliates:", error);
      throw error;
    }

    return (data || []).map((item: any) => ({ // Use 'any' carefully, prefer specific type from Supabase schema
      id: item.id, // This is the public.users.id
      userId: item.id, // Assuming public.users.id is the key reference
      name: item.username || item.email?.split('@')[0] || 'N/A',
      email: item.email || 'N/A',
      code: item.affiliate_code || 'N/A',
      totalCommissions: parseFloat(item.affiliate_total_commissions) || 0,
      clicks: parseInt(item.affiliate_clicks) || 0,
      signUps: parseInt(item.affiliate_sign_ups) || 0,
      depositingUsers: parseInt(item.affiliate_depositing_users) || 0,
      isActive: item.status === 'active', // Assuming 'status' field indicates activity
      createdAt: item.created_at || new Date().toISOString(),
      updatedAt: item.updated_at || new Date().toISOString(),
    }));
  },
  getAffiliateStats: async (): Promise<AffiliateStatSummary> => {
    // This should query your database for aggregated stats
    const { data, error } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('raw_user_meta_data->>is_affiliate', 'true');

    // Mock other stats for now
    return { 
      totalAffiliates: error ? 0 : data?.[0]?.count || 0, // Corrected to access count
      totalCommissionsPaid: 0, // Placeholder
      newSignUpsThisMonth: 0  // Placeholder
    };
  },
  createAffiliate: async (data: Partial<Affiliate>): Promise<Affiliate> => {
    // This would typically involve updating a user's record to mark them as an affiliate
    // and setting their affiliate code, etc.
    // For example, if 'users' table has an 'is_affiliate' boolean and 'affiliate_code' text column:
    if (!data.userId) throw new Error("User ID is required to create an affiliate.");
    
    const updateData: any = { 
        'raw_user_meta_data': { // Update raw_user_meta_data
            is_affiliate: true,
            affiliate_code: data.code || `${data.name?.substring(0,3)}${Date.now().toString().slice(-4)}`.toUpperCase(),
            name: data.name, // Assuming name is also stored or derived
        }
    };
    // If you also want to update top-level columns in auth.users (like email, if allowed and different)
    // you'd do that separately or ensure your public.users table reflects these.

    const { data: updatedUser, error } = await supabase
      .from('users') // Assuming you update your public 'users' table
      .update({ raw_user_meta_data: supabase.sql`(raw_user_meta_data || '${JSON.stringify(updateData.raw_user_meta_data)}')::jsonb` })
      .eq('id', data.userId)
      .select()
      .single();

    if (error) throw error;
    if (!updatedUser) throw new Error("Failed to update user to affiliate.");

    toast.success("User promoted to affiliate.");
    // Return a structure matching the Affiliate type
    return { 
        ...data, 
        id: updatedUser.id, 
        userId: updatedUser.id, 
        name: updatedUser.username || data.name || '',
        email: updatedUser.email || data.email || '',
        code: updatedUser.raw_user_meta_data.affiliate_code,
        isActive: true,
        createdAt: updatedUser.created_at, 
        updatedAt: updatedUser.updated_at,
    } as Affiliate;
  },
  updateAffiliate: async (id: string, data: Partial<Affiliate>): Promise<Affiliate> => {
    // Similar to create, but updates an existing affiliate
    const updatePayload: any = {};
    if (data.code) updatePayload['raw_user_meta_data'] = { ...(updatePayload['raw_user_meta_data'] || {}), affiliate_code: data.code };
    if (data.name) updatePayload['raw_user_meta_data'] = { ...(updatePayload['raw_user_meta_data'] || {}), name: data.name };
    // Add other updatable fields

    const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ raw_user_meta_data: supabase.sql`(raw_user_meta_data || '${JSON.stringify(updatePayload.raw_user_meta_data)}')::jsonb` })
        .eq('id', id)
        .select()
        .single();
    
    if (error) throw error;
    if (!updatedUser) throw new Error("Affiliate not found for update.");
    toast.success("Affiliate updated.");
    return { 
        ...updatedUser,
        id: updatedUser.id,
        userId: updatedUser.id,
        name: updatedUser.username || data.name || '',
        email: updatedUser.email || data.email || '',
        code: updatedUser.raw_user_meta_data.affiliate_code,
        isActive: updatedUser.status === 'active',
     } as Affiliate;
  },
  deleteAffiliate: async (id: string): Promise<void> => {
    // This might mean setting 'is_affiliate' to false or removing affiliate-specific data
    const { error } = await supabase
        .from('users')
        .update({ raw_user_meta_data: supabase.sql`raw_user_meta_data - 'is_affiliate' - 'affiliate_code'` }) // Example: remove keys
        // Alternatively, set raw_user_meta_data.is_affiliate = false
        // .update({ raw_user_meta_data: supabase.sql`jsonb_set(raw_user_meta_data, '{is_affiliate}', 'false', false)` })
        .eq('id', id);

    if (error) throw error;
    toast.info("Affiliate status removed.");
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
    } catch (error: any) {
      toast.error(`Failed to load affiliate data: ${error.message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliatesAndStats();
  }, [searchQuery]); // Re-fetch when search query changes

  const currentAffiliates = useMemo(() => {
    const startIndex = (currentPage - 1) * affiliatesPerPage;
    return affiliates.slice(startIndex, startIndex + affiliatesPerPage);
  }, [affiliates, currentPage, affiliatesPerPage]);

  const totalPages = Math.ceil(affiliates.length / affiliatesPerPage);

  const handleEdit = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this affiliate status? This will not delete the user account.")) {
      try {
        await affiliateService.deleteAffiliate(id);
        fetchAffiliatesAndStats(); // Refresh
      } catch (error: any) {
        toast.error(`Failed to remove affiliate status: ${error.message}`);
      }
    }
  };
  
  const handleFormSubmit = async (formData: Partial<Affiliate>) => {
    // If creating new, formData needs userId of an existing user to "promote"
    // Or your createAffiliate handles finding/creating a user.
    // For now, ensure userId is passed if editing, or handled in create.
    if (!formData.email && !editingAffiliate) {
        toast.error("Email is required to find or create a user for the affiliate.");
        return;
    }

    try {
      setIsLoading(true);
      if (editingAffiliate?.id) { // Check editingAffiliate.id for existing affiliate
        await affiliateService.updateAffiliate(editingAffiliate.id, formData);
      } else {
        // For creation, we might need to find user by email first to get their ID
        // This is a simplified example. Robust creation might involve more steps.
        if (!formData.email) throw new Error("Email is required for new affiliate.");
        const { data: users, error: findError } = await supabase.from('users').select('id').eq('email', formData.email).single();
        if (findError || !users) {
            toast.error(`User with email ${formData.email} not found. Cannot create affiliate.`);
            setIsLoading(false);
            return;
        }
        await affiliateService.createAffiliate({ ...formData, userId: users.id });
      }
      setIsFormOpen(false);
      setEditingAffiliate(null);
      fetchAffiliatesAndStats(); // Refresh
    } catch (error: any) {
      toast.error(`Failed to save affiliate: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && affiliates.length === 0 && !stats) {
    return (
        <div className="p-4 md:p-6 space-y-6">
            <CMSPageHeader title="Affiliate Management" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <Card key={i}><CardHeader><Skeleton className="h-5 w-24"/></CardHeader><CardContent><Skeleton className="h-8 w-16"/></CardContent></Card>)}
            </div>
            <Skeleton className="h-10 w-full max-w-sm" />
            <Card><Skeleton className="h-64 w-full" /></Card>
        </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <CMSPageHeader 
        title="Affiliate Management"
        actions={
            <Button onClick={() => { setEditingAffiliate(null); setIsFormOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Add Affiliate
            </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading && !stats ? <Skeleton className="h-8 w-16 inline-block" /> : stats?.totalAffiliates ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${isLoading && !stats ? <Skeleton className="h-8 w-16 inline-block" /> : (stats?.totalCommissionsPaid ?? 0).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Sign-ups (Example)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading && !stats ? <Skeleton className="h-8 w-16 inline-block" /> : stats?.newSignUpsThisMonth ?? 0}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
            placeholder="Search affiliates by name, email, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-sm"
        />
      </div>

      {/* Affiliates Table */}
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Referral Code</TableHead>
              <TableHead>Commissions</TableHead>
              <TableHead>Sign-ups</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && currentAffiliates.length === 0 ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="flex space-x-1"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : currentAffiliates.length > 0 ? currentAffiliates.map((aff) => (
              <TableRow key={aff.id}>
                <TableCell className="font-medium">{aff.name || 'N/A'}</TableCell>
                <TableCell>{aff.email || 'N/A'}</TableCell>
                <TableCell>
                  {aff.code ? <Badge variant="outline">{aff.code}</Badge> : 'N/A'}
                </TableCell>
                <TableCell>${(aff.totalCommissions ?? 0).toFixed(2)}</TableCell>
                <TableCell>{aff.signUps ?? 0}</TableCell>
                <TableCell>
                    <Badge variant={aff.isActive ? "default" : "destructive"}>
                        {aff.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </TableCell>
                <TableCell className="space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(aff)} title="Edit Affiliate"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(aff.id)} className="text-destructive hover:text-destructive" title="Remove Affiliate Status"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={7} className="text-center h-24">No affiliates found matching your criteria.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center space-x-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingAffiliate(null); // Reset editing state when dialog closes
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAffiliate ? 'Edit Affiliate' : 'Add New Affiliate'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formDataValues = new FormData(e.target as HTMLFormElement);
            const data = Object.fromEntries(formDataValues.entries()) as { name: string; email: string; code: string; userId?: string };
            
            const payload: Partial<Affiliate> = {
              name: data.name,
              email: data.email, // Required to find user if new
              code: data.code,
            };
            if (editingAffiliate) {
                payload.userId = editingAffiliate.userId; // Pass existing userId for updates
            }
            await handleFormSubmit(payload);
          }} className="space-y-4 py-4">
             <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
              <Input id="name" name="name" defaultValue={editingAffiliate?.name || ''} required />
              <p className="text-xs text-muted-foreground mt-1">
                {editingAffiliate ? "Update affiliate's display name." : "Enter user's name. If promoting an existing user, this can be their current name."}
              </p>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">User Email</label>
              <Input id="email" name="email" type="email" defaultValue={editingAffiliate?.email || ''} required disabled={!!editingAffiliate} />
               <p className="text-xs text-muted-foreground mt-1">
                {editingAffiliate ? "Email cannot be changed." : "Enter the email of the user to promote to affiliate. User must exist."}
              </p>
            </div>
             <div>
              <label htmlFor="code" className="block text-sm font-medium mb-1">Affiliate Code (Optional)</label>
              <Input id="code" name="code" defaultValue={editingAffiliate?.code || ''} />
              <p className="text-xs text-muted-foreground mt-1">
                Unique code for referrals. If blank, one may be auto-generated.
              </p>
            </div>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : (editingAffiliate ? 'Save Changes' : 'Add Affiliate')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminAffiliates;

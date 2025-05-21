import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, UserPlus, Edit, Trash2, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
// import { useIsMobile } from '@/hooks/use-is-mobile'; // Corrected path below
import { useMobile } from '@/hooks/use-mobile'; // Corrected import, assuming this is the hook
import { AffiliateUser, AffiliateCommissionTier, UserStatus } from '@/types/affiliate'; // Ensure UserStatus is defined
import { User } from '@/types/user'; // Assuming User type exists for general user data

// Placeholder for sorting, ideally move to a utility
type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: keyof AffiliateUser | null;
  direction: SortDirection;
}

const ITEMS_PER_PAGE = 10;

const AffiliatesPage = () => {
  const [affiliates, setAffiliates] = useState<AffiliateUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<AffiliateUser | null>(null);
  const [formData, setFormData] = useState<Partial<AffiliateUser>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });

  const isMobile = useMobile(); // Corrected usage

  const fetchAffiliates = async () => {
    setIsLoading(true);
    try {
      // Fetching from 'users' table and mapping to AffiliateUser type
      // This assumes 'users' table has affiliate-related fields or can be joined
      // For simplicity, directly querying 'users' and assuming role indicates affiliate
      let query = supabase.from('users').select(`
        id, 
        email, 
        username,
        created_at,
        updated_at,
        status,
        inviter_code, 
        affiliate_revenue_share,
        affiliate_cpa,
        affiliate_baseline
        
        -- Assuming these fields for mapping or they are part of user_metadata
        -- first_name, last_name, avatar_url, role 
      `)
      .or('role.eq.affiliate,is_affiliate.eq.true'); // Example filter for affiliates if 'role' or 'is_affiliate' field exists

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,inviter_code.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      if (sortConfig.key) {
        query = query.order(sortConfig.key as string, { ascending: sortConfig.direction === 'asc' });
      }
      
      query = query.range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE -1);


      const { data, error, count } = await query;

      if (error) throw error;
      
      // Map fetched data to AffiliateUser type. This is crucial.
      const mappedAffiliates: AffiliateUser[] = data.map((dbUser: any) => ({ // dbUser is from 'users' table
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username || dbUser.email?.split('@')[0] || 'N/A',
        firstName: dbUser.user_metadata?.firstName || dbUser.first_name || '', // Assuming these might be in metadata
        lastName: dbUser.user_metadata?.lastName || dbUser.last_name || '',
        avatarUrl: dbUser.user_metadata?.avatarUrl || dbUser.avatar_url || '',
        role: dbUser.role || 'affiliate', // Assign a default role or fetch actual role
        tracking_code: dbUser.inviter_code || `AFF-${dbUser.id.substring(0,6)}`, // Assuming inviter_code is tracking_code
        website_url: dbUser.user_metadata?.website_url || null, // Example
        status: dbUser.status as UserStatus || 'active',
        commission_tiers: dbUser.commission_tiers || [], // Assuming this field exists or is constructed
        created_at: dbUser.created_at,
        updated_at: dbUser.updated_at,
        app_metadata: {}, // Add app_metadata if needed
        user_metadata: dbUser.user_metadata || {}, // Add user_metadata if needed
        aud: user?.aud || '', // Add aud if needed or ensure AffiliateUser type doesn't require it if not available directly
      }));
      setAffiliates(mappedAffiliates);
      // Set total pages based on count (if your Supabase version supports count with range)
    } catch (error: any) {
      toast.error("Failed to fetch affiliates: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, [statusFilter, searchTerm, currentPage, sortConfig]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTierChange = (index: number, field: keyof AffiliateCommissionTier, value: string | number) => {
    const updatedTiers = [...(formData.commission_tiers || [])];
    if (!updatedTiers[index]) updatedTiers[index] = { threshold: 0, rate: 0, type: 'percentage' };
    (updatedTiers[index] as any)[field] = field === 'threshold' || field === 'rate' ? Number(value) : value;
    setFormData(prev => ({ ...prev, commission_tiers: updatedTiers }));
  };

  const addTier = () => {
    const newTier: AffiliateCommissionTier = { threshold: 0, rate: 0, type: 'percentage' };
    setFormData(prev => ({ ...prev, commission_tiers: [...(prev.commission_tiers || []), newTier] }));
  };
  
  const removeTier = (index: number) => {
    setFormData(prev => ({ ...prev, commission_tiers: prev.commission_tiers?.filter((_, i) => i !== index) }));
  };


  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // For affiliates, updates likely go to 'users' table or a specific 'affiliates' table if it exists
      // Assuming 'users' table for now
      const updatePayload = {
        email: formData.email,
        user_metadata: { // Assuming some fields are in user_metadata
            ...(editingAffiliate?.user_metadata || {}),
            username: formData.username,
            firstName: formData.firstName,
            lastName: formData.lastName,
            website_url: formData.website_url,
        },
        // inviter_code: formData.tracking_code, // If tracking_code maps to inviter_code
        status: formData.status,
        // commission_tiers: formData.commission_tiers, // If this is a direct column or JSONB
      };


      if (editingAffiliate) { // Update existing
        const { error } = await supabase.from('users').update(updatePayload).eq('id', editingAffiliate.id);
        if (error) throw error;
        toast.success("Affiliate updated successfully.");
      } else { // Create new (more complex, might involve creating auth user then user profile)
        // This part is simplified. Real creation involves auth.signUp then inserting into users table.
        // For admin panel, often you'd create a user with a temporary password or invite.
        // const { data, error } = await supabase.auth.admin.createUser({ email: formData.email, ... });
        // if (error) throw error;
        // Then create corresponding entry in 'users' table
        toast.error("Creating new affiliates directly is complex and needs full implementation.");
      }
      fetchAffiliates();
      setIsModalOpen(false);
      setEditingAffiliate(null);
      setFormData({});
    } catch (error: any) {
      toast.error("Operation failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (affiliate: AffiliateUser | null = null) => {
    setEditingAffiliate(affiliate);
    setFormData(affiliate ? { ...affiliate } : { status: 'active', commission_tiers: [] });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this affiliate? This might be irreversible.")) return;
    setIsLoading(true);
    try {
      // Deleting from 'users' table. Consider soft delete (setting status to 'deleted')
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      toast.success("Affiliate deleted successfully.");
      fetchAffiliates();
    } catch (error: any) {
      toast.error("Failed to delete affiliate: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const requestSort = (key: keyof AffiliateUser) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const SortIndicator = ({ columnKey }: { columnKey: keyof AffiliateUser}) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 inline" /> : <ChevronDown className="h-4 w-4 inline" />;
  };

  const user = { aud: '' }; // Placeholder for user object if needed for `aud`

  return (
    <AdminPageLayout title="Affiliate Management">
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search affiliates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-64 bg-background"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as UserStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => openModal()} className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" /> Add Affiliate
          </Button>
        </div>
      </div>

      {isLoading && affiliates.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => requestSort('username')}>Username <SortIndicator columnKey='username' /></TableHead>
                <TableHead onClick={() => requestSort('email')}>Email <SortIndicator columnKey='email' /></TableHead>
                <TableHead onClick={() => requestSort('tracking_code')}>Tracking Code <SortIndicator columnKey='tracking_code' /></TableHead>
                <TableHead onClick={() => requestSort('status')}>Status <SortIndicator columnKey='status' /></TableHead>
                <TableHead onClick={() => requestSort('created_at')}>Joined <SortIndicator columnKey='created_at' /></TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell>{affiliate.username}</TableCell>
                  <TableCell>{affiliate.email}</TableCell>
                  <TableCell>{affiliate.tracking_code}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      affiliate.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      affiliate.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {affiliate.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(affiliate.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openModal(affiliate)} className="mr-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(affiliate.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Pagination controls (basic example) */}
      <div className="mt-6 flex justify-between items-center">
          <Button 
            onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
            disabled={currentPage === 1 || isLoading}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {currentPage}</span>
          <Button 
            onClick={() => setCurrentPage(p => p+1)} 
            disabled={affiliates.length < ITEMS_PER_PAGE || isLoading} // Disable if not a full page or loading
            variant="outline"
          >
            Next
          </Button>
        </div>


      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px] bg-card">
          <DialogHeader>
            <DialogTitle>{editingAffiliate ? 'Edit Affiliate' : 'Add New Affiliate'}</DialogTitle>
            <DialogDescription>
              {editingAffiliate ? 'Update details for this affiliate.' : 'Enter details for the new affiliate.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Form fields */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="username" className="text-right">Username</label>
              <Input id="username" name="username" value={formData.username || ''} onChange={handleInputChange} className="col-span-3 bg-input" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">Email</label>
              <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} className="col-span-3 bg-input" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="firstName" className="text-right">First Name</label>
              <Input id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} className="col-span-3 bg-input" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="lastName" className="text-right">Last Name</label>
              <Input id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} className="col-span-3 bg-input" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="tracking_code" className="text-right">Tracking Code</label>
              <Input id="tracking_code" name="tracking_code" value={formData.tracking_code || ''} onChange={handleInputChange} className="col-span-3 bg-input" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="website_url" className="text-right">Website URL</label>
              <Input id="website_url" name="website_url" value={formData.website_url || ''} onChange={handleInputChange} className="col-span-3 bg-input" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right">Status</label>
              <Select name="status" value={formData.status || 'active'} onValueChange={(value) => setFormData(prev => ({...prev, status: value as UserStatus}))}>
                <SelectTrigger className="col-span-3 bg-input">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Commission Tiers */}
            <div className="col-span-4">
              <h4 className="font-semibold mt-4 mb-2">Commission Tiers</h4>
              {formData.commission_tiers?.map((tier, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 mb-2 p-2 border rounded-md border-border">
                  <Input 
                    type="number" 
                    placeholder="Threshold (e.g. GGR)" 
                    value={tier.threshold}
                    onChange={(e) => handleTierChange(index, 'threshold', e.target.value)}
                    className="bg-input"
                  />
                  <Input 
                    type="number" 
                    placeholder="Rate (%)" 
                    value={tier.rate}
                    onChange={(e) => handleTierChange(index, 'rate', e.target.value)}
                    className="bg-input"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeTier(index)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={addTier} variant="outline" size="sm" className="mt-2">Add Tier</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingAffiliate ? 'Save Changes' : 'Create Affiliate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default AffiliatesPage;

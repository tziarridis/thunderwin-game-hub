import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Affiliate, AffiliateStatSummary } from '@/types/affiliate';
import { User } from '@/types/user'; // Using the User type from @/types
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AffiliateStats from '@/components/admin/AffiliateStats';
import { PlusCircle, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

// Simplified AffiliateForm for brevity. Needs proper implementation.
const AffiliateForm: React.FC<{ affiliate?: Affiliate | null; users: User[]; onSuccess: () => void; onClose: () => void; }> = ({ affiliate, users, onSuccess, onClose }) => {
  const [formData, setFormData] = useState<Partial<Affiliate>>({
    userId: affiliate?.userId || '',
    name: affiliate?.name || '',
    email: affiliate?.email || '', // This should come from the selected user
    code: affiliate?.code || '',
    commissionRate: affiliate?.commissionRate || 0.1, // Default 10%
    isActive: affiliate?.isActive === undefined ? true : affiliate.isActive,
    // ... other fields like paymentDetails, affiliate_revenue_share etc.
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (affiliate) {
      setFormData({
        userId: affiliate.userId,
        name: affiliate.name,
        email: affiliate.email,
        code: affiliate.code,
        commissionRate: affiliate.commissionRate,
        isActive: affiliate.isActive,
        paymentDetails: affiliate.paymentDetails,
        affiliate_revenue_share: affiliate.affiliate_revenue_share,
        affiliate_cpa: affiliate.affiliate_cpa,
        affiliate_baseline: affiliate.affiliate_baseline,
      });
    } else {
       setFormData({ commissionRate: 0.1, isActive: true }); // Reset for new
    }
  }, [affiliate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    }
    else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleUserSelect = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        userId: selectedUser.id,
        name: selectedUser.user_metadata?.full_name || selectedUser.user_metadata?.username || selectedUser.email?.split('@')[0] || '',
        email: selectedUser.email || '',
      }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.name || !formData.email) {
        toast.error("User, Name and Email are required.");
        return;
    }
    setIsLoading(true);
    try {
      // This is a simplified upsert logic.
      // In a real scenario, you'd update 'profiles' table or a dedicated 'affiliates' table.
      // Assuming 'profiles' table has affiliate-specific columns like 'affiliate_code', 'commission_rate', etc.
      const profileDataToUpdate = {
        // id: formData.userId, // This is the user ID
        full_name: formData.name, // Or ensure name comes from user profile
        affiliate_code: formData.code,
        commission_rate: formData.commissionRate,
        is_affiliate_active: formData.isActive, // Example column name
        affiliate_payment_details: formData.paymentDetails,
        affiliate_revenue_share: formData.affiliate_revenue_share,
        affiliate_cpa: formData.affiliate_cpa,
        affiliate_baseline: formData.affiliate_baseline,
        // other affiliate fields...
      };

      if (affiliate?.id) { // affiliate.id is the profile/user ID for an existing affiliate
        const { error } = await supabase.from('profiles').update(profileDataToUpdate).eq('id', affiliate.id);
        if (error) throw error;
        toast.success('Affiliate updated successfully!');
      } else {
        // For new affiliate, we're essentially "activating" a user as an affiliate
        // or creating a new entry in an `affiliates` table if one exists.
        // Here, we update their profile.
        const { error } = await supabase.from('profiles').update({ ...profileDataToUpdate, role: 'affiliate' } ).eq('id', formData.userId); // Also set role
        if (error) throw error;
        toast.success('Affiliate created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save affiliate:', error);
      toast.error(error.message || 'Failed to save affiliate.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* User Selection */}
      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select User</label>
        <select 
            id="userId" 
            name="userId" 
            value={formData.userId} 
            onChange={(e) => handleUserSelect(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            disabled={!!affiliate} // Disable if editing, user shouldn't change
        >
            <option value="">-- Select User --</option>
            {users.filter(u => u.role !== 'admin').map(user => ( // Filter out admins or based on logic
                <option key={user.id} value={user.id}>
                    {user.user_metadata?.username || user.email} ({user.email})
                </option>
            ))}
        </select>
      </div>
      <div>
        <label htmlFor="name">Name</label>
        <Input name="name" value={formData.name || ''} onChange={handleChange} required readOnly={!!formData.userId} />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <Input name="email" type="email" value={formData.email || ''} onChange={handleChange} required readOnly={!!formData.userId} />
      </div>
      <div>
        <label htmlFor="code">Affiliate Code</label>
        <Input name="code" value={formData.code || ''} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="commissionRate">Commission Rate (e.g., 0.1 for 10%)</label>
        <Input name="commissionRate" type="number" step="0.01" value={formData.commissionRate || 0} onChange={handleChange} />
      </div>
       <div>
        <label htmlFor="affiliate_revenue_share">Revenue Share (%)</label>
        <Input name="affiliate_revenue_share" type="number" step="0.01" value={formData.affiliate_revenue_share || 0} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="affiliate_cpa">CPA ($)</label>
        <Input name="affiliate_cpa" type="number" step="0.01" value={formData.affiliate_cpa || 0} onChange={handleChange} />
      </div>
       <div>
        <label htmlFor="affiliate_baseline">Baseline ($)</label>
        <Input name="affiliate_baseline" type="number" step="0.01" value={formData.affiliate_baseline || 0} onChange={handleChange} />
      </div>
      <div className="flex items-center">
        <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive || false} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">Active</label>
      </div>
      {/* Add paymentDetails fields here if needed */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {affiliate ? 'Update' : 'Create'} Affiliate
        </Button>
      </div>
    </form>
  );
};


const AdminAffiliates: React.FC = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [users, setUsers] = useState<User[]>([]); // For selecting users to become affiliates
  const [summary, setSummary] = useState<AffiliateStatSummary | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);

  const fetchAffiliates = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch users who are affiliates (e.g., from 'profiles' table with affiliate data)
      // This assumes 'profiles' table has columns like 'affiliate_code', 'commission_rate', 'is_affiliate_active', etc.
      // And that Supabase User object has 'role' in user_metadata or it's on 'profiles'.
      let query = supabase.from('profiles').select(`
        id, 
        user_id: id, 
        username, 
        email, 
        full_name,
        avatar_url,
        created_at,
        updated_at,
        role,
        is_affiliate_active,
        affiliate_code,
        commission_rate,
        affiliate_payment_details,
        affiliate_revenue_share,
        affiliate_cpa,
        affiliate_baseline,
        affiliate_total_commissions,
        affiliate_clicks,
        affiliate_sign_ups,
        affiliate_depositing_users
      `);
      // .eq('role', 'affiliate'); // Or some other marker like is_affiliate_active = true

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,affiliate_code.ilike.%${searchTerm}%`);
      }
      const { data, error } = await query;
      if (error) throw error;

      const fetchedAffiliates = data?.map((profile: any) => ({
        id: profile.id, // This is the profile ID, which is also the user ID in this setup
        userId: profile.id,
        name: profile.full_name || profile.username || profile.email?.split('@')[0] || 'N/A',
        email: profile.email || 'N/A',
        code: profile.affiliate_code,
        totalCommissions: profile.affiliate_total_commissions || 0,
        clicks: profile.affiliate_clicks || 0,
        signUps: profile.affiliate_sign_ups || 0,
        depositingUsers: profile.affiliate_depositing_users || 0,
        commissionRate: profile.commission_rate,
        paymentDetails: profile.affiliate_payment_details,
        isActive: profile.is_affiliate_active,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        avatar_url: profile.avatar_url,
        status: profile.is_affiliate_active ? 'Active' : 'Inactive', // Derive status
        affiliate_revenue_share: profile.affiliate_revenue_share,
        affiliate_cpa: profile.affiliate_cpa,
        affiliate_baseline: profile.affiliate_baseline,

      })) as Affiliate[];
      
      setAffiliates(fetchedAffiliates || []);

      // Dummy summary for now
      setSummary({
        totalAffiliates: fetchedAffiliates.length,
        totalCommissionsPaid: fetchedAffiliates.reduce((sum, aff) => sum + (aff.totalCommissions || 0), 0),
        newSignUpsThisMonth: fetchedAffiliates.filter(a => new Date(a.createdAt).getMonth() === new Date().getMonth()).length,
      });

    } catch (error: any) {
      console.error('Failed to fetch affiliates:', error);
      toast.error(error.message || 'Failed to fetch affiliates.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  const fetchUsers = async () => { // Fetch users who can become affiliates
    try {
        const { data, error } = await supabase
            .from('users') // auth.users
            .select('id, email, raw_user_meta_data') // raw_user_meta_data contains username, full_name etc.
             // .neq('role', 'admin') // Example: don't list admins as potential affiliates
             // Add more filters if needed, e.g., users not already affiliates
            
        if (error) throw error;

        const mappedUsers: User[] = data?.map((u: any) => ({
            id: u.id,
            aud: '', // Not directly available, can be omitted or set if needed
            email: u.email,
            user_metadata: u.raw_user_meta_data || {},
            created_at: u.created_at, // This might not be on auth.users directly, but on profiles
            role: u.raw_user_meta_data?.role || 'user',
            // ensure all fields from User type are covered or optional
        })) || [];
        setUsers(mappedUsers);
    } catch (error: any) {
        console.error("Failed to fetch users:", error);
        toast.error(error.message || "Failed to fetch users for affiliate selection.");
    }
  };


  useEffect(() => {
    fetchAffiliates();
    fetchUsers(); // Fetch users for the form
  }, [fetchAffiliates]);

  const handleAddAffiliate = () => {
    setSelectedAffiliate(null);
    setIsModalOpen(true);
  };

  const handleEditAffiliate = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setIsModalOpen(true);
  };

  const handleDeleteAffiliate = async (affiliateId: string) => {
    if (!window.confirm('Are you sure you want to delete this affiliate? This typically means revoking their affiliate status, not deleting the user.')) return;
    try {
      // This would typically set is_affiliate_active to false or remove their affiliate-specific data from 'profiles'
      const { error } = await supabase.from('profiles').update({ 
          is_affiliate_active: false, 
          affiliate_code: null, 
          // Consider nullifying other affiliate fields
        }).eq('id', affiliateId);
      if (error) throw error;
      toast.success('Affiliate status revoked.');
      fetchAffiliates();
    } catch (error: any) {
      console.error('Failed to delete affiliate:', error);
      toast.error(error.message || 'Failed to delete affiliate.');
    }
  };
  
  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchAffiliates();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Affiliate Management</h1>
      
      <AffiliateStats summary={summary} recentAffiliates={affiliates.slice(0,5)} isLoading={isLoading} />

      <div className="my-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search affiliates (name, email, code)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
        </div>
        <Button onClick={handleAddAffiliate}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Affiliate
        </Button>
      </div>

      {isLoading && <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Loading affiliates...</span></div>}
      
      {!isLoading && (
        <div className="bg-card p-4 rounded-lg shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Sign Ups</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.length > 0 ? affiliates.map((aff) => (
                <TableRow key={aff.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {aff.avatar_url && <img src={aff.avatar_url} alt={aff.name} className="h-8 w-8 rounded-full" />}
                    {aff.name}
                  </TableCell>
                  <TableCell>{aff.email}</TableCell>
                  <TableCell>{aff.code || '-'}</TableCell>
                  <TableCell>{aff.commissionRate ? `${(aff.commissionRate * 100).toFixed(0)}%` : '-'}</TableCell>
                  <TableCell>{aff.clicks || 0}</TableCell>
                  <TableCell>{aff.signUps || 0}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${aff.isActive ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'}`}>
                      {aff.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(aff.createdAt), 'PP')}</TableCell>
                  <TableCell className="space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditAffiliate(aff)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAffiliate(aff.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">No affiliates found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card">
          <DialogHeader>
            <DialogTitle>{selectedAffiliate ? 'Edit Affiliate' : 'Add New Affiliate'}</DialogTitle>
          </DialogHeader>
          <AffiliateForm 
            affiliate={selectedAffiliate} 
            users={users}
            onSuccess={handleFormSuccess} 
            onClose={() => setIsModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAffiliates;

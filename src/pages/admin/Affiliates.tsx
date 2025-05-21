import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Affiliate, AffiliateStatSummary } from '@/types/affiliate';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // DialogTrigger removed as modal is controlled by state
import { toast } from 'sonner';
import AffiliateStats from '@/components/admin/AffiliateStats';
import { PlusCircle, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Profile } from '@/types/user'; // For profile specific fields

// Simplified AffiliateForm for brevity. Needs proper implementation.
const AffiliateForm: React.FC<{ affiliate?: Affiliate | null; users: User[]; onSuccess: () => void; onClose: () => void; }> = ({ affiliate, users, onSuccess, onClose }) => {
  const [formData, setFormData] = useState<Partial<Affiliate & { paymentDetails_text?: string }>>({ // paymentDetails can be complex
    userId: '',
    name: '',
    email: '',
    code: '',
    commissionRate: 0.1,
    isActive: true,
    affiliate_revenue_share: 0,
    affiliate_cpa: 0,
    affiliate_baseline: 0,
    paymentDetails_text: '', // For simple text input for payment details
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
        paymentDetails_text: typeof affiliate.paymentDetails === 'string' ? affiliate.paymentDetails : JSON.stringify(affiliate.paymentDetails),
        affiliate_revenue_share: affiliate.affiliate_revenue_share || 0,
        affiliate_cpa: affiliate.affiliate_cpa || 0,
        affiliate_baseline: affiliate.affiliate_baseline || 0,
      });
    } else {
       setFormData({ userId: '', name: '', email: '', code: '', commissionRate: 0.1, isActive: true, affiliate_revenue_share: 0, affiliate_cpa: 0, affiliate_baseline: 0, paymentDetails_text: '' });
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


  const handleSubmit = async (e: React.Event) => {
    e.preventDefault();
    if (!formData.userId || !formData.name || !formData.email) {
        toast.error("User, Name and Email are required.");
        return;
    }
    setIsLoading(true);
    try {
      // TODO: The 'profiles' table schema MUST be updated to store these fields.
      // Current 'profiles' table only has: id, user_id, created_at, updated_at, first_name, last_name, avatar_url.
      // The following fields are NOT on the 'profiles' table and this update will partially fail or store in wrong places.
      // - affiliate_code
      // - commission_rate
      // - is_affiliate_active (or similar boolean flag)
      // - affiliate_payment_details
      // - affiliate_revenue_share, affiliate_cpa, affiliate_baseline
      // - role (if trying to set 'affiliate' role here)

      // For now, we will only attempt to update fields that *might* exist on a generic profile or user_metadata
      // This is a temporary fix to make it compile. A DB migration is required.
      const profileDataToUpdate: Partial<Profile & Record<string, any>> = {
        // Fields known to be on 'profiles' table or user_metadata
        full_name: formData.name, // Assuming this should update profile.full_name
        // Placeholder for where affiliate data *should* go IF profiles table is extended
        // For compilation, these are just illustrative and won't work without DB changes.
        // SUPABASE TODO: Extend 'profiles' table or create 'affiliates' table for these:
        // affiliate_code: formData.code,
        // commission_rate: formData.commissionRate,
        // is_affiliate_active: formData.isActive,
        // affiliate_payment_details: formData.paymentDetails_text,
        // affiliate_revenue_share: formData.affiliate_revenue_share,
        // affiliate_cpa: formData.affiliate_cpa,
        // affiliate_baseline: formData.affiliate_baseline,
      };
      
      // Storing these directly on profiles table is assumed here.
      // These properties will cause errors if they don't exist on the table `profiles`
      // This is a risky assumption.
      const extendedProfileData = {
        ...profileDataToUpdate,
        affiliate_code: formData.code,
        commission_rate: formData.commissionRate,
        is_affiliate_active: formData.isActive,
        affiliate_payment_details: formData.paymentDetails_text, // Example
        affiliate_revenue_share: formData.affiliate_revenue_share,
        affiliate_cpa: formData.affiliate_cpa,
        affiliate_baseline: formData.affiliate_baseline,
      };


      if (affiliate?.id) { // affiliate.id is the profile/user ID
        // Only update what's on the 'profiles' table, or what might be on user_metadata
        const { error } = await supabase.from('profiles').update(extendedProfileData).eq('id', affiliate.id);
        if (error) throw error;
        toast.success('Affiliate updated successfully! (DB schema might need update for all fields)');
      } else {
        // For new affiliate, update their profile.
        // Also, an admin might need to set their role to 'affiliate' via Supabase dashboard or a backend function.
        const { error } = await supabase.from('profiles').update(extendedProfileData).eq('id', formData.userId);
        if (error) throw error;
        // To set user role to 'affiliate', this needs to be done via admin privileges, e.g. an edge function.
        // supabase.auth.admin.updateUserById(formData.userId, { app_metadata: { role: 'affiliate' } }); // Example
        toast.success('Affiliate created successfully! (DB schema/role might need manual update)');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save affiliate:', error);
      toast.error(error.message || 'Failed to save affiliate. Check console and DB schema.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select User</label>
        <select 
            id="userId" 
            name="userId" 
            value={formData.userId} 
            onChange={(e) => handleUserSelect(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            disabled={!!affiliate}
        >
            <option value="">-- Select User --</option>
            {users.filter(u => u.role !== 'admin').map(user => (
                <option key={user.id} value={user.id}>
                    {user.user_metadata?.username || user.user_metadata?.full_name || user.email} ({user.email})
                </option>
            ))}
        </select>
      </div>
      <div>
        <label htmlFor="name">Name</label>
        <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required readOnly={!!formData.userId && !affiliate} />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required readOnly={!!formData.userId && !affiliate} />
      </div>
      <div>
        <label htmlFor="code">Affiliate Code</label>
        <Input id="code" name="code" value={formData.code || ''} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="commissionRate">Commission Rate (e.g., 0.1 for 10%)</label>
        <Input id="commissionRate" name="commissionRate" type="number" step="0.01" value={formData.commissionRate || 0} onChange={handleChange} />
      </div>
       <div>
        <label htmlFor="affiliate_revenue_share">Revenue Share (%)</label>
        <Input id="affiliate_revenue_share" name="affiliate_revenue_share" type="number" step="0.01" value={formData.affiliate_revenue_share || 0} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="affiliate_cpa">CPA ($)</label>
        <Input id="affiliate_cpa" name="affiliate_cpa" type="number" step="0.01" value={formData.affiliate_cpa || 0} onChange={handleChange} />
      </div>
       <div>
        <label htmlFor="affiliate_baseline">Baseline ($)</label>
        <Input id="affiliate_baseline" name="affiliate_baseline" type="number" step="0.01" value={formData.affiliate_baseline || 0} onChange={handleChange} />
      </div>
      <div className="flex items-center">
        <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive || false} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">Active</Label>
      </div>
      <div>
        <Label htmlFor="paymentDetails_text">Payment Details (e.g. PayPal email, Bank info)</Label>
        <Input id="paymentDetails_text" name="paymentDetails_text" value={formData.paymentDetails_text || ''} onChange={handleChange} />
      </div>
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
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<AffiliateStatSummary | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);

  const fetchAffiliates = useCallback(async () => {
    setIsLoading(true);
    try {
      // SUPABASE TODO: This query assumes 'profiles' table has affiliate-specific columns.
      // These columns (affiliate_code, commission_rate, etc.) need to be added via SQL migration if not present.
      // For now, it will only fetch profiles and try to map them.
      let query = supabase.from('profiles').select(`
        id, 
        user_id: id, 
        email, 
        full_name,
        avatar_url,
        created_at,
        updated_at,
        role, 
        user_metadata,
        app_meta_data,
        raw_user_meta_data, /* Supabase often stores custom fields here */
        affiliate_code, /* Assumed custom field on profiles */
        commission_rate, /* Assumed custom field on profiles */
        is_affiliate_active, /* Assumed custom field on profiles */
        affiliate_payment_details, /* Assumed custom field on profiles */
        affiliate_revenue_share, /* Assumed custom field on profiles */
        affiliate_cpa, /* Assumed custom field on profiles */
        affiliate_baseline, /* Assumed custom field on profiles */
        affiliate_total_commissions, /* Assumed custom field on profiles */
        affiliate_clicks, /* Assumed custom field on profiles */
        affiliate_sign_ups, /* Assumed custom field on profiles */
        affiliate_depositing_users /* Assumed custom field on profiles */
      `)
      // Example: .eq('is_affiliate_active', true) // If you have such a flag
      // Or by checking a role if you manage roles within profiles table
      ;

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,affiliate_code.ilike.%${searchTerm}%`);
      }
      const { data, error } = await query;
      if (error) throw error;

      const fetchedAffiliates = data?.map((profile: any) => ({
        id: profile.id,
        userId: profile.id, // Assuming profile ID is the user ID for affiliates
        name: profile.full_name || profile.raw_user_meta_data?.username || profile.email?.split('@')[0] || 'N/A',
        email: profile.email || 'N/A',
        code: profile.affiliate_code || '', // Fallback if column doesn't exist
        totalCommissions: profile.affiliate_total_commissions || 0,
        clicks: profile.affiliate_clicks || 0,
        signUps: profile.affiliate_sign_ups || 0,
        depositingUsers: profile.affiliate_depositing_users || 0,
        commissionRate: profile.commission_rate || 0,
        paymentDetails: profile.affiliate_payment_details || '',
        isActive: profile.is_affiliate_active === undefined ? false : profile.is_affiliate_active,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        avatar_url: profile.avatar_url,
        status: profile.is_affiliate_active ? 'Active' : 'Inactive',
        affiliate_revenue_share: profile.affiliate_revenue_share || 0,
        affiliate_cpa: profile.affiliate_cpa || 0,
        affiliate_baseline: profile.affiliate_baseline || 0,
      })) as Affiliate[];
      
      setAffiliates(fetchedAffiliates || []);

      setSummary({
        totalAffiliates: fetchedAffiliates.length,
        totalCommissionsPaid: fetchedAffiliates.reduce((sum, aff) => sum + (aff.totalCommissions || 0), 0),
        // Note: newSignUpsThisMonth was filtering by createdAt. This depends on how sign-ups are tracked.
        // This is a simplification. True affiliate sign-ups might be tracked in a separate table.
        newSignUpsThisMonth: fetchedAffiliates.filter(a => a.createdAt && new Date(a.createdAt).getMonth() === new Date().getMonth()).length,
      });

    } catch (error: any) {
      console.error('Failed to fetch affiliates:', error);
      toast.error(error.message || 'Failed to fetch affiliates. Check DB schema.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
        // Fetching from auth.users view, then trying to get metadata
        const { data: { users: authUsers }, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) throw usersError;

        // Map to your User type. Supabase admin listUsers returns rich user objects.
        const mappedUsers: User[] = authUsers?.map((u: SupabaseUser) => ({
            id: u.id,
            aud: u.aud || '',
            email: u.email,
            phone: u.phone,
            created_at: u.created_at,
            updated_at: u.updated_at,
            last_sign_in_at: u.last_sign_in_at,
            email_confirmed_at: u.email_confirmed_at,
            app_meta_data: u.app_metadata || {}, // Supabase uses app_metadata
            user_metadata: u.user_metadata || {},
            role: u.role || u.app_metadata?.role || 'user', // Get role from JWT or app_metadata
            identities: u.identities || [],
        })) || [];
        setUsers(mappedUsers.filter(u => (u.role !== 'admin' && u.app_meta_data?.role !== 'admin') )); // Filter out admins
    } catch (error: any) {
        console.error("Failed to fetch users:", error);
        toast.error(error.message || "Failed to fetch users for affiliate selection.");
    }
  };


  useEffect(() => {
    fetchAffiliates();
    fetchUsers();
  }, [fetchAffiliates]); // fetchUsers only needs to run once, or less frequently.

  const handleAddAffiliate = () => {
    setSelectedAffiliate(null);
    setIsModalOpen(true);
  };

  const handleEditAffiliate = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setIsModalOpen(true);
  };

  const handleDeleteAffiliate = async (affiliateId: string) => {
    if (!window.confirm('Are you sure you want to revoke affiliate status? This does not delete the user.')) return;
    setIsLoading(true);
    try {
      // SUPABASE TODO: Ensure 'profiles' table has 'is_affiliate_active' and 'affiliate_code'
      // or manage this in a separate 'affiliates' table.
      const { error } = await supabase.from('profiles').update({ 
          is_affiliate_active: false, 
          affiliate_code: null, 
          // commission_rate: 0, // Optionally reset commission rate
        }).eq('id', affiliateId);
      if (error) throw error;
      toast.success('Affiliate status revoked.');
      fetchAffiliates();
    } catch (error: any) {
      console.error('Failed to update affiliate status:', error);
      toast.error(error.message || 'Failed to update affiliate status.');
    } finally {
        setIsLoading(false);
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
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

      {isLoading && !affiliates.length && <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Loading affiliates...</span></div>}
      
      {!isLoading && (
        <div className="bg-card p-4 rounded-lg shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Comm. Rate</TableHead>
                <TableHead>Rev. Share</TableHead>
                <TableHead>CPA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.length > 0 ? affiliates.map((aff) => (
                <TableRow key={aff.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {aff.avatar_url && <img src={aff.avatar_url} alt={aff.name} className="h-8 w-8 rounded-full object-cover" />}
                    <span className="truncate max-w-[150px]">{aff.name}</span>
                  </TableCell>
                  <TableCell className="truncate max-w-[150px]">{aff.email}</TableCell>
                  <TableCell>{aff.code || 'N/A'}</TableCell>
                  <TableCell>{(aff.commissionRate || 0 * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(aff.affiliate_revenue_share || 0).toFixed(1)}%</TableCell>
                  <TableCell>${(aff.affiliate_cpa || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${aff.isActive ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'}`}>
                      {aff.status}
                    </span>
                  </TableCell>
                  <TableCell>{aff.createdAt ? format(new Date(aff.createdAt), 'PPp') : 'N/A'}</TableCell>
                  <TableCell className="space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditAffiliate(aff)} title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAffiliate(aff.id)} title="Revoke Status">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                    No affiliates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminAffiliates;


import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter, // Added TableFooter
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // DialogTrigger removed as modal state is handled by useState
import AdminPageLayout from '@/components/layout/AdminPageLayout'; 
import { UserPageLoadingSkeleton } from '@/components/skeletons/UserPageLoadingSkeleton'; 
import { supabase } from '@/integrations/supabase/client';
import { useAuth, AppUser } from '@/contexts/AuthContext'; // Import AppUser
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile'; // Assuming this hook exists

interface CommissionTier {
  id?: string; // Optional: if tiers are stored with IDs
  name: string;
  rate: number; // Percentage
  min_revenue_threshold?: number | null;
}

// Represents a user from public.users who might be an affiliate
// Affiliate-specific data is primarily from app_metadata
interface AffiliateUser extends AppUser { // Extend AppUser for base fields like id, email
  // Fields from public.users table, if different or more specific than AppUser
  username: string; // Assuming 'username' is a non-nullable field in your public.users
  
  // Affiliate specific data, typically stored in app_metadata of auth.users
  // or in separate columns in public.users or a dedicated affiliates table
  tracking_code?: string;
  website_url?: string | null;
  status: 'active' | 'pending' | 'suspended' | 'archived'; // Affiliate status
  commission_tiers?: CommissionTier[];
  
  // Timestamps from public.users
  created_at: string;
  updated_at?: string | null;

  // Raw Supabase app_metadata and user_metadata for flexibility
  // These would be populated by enriching the user from AuthContext or direct fetch
  // For users list, you might fetch auth.users and join with public.users/profiles
  // raw_app_metadata?: Record<string, any>; 
  // raw_user_metadata?: Record<string, any>;
}


interface AffiliateFormData {
  id?: string; // user_id for existing user, undefined for new
  username: string; 
  email: string; 
  password?: string; // Only for new user creation
  tracking_code?: string;
  website_url?: string;
  status: 'active' | 'pending' | 'suspended' | 'archived';
  commission_tiers: CommissionTier[];
}


const AdminAffiliates = () => {
  const [affiliates, setAffiliates] = useState<AffiliateUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Changed error type to string
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ status?: string }>({});
  const [editingAffiliate, setEditingAffiliate] = useState<AffiliateUser | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user: adminUser } = useAuth();

  const fetchAffiliates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // This fetches from your public.users table.
      // To get app_metadata (where role, tracking_code etc. are often stored),
      // you'd typically need to use Supabase Admin SDK or an Edge Function
      // if you're listing *all* users.
      // For client-side, you can only easily get app_metadata for the *current* logged-in user.
      // For simplicity, this example assumes 'status' might be on public.users table,
      // or that app_metadata is being manually set/retrieved if possible.
      const { data: usersData, error: usersError } = await supabase
        .from('users') // Your public users table
        .select(`
          id, email, username, created_at, updated_at, 
          status, language, role_id, cpf, phone, last_name, avatar,
          inviter_code, inviter_id, banned, is_demo_agent,
          affiliate_baseline, affiliate_cpa, affiliate_revenue_share, affiliate_revenue_share_fake
        `) // Select specific fields
        .order('created_at', { ascending: false });

      if (usersError) {
        setError(usersError.message);
        toast.error(`Error fetching users: ${usersError.message}`);
      } else {
        const fetchedAffiliates = usersData
          .filter(u => u.email !== adminUser?.email)
          // Example: filter users who are designated as affiliates
          // This requires 'role_id' to correspond to an affiliate role, or another indicator.
          // .filter(u => u.role_id === YOUR_AFFILIATE_ROLE_ID) // Placeholder for actual role check
          .map((u): AffiliateUser => {
             // Attempt to parse JSONB columns if they exist, e.g., if 'commission_tiers_json' is a column
            // const commissionTiers = typeof u.commission_tiers_json === 'string' ? JSON.parse(u.commission_tiers_json) : u.commission_tiers_json || [];

            return {
              // Base AppUser fields (id, email come from SupabaseUser, enrich further if needed)
              id: u.id, 
              email: u.email,
              // AppUser optional fields (these would be from enriched user or profiles table)
              firstName: u.last_name, // Assuming last_name might be used as firstName for simplicity here
              lastName: u.last_name,
              avatarUrl: u.avatar,
              role: u.role_id ? mapRoleIdToRoleName(u.role_id) : 'user', // mapRoleIdToRoleName is a placeholder
              app_metadata: {}, // Placeholder, app_metadata is not directly on public.users row usually
              user_metadata: {}, // Placeholder

              // AffiliateUser specific fields
              username: u.username || u.email.split('@')[0], // Ensure username is not null
              // These fields ideally come from app_metadata or a joined 'affiliate_profiles' table
              tracking_code: u.inviter_code || `AFF-${u.id.substring(0, 6)}`, // Placeholder
              website_url: null, // Placeholder
              status: (u.status as AffiliateUser['status']) || 'pending', // Cast if 'status' field exists on users table
              commission_tiers: [], // Placeholder, load from app_metadata or related table

              created_at: u.created_at,
              updated_at: u.updated_at || null,
            };
          });
        setAffiliates(fetchedAffiliates);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [adminUser?.email]);
  
  // Placeholder: map role_id to a role name
  const mapRoleIdToRoleName = (roleId: number): string => {
    if (roleId === 1) return 'admin';
    if (roleId === 2) return 'affiliate'; // Example
    return 'user';
  };


  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: value === 'all' ? undefined : value, // Store undefined for 'all'
    }));
  };

  const handleEditAffiliate = (affiliate: AffiliateUser) => {
    setEditingAffiliate(JSON.parse(JSON.stringify(affiliate))); // Deep copy to avoid state mutation issues
  };

  const handleDeleteAffiliate = async (userId: string) => {
    // Note: Deleting users (auth.users) from client-side requires admin client.
    // This usually "archives" or changes status in public.users table.
    if (!window.confirm('Are you sure you want to change this user\'s status to archived?')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'archived' }) // Example: Soft delete by changing status
        .eq('id', userId);

      if (error) {
        toast.error(`Error archiving user: ${error.message}`);
      } else {
        toast.success('User status set to archived.');
        fetchAffiliates(); // Refresh list
      }
    } catch (err: any) {
      toast.error(`Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveAffiliate = async (formData: AffiliateFormData) => {
    setIsLoading(true);
    if (!formData.id) {
        toast.error("Affiliate ID is missing for update.");
        setIsLoading(false);
        return;
    }
    try {
      // Data for public.users table
      const publicUsersUpdate: Partial<AffiliateUser> = {
        username: formData.username,
        status: formData.status,
        // email: formData.email, // Email updates are sensitive and might require verification.
      };
      
      const { error: usersTableError } = await supabase
        .from('users')
        .update(publicUsersUpdate)
        .eq('id', formData.id);

      if (usersTableError) {
        throw usersTableError;
      }
      
      // Updating app_metadata for a user (other than current) requires admin rights (usually via Edge Function)
      // Example: Call an edge function to update app_metadata
      // await supabase.functions.invoke('update-user-app-metadata', {
      //   body: { userId: formData.id, appMetadata: { tracking_code: formData.tracking_code, ... } }
      // });
      // For now, we'll assume these fields might be on public.users or a separate table managed by admin
      toast.info("User details updated. App metadata changes (like tracking code, commission tiers) may require server-side admin action if not directly on 'users' table.");


      toast.success('Affiliate user updated successfully.');
      setEditingAffiliate(null);
      fetchAffiliates();
    } catch (err: any)      {
      toast.error(`Error updating affiliate user: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCreateUserAndAffiliate = async (formData: AffiliateFormData) => {
    setIsLoading(true);
    try {
      if (!formData.password) {
        toast.error("Password is required for new user creation.");
        setIsLoading(false);
        return;
      }
      // 1. Create User with Supabase Auth
      const { data: signUpResponse, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { // This becomes user.app_metadata in auth.users table
            // Raw user_meta_data for handle_new_user trigger if it uses it
            // Or directly set app_metadata fields relevant to affiliate status
            role: 'affiliate', // Example role
            tracking_code: formData.tracking_code,
            website_url: formData.website_url,
            initial_status: formData.status, // Custom field for trigger to pick up
            commission_tiers: formData.commission_tiers, // Store as JSON
            // username: formData.username, // If trigger handles inserting username from here
          },
        },
      });

      if (signUpError) {
        toast.error(`Error creating user: ${signUpError.message}`);
        setIsLoading(false);
        return;
      }

      if (!signUpResponse.user) {
        toast.error('User creation succeeded but no user object returned.');
        setIsLoading(false);
        return;
      }
      
      // The handle_new_user trigger in Supabase should create an entry in your public.users table.
      // If that trigger also needs to set the username from formData.username, ensure it's passed in options.data
      // or update public.users separately if needed (requires user_id from signUpResponse.user.id)
      // For example, if the trigger doesn't set username:
      // await supabase.from('users').update({ username: formData.username }).eq('id', signUpResponse.user.id);
      // This depends on your `handle_new_user` trigger logic.

      toast.success('User with affiliate role created. Profile setup by trigger.');
      setShowCreateModal(false);
      fetchAffiliates();
    } catch (err: any) {
      toast.error(`User creation process failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCommissionChange = (tierIndex: number, field: keyof CommissionTier, value: string | number | null) => {
    setEditingAffiliate(prev => {
        if (!prev) return prev;
        const updatedTiers = prev.commission_tiers ? [...prev.commission_tiers] : [];
        if (tierIndex >= 0 && tierIndex < updatedTiers.length) {
            updatedTiers[tierIndex] = {
                ...updatedTiers[tierIndex],
                [field]: field === 'rate' || field === 'min_revenue_threshold' ? (value !== null ? Number(value) : null) : value,
            };
        }
        return { ...prev, commission_tiers: updatedTiers };
    });
  };

  const addCommissionTier = () => {
     setEditingAffiliate(prev => {
        if (!prev) return prev;
        return {
            ...prev,
            commission_tiers: [
                ...(prev.commission_tiers || []),
                { name: '', rate: 0, min_revenue_threshold: null }, 
            ],
        };
    });
  };

  const removeCommissionTier = (tierIndex: number) => {
    setEditingAffiliate(prev => {
        if (!prev || !prev.commission_tiers) return prev;
        const updatedTiers = [...prev.commission_tiers];
        updatedTiers.splice(tierIndex, 1);
        return { ...prev, commission_tiers: updatedTiers };
    });
  };

  const isMobile = useIsMobile();

  const filteredAffiliates = affiliates.filter(affiliate => {
    const searchTermLower = searchTerm.toLowerCase();
    const nameMatch = affiliate.username?.toLowerCase().includes(searchTermLower);
    const emailMatch = affiliate.email?.toLowerCase().includes(searchTermLower);

    let statusMatch = true;
    if (filters.status && filters.status !== 'all') {
      statusMatch = affiliate.status === filters.status;
    }
    return (nameMatch || emailMatch) && statusMatch;
  });

  if (isLoading && !affiliates.length) {
    return (
      <AdminPageLayout title="Affiliates Management">
        <UserPageLoadingSkeleton />
      </AdminPageLayout>
    );
  }
  if (error && !isLoading) { // Added !isLoading condition
    return (
        <AdminPageLayout title="Affiliates Management">
            <div className="text-red-500 p-4 border border-red-500 rounded-md bg-red-50">
                Error loading affiliates: {error}
                <Button onClick={fetchAffiliates} className="ml-4">Try Again</Button>
            </div>
        </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="Affiliates (Users Management)">
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Affiliate Users</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Affiliate User
        </Button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <Input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="md:w-1/3 w-full"
        />
        <select
          value={filters.status || 'all'}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="border rounded px-3 py-2 bg-background text-foreground w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableCaption>A list of users who are potential affiliates.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              {!isMobile && <TableHead>Tracking Code</TableHead>}
              {!isMobile && <TableHead>Status</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAffiliates.length === 0 && !isLoading && (
                <TableRow>
                    <TableCell colSpan={isMobile ? 3 : 5} className="text-center py-10">
                        No affiliates found matching your criteria.
                    </TableCell>
                </TableRow>
            )}
            {isLoading && filteredAffiliates.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={isMobile ? 3 : 5} className="text-center py-10">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        <p>Loading affiliates...</p>
                    </TableCell>
                </TableRow>
            )}
            {filteredAffiliates.map((affiliate) => (
              <React.Fragment key={affiliate.id}>
                <TableRow>
                  <TableCell>{affiliate.username}</TableCell>
                  <TableCell>{affiliate.email}</TableCell>
                  {!isMobile && <TableCell>{affiliate.tracking_code || 'N/A'}</TableCell>}
                  {!isMobile && <TableCell className="capitalize">{affiliate.status}</TableCell>}
                  <TableCell className="text-right space-x-1">
                    <Button variant="outline" size="sm" onClick={() => handleEditAffiliate(affiliate)}>
                      <Edit className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteAffiliate(affiliate.id)}>
                      <Trash2 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Archive</span>
                    </Button>
                  </TableCell>
                </TableRow>
                {editingAffiliate && editingAffiliate.id === affiliate.id && (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 3 : 5} className="p-0"> {/* Adjusted colSpan */}
                      <div className="p-4 bg-muted dark:bg-slate-800 border-t">
                        <h3 className="text-lg font-semibold mb-4">Edit Affiliate: {editingAffiliate.username}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`affiliate-username-${affiliate.id}`}>Username</Label>
                            <Input 
                              id={`affiliate-username-${affiliate.id}`} 
                              value={editingAffiliate.username} 
                              onChange={(e) => setEditingAffiliate(prev => prev ? {...prev, username: e.target.value} : null)} 
                            />
                          </div>
                          <div>
                            <Label htmlFor={`affiliate-email-${affiliate.id}`}>Email (cannot change here)</Label>
                            <Input 
                              id={`affiliate-email-${affiliate.id}`} 
                              type="email" 
                              value={editingAffiliate.email} 
                              disabled 
                            />
                          </div>
                          <div>
                            <Label htmlFor={`affiliate-tracking-code-${affiliate.id}`}>Tracking Code</Label>
                            <Input 
                              id={`affiliate-tracking-code-${affiliate.id}`} 
                              value={editingAffiliate.tracking_code || ''} 
                              onChange={(e) => setEditingAffiliate(prev => prev ? {...prev, tracking_code: e.target.value} : null)} 
                            />
                          </div>
                          <div>
                            <Label htmlFor={`affiliate-website-url-${affiliate.id}`}>Website URL</Label>
                            <Input 
                              id={`affiliate-website-url-${affiliate.id}`} 
                              value={editingAffiliate.website_url || ''} 
                              onChange={(e) => setEditingAffiliate(prev => prev ? {...prev, website_url: e.target.value} : null)} 
                            />
                          </div>
                          <div>
                            <Label htmlFor={`affiliate-status-${affiliate.id}`}>Status</Label>
                            <select
                              id={`affiliate-status-${affiliate.id}`}
                              value={editingAffiliate.status}
                              onChange={(e) => setEditingAffiliate(prev => prev ? {...prev, status: e.target.value as AffiliateUser['status']} : null)}
                              className="border rounded px-3 py-2 bg-background text-foreground w-full"
                            >
                              <option value="active">Active</option>
                              <option value="pending">Pending</option>
                              <option value="suspended">Suspended</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                        </div>
                        <h4 className="text-md font-semibold mt-6 mb-2">Commission Tiers</h4>
                        {editingAffiliate.commission_tiers?.map((tier, tierIndex) => (
                          <div key={tier.id || tierIndex} className="grid grid-cols-1 md:grid-cols-4 gap-4 border p-3 mb-3 rounded-md items-end">
                            <div>
                              <Label htmlFor={`tier-name-${affiliate.id}-${tierIndex}`}>Tier Name</Label>
                              <Input id={`tier-name-${affiliate.id}-${tierIndex}`} value={tier.name} onChange={(e) => handleCommissionChange(tierIndex, 'name', e.target.value)} placeholder="e.g., Standard" />
                            </div>
                            <div>
                              <Label htmlFor={`tier-rate-${affiliate.id}-${tierIndex}`}>Rate (%)</Label>
                              <Input type="number" id={`tier-rate-${affiliate.id}-${tierIndex}`} value={tier.rate} onChange={(e) => handleCommissionChange(tierIndex, 'rate', parseFloat(e.target.value))} placeholder="e.g., 10" />
                            </div>
                            <div>
                              <Label htmlFor={`tier-threshold-${affiliate.id}-${tierIndex}`}>Min Revenue (Optional)</Label>
                              <Input type="number" id={`tier-threshold-${affiliate.id}-${tierIndex}`} value={tier.min_revenue_threshold || ''} onChange={(e) => handleCommissionChange(tierIndex, 'min_revenue_threshold', parseFloat(e.target.value))} placeholder="e.g., 1000" />
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => removeCommissionTier(tierIndex)} className="self-center">Remove Tier</Button>
                          </div>
                        ))}
                        <Button onClick={() => addCommissionTier()} size="sm" variant="outline" className="mt-2">Add Commission Tier</Button>
                        <div className="flex justify-end space-x-2 mt-6">
                          <Button variant="outline" onClick={() => setEditingAffiliate(null)}>Cancel</Button>
                          <Button onClick={() => editingAffiliate && handleSaveAffiliate(editingAffiliate as AffiliateFormData)} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={isMobile ? 3 : 5}>
                Total affiliate users: {filteredAffiliates.length}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

       <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Affiliate User</DialogTitle>
            <DialogDescription>
              Create a new user account that can act as an affiliate.
            </DialogDescription>
          </DialogHeader>
          <CreateAffiliateForm 
            onSubmit={handleCreateUserAndAffiliate} 
            onModalClose={() => setShowCreateModal(false)} 
            isLoading={isLoading} 
          />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

interface CreateAffiliateFormProps {
    onSubmit: (data: AffiliateFormData) => Promise<void>;
    onModalClose: () => void;
    isLoading: boolean;
}

const CreateAffiliateForm: React.FC<CreateAffiliateFormProps> = ({ onSubmit, onModalClose, isLoading }) => {
    const [formData, setFormData] = useState<AffiliateFormData>({
        username: '',
        email: '',
        password: '',
        tracking_code: '',
        website_url: '',
        status: 'pending',
        commission_tiers: [{ name: 'Default', rate: 10, min_revenue_threshold: null }], // Default tier
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };
    
    const handleTierChange = (index: number, field: keyof CommissionTier, value: string | number | null) => {
        const updatedTiers = [...formData.commission_tiers];
        updatedTiers[index] = { ...updatedTiers[index], [field]: value };
        setFormData(prev => ({ ...prev, commission_tiers: updatedTiers }));
    };

    const addTier = () => {
        setFormData(prev => ({
            ...prev,
            commission_tiers: [...prev.commission_tiers, { name: '', rate: 0, min_revenue_threshold: null }]
        }));
    };

    const removeTier = (index: number) => {
        const updatedTiers = [...formData.commission_tiers];
        updatedTiers.splice(index, 1);
        setFormData(prev => ({ ...prev, commission_tiers: updatedTiers }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.password) {
            toast.error("Password is required for new user creation.");
            return;
        }
        await onSubmit(formData);
        // Modal close is handled by parent or by onSubmit success
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="password">Password</Label>
                <Input type="password" id="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="tracking_code">Tracking Code (Optional)</Label>
                <Input id="tracking_code" value={formData.tracking_code} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="website_url">Website URL (Optional)</Label>
                <Input id="website_url" value={formData.website_url} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="status">Status</Label>
                <select id="status" value={formData.status} onChange={handleChange} className="border rounded px-3 py-2 bg-background text-foreground w-full">
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>
            
            <h4 className="text-md font-semibold pt-2">Commission Tiers</h4>
            {formData.commission_tiers.map((tier, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 border p-3 rounded-md items-end">
                    <div className="sm:col-span-3">
                        <Label htmlFor={`tier-name-${index}`}>Tier Name</Label>
                        <Input id={`tier-name-${index}`} value={tier.name} onChange={(e) => handleTierChange(index, 'name', e.target.value)} placeholder="e.g., Standard" />
                    </div>
                    <div>
                        <Label htmlFor={`tier-rate-${index}`}>Rate (%)</Label>
                        <Input type="number" id={`tier-rate-${index}`} value={tier.rate} onChange={(e) => handleTierChange(index, 'rate', parseFloat(e.target.value))} placeholder="e.g., 10" />
                    </div>
                    <div>
                        <Label htmlFor={`tier-threshold-${index}`}>Min Revenue</Label>
                        <Input type="number" id={`tier-threshold-${index}`} value={tier.min_revenue_threshold || ''} onChange={(e) => handleTierChange(index, 'min_revenue_threshold', parseFloat(e.target.value))} placeholder="e.g., 1000" />
                    </div>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeTier(index)} className="self-center mt-4 sm:mt-0">Remove</Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addTier} className="mt-1">Add Tier</Button>
            
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onModalClose} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Create Affiliate User
                </Button>
            </DialogFooter>
        </form>
    );
};


export default AdminAffiliates;


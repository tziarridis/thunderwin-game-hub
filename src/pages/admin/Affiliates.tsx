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
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea"; // Not used currently
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdminPageLayout from '@/components/layout/AdminPageLayout'; // Corrected path
import { UserPageLoadingSkeleton } from '@/components/skeletons/UserPageLoadingSkeleton'; // Corrected path
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2 } from 'lucide-react'; // Search, Filter removed as not used directly in this simplified version
import { useIsMobile } from '@/hooks/use-mobile';

// Adjusted Affiliate type to align with Supabase 'users' table and potential affiliate metadata
interface CommissionTier {
  id?: string;
  name: string;
  rate: number;
  min_revenue_threshold?: number | null;
}

interface Affiliate {
  id: string; // This will be the user_id from Supabase auth.users / public.users
  auth_id?: string; // Supabase auth.users.id if different from public.users.id
  name: string; // From users.username or a dedicated name field
  email: string; // From users.email
  tracking_code?: string; // This would ideally be in user_metadata or a separate affiliate profile table
  website_url?: string | null;
  status: 'active' | 'pending' | 'suspended' | 'archived'; // Could be from user_metadata or users table
  commission_tiers?: CommissionTier[]; // Store as JSONB in users table or separate table
  created_at: string;
  updated_at?: string | null;
  // Supabase user object structure for app_metadata
  app_metadata?: {
    role?: string;
    tracking_code?: string;
    website_url?: string;
    status?: 'active' | 'pending' | 'suspended' | 'archived';
    commission_tiers?: CommissionTier[];
    // other custom fields
  };
  user_metadata?: { // For standard user profile data
    full_name?: string; // Example
    avatar_url?: string;
  }
}

// Adjusted FormData for creating/editing an affiliate (user with affiliate role)
interface AffiliateFormData {
  id?: string; // user_id
  auth_id?: string;
  name: string; // For user creation (e.g. username)
  email: string; // For user creation
  password?: string; // For new user creation
  tracking_code?: string;
  website_url?: string;
  status: 'active' | 'pending' | 'suspended' | 'archived';
  commission_tiers: CommissionTier[];
}


const AdminAffiliates = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ status?: string }>({});
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user: adminUser } = useAuth(); // Assuming adminUser is the logged-in admin

  const fetchAffiliates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch users who might be affiliates.
      // Ideally, filter by a role or a specific field in app_metadata.
      // For now, fetching all users and assuming role is in app_metadata.
      const { data: usersData, error: usersError } = await supabase
        .from('users') // Querying the 'users' table
        .select('*') // Select all fields from users table
        .order('created_at', { ascending: false });

      if (usersError) {
        setError(usersError);
        toast.error(`Error fetching users: ${usersError.message}`);
      } else {
        // Transform usersData to Affiliate[]
        // This requires knowing how affiliate-specific data is stored (e.g., in app_metadata)
        // For now, we'll assume some fields might be in user_metadata or app_metadata
        const fetchedAffiliates = usersData
          .filter(u => u.email !== adminUser?.email) // Filter out the admin user if desired
          // .filter(u => u.app_metadata?.role === 'affiliate') // Ideal filter
          .map(u => ({
            id: u.id, // Assuming public.users.id
            // auth_id: u.auth_id, // If you have a separate auth_id column in public.users linked to auth.users.id
            name: u.username || u.email, // Use username or fallback to email
            email: u.email,
            // Attempt to get affiliate specific data from a hypothetical app_metadata structure
            tracking_code: (u.app_metadata as any)?.tracking_code || `TEMP-${u.id.substring(0,6)}`,
            website_url: (u.app_metadata as any)?.website_url || undefined,
            status: (u.app_metadata as any)?.status || 'pending',
            commission_tiers: (u.app_metadata as any)?.commission_tiers || [],
            created_at: u.created_at,
            updated_at: u.updated_at,
            app_metadata: (u.app_metadata as any) || {},
            user_metadata: (u.user_metadata as any) || {},
          }));
        setAffiliates(fetchedAffiliates as Affiliate[]);
      }
    } catch (err: any) {
      setError(err);
      toast.error(`Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [adminUser?.email]);

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleEditAffiliate = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
  };

  const handleDeleteAffiliate = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user (affiliate)? This might be irreversible.')) return;

    setIsLoading(true);
    try {
      // Deleting a user is complex. It involves deleting from auth.users and then public.users.
      // This requires admin privileges for supabase.auth.admin.deleteUser.
      // For now, we'll just "archive" or change status in public.users if possible, or simulate deletion.
      // const { error: adminDeleteError } = await supabase.auth.admin.deleteUser(userId); // Requires auth_id
      // if (adminDeleteError) {
      //   toast.error(`Error deleting auth user: ${adminDeleteError.message}`);
      //   setIsLoading(false);
      //   return;
      // }
      // This is a placeholder, actual deletion from users table
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        toast.error(`Error deleting user from public table: ${error.message}`);
      } else {
        toast.success('User (affiliate) marked for deletion or deleted.');
        fetchAffiliates();
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
      const updateData: Partial<Affiliate> & { app_metadata?: any } = {
        username: formData.name, // Assuming name maps to username
        email: formData.email, // Email update might need special handling (verification)
        // To update app_metadata, you usually need an admin client or an edge function
        // For client-side, this might not directly work or is insecure.
        app_metadata: {
            ...(editingAffiliate?.app_metadata || {}), // Preserve existing app_metadata
            role: 'affiliate', // Ensure role is set
            tracking_code: formData.tracking_code,
            website_url: formData.website_url,
            status: formData.status,
            commission_tiers: formData.commission_tiers,
        }
      };
       // This will update the public.users table.
       // Updating app_metadata directly from client-side for other users is generally not allowed for security reasons.
       // This should ideally be done via a secure Edge Function or with admin rights.
      const { data, error } = await supabase
        .from('users')
        .update({
            username: formData.name,
            // email: formData.email, // Email updates are sensitive
            // Store affiliate specific data in a jsonb column if 'users' table has one, e.g., 'affiliate_data'
            // Or rely on app_metadata updates via admin (which is complex from client)
            // For now, showing intent, but direct app_metadata update from client for *other* users is tricky.
            // This part needs a proper backend mechanism (Edge Function).
            // As a placeholder, we'll update fields that are on the 'users' table directly if they exist.
            // If 'status' is a column on 'users':
            // status: formData.status, 
        })
        .eq('id', formData.id)
        .select()
        .single();

      if (error) {
        toast.error(`Error updating user (affiliate): ${error.message}. App metadata updates might require admin rights or an edge function.`);
      } else {
        toast.success('Affiliate (user) updated successfully. Metadata changes may need server-side processing.');
        setEditingAffiliate(null);
        fetchAffiliates();
      }
    } catch (err: any)      {
      toast.error(`Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCreateUserAndAffiliate = async (formData: AffiliateFormData) => {
    setIsLoading(true);
    try {
      // 1. Create User
      const { data: userResponse, error: userError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password || 'defaultpassword', // TODO: Improve password handling
        options: {
          data: { // This becomes user.app_metadata in auth.users
            full_name: formData.name, // Will be available in app_metadata
            role: 'affiliate',
            tracking_code: formData.tracking_code,
            website_url: formData.website_url,
            status: formData.status,
            commission_tiers: formData.commission_tiers,
            // Any other initial affiliate data
          },
        },
      });

      if (userError) {
        toast.error(`Error creating user: ${userError.message}`);
        setIsLoading(false);
        return;
      }

      if (!userResponse.user?.id) {
        toast.error('User creation failed, user ID not found.');
        setIsLoading(false);
        return;
      }
      // The handle_new_user trigger should create an entry in public.users table.
      // We might need to update that public.users entry if affiliate specific columns exist there.
      // For now, assuming app_metadata is sufficient or handle_new_user also populates these.

      toast.success('User with affiliate role created successfully. Profile will be set up by trigger.');
      setShowCreateModal(false);
      fetchAffiliates();
    } catch (err: any) {
      toast.error(`Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCommissionChange = (affiliateId: string, tierIndex: number, field: keyof CommissionTier, value: string | number | null) => {
    setEditingAffiliate(prev => {
        if (!prev || prev.id !== affiliateId) return prev;
        const updatedTiers = [...(prev.commission_tiers || [])];
        if (tierIndex >= 0 && tierIndex < updatedTiers.length) {
            updatedTiers[tierIndex] = {
                ...updatedTiers[tierIndex],
                [field]: value,
            };
        }
        return { ...prev, commission_tiers: updatedTiers };
    });
  };

  const addCommissionTier = (affiliateId: string) => {
     setEditingAffiliate(prev => {
        if (!prev || prev.id !== affiliateId) return prev;
        return {
            ...prev,
            commission_tiers: [
                ...(prev.commission_tiers || []),
                { name: '', rate: 0 }, 
            ],
        };
    });
  };

  const removeCommissionTier = (affiliateId: string, tierIndex: number) => {
    setEditingAffiliate(prev => {
        if (!prev || prev.id !== affiliateId) return prev;
        const updatedTiers = [...(prev.commission_tiers || [])];
        updatedTiers.splice(tierIndex, 1);
        return { ...prev, commission_tiers: updatedTiers };
    });
  };


  useEffect(() => {
    // Reset editingAffiliate when it changes - this was causing data not to show in edit form
    // if (editingAffiliate) {
      // NO: This logic was clearing the form.
      // The `editingAffiliate` state itself is what powers the form.
    // }
  }, [editingAffiliate]);

  const isMobile = useIsMobile();

  const filteredAffiliates = affiliates.filter(affiliate => {
    const searchTermLower = searchTerm.toLowerCase();
    // Using optional chaining for safety as these fields might be missing
    const nameMatch = affiliate.name?.toLowerCase().includes(searchTermLower);
    const emailMatch = affiliate.email?.toLowerCase().includes(searchTermLower);

    let statusMatch = true;
    if (filters.status && filters.status !== 'all') {
      statusMatch = affiliate.status === filters.status;
    }
    return (nameMatch || emailMatch) && statusMatch;
  });

  if (isLoading && !affiliates.length) return <UserPageLoadingSkeleton />;
  if (error) return <div className="text-red-500">Error loading affiliates: {error.message}</div>;

  return (
    <AdminPageLayout title="Affiliates (Users)"> {/* Updated title */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Affiliates Management (Users)</h1>
        <Button onClick={() => {
          // Reset form data for create modal
          // setEditingAffiliate(null); // Clear any existing edit state
          // Set default form data for new affiliate
          // Or handle this within the modal component itself
          setShowCreateModal(true);
        }}><PlusCircle className="mr-2 h-4 w-4" /> Create Affiliate User</Button>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <Input
          type="text"
          placeholder="Search affiliates by name or email..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="md:w-1/3"
        />
        <select
          value={filters.status || 'all'}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="border rounded px-2 py-1 bg-background text-foreground"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <Table>
        <TableCaption>A list of users (potential affiliates).</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            {!isMobile && <TableHead>Tracking Code</TableHead>}
            {!isMobile && <TableHead>Website URL</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAffiliates.map((affiliate) => (
            <React.Fragment key={affiliate.id}>
              <TableRow>
                <TableCell>{affiliate.name}</TableCell>
                <TableCell>{affiliate.email}</TableCell>
                {!isMobile && <TableCell>{affiliate.tracking_code || 'N/A'}</TableCell>}
                {!isMobile && <TableCell>{affiliate.website_url || 'N/A'}</TableCell>}
                <TableCell>{affiliate.status}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEditAffiliate(affiliate)}>
                    <Edit className="mr-2 h-4 w-4" />Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteAffiliate(affiliate.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />Delete
                  </Button>
                </TableCell>
              </TableRow>
              {editingAffiliate && editingAffiliate.id === affiliate.id && (
                <tr>
                  <td colSpan={isMobile ? 4 : 6} className="p-0"> {/* Adjusted colSpan */}
                    <div className="p-4 bg-muted dark:bg-slate-800">
                      <h3 className="text-lg font-semibold mb-4">Edit Affiliate: {editingAffiliate.name}</h3>
                       {/* Form fields should use editingAffiliate data */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`affiliate-name-${affiliate.id}`}>Name</Label>
                          <Input 
                            id={`affiliate-name-${affiliate.id}`} 
                            value={editingAffiliate.name} 
                            onChange={(e) => setEditingAffiliate(prev => prev ? {...prev, name: e.target.value} : null)} 
                          />
                        </div>
                        <div>
                          <Label htmlFor={`affiliate-email-${affiliate.id}`}>Email</Label>
                          <Input 
                            id={`affiliate-email-${affiliate.id}`} 
                            type="email" 
                            value={editingAffiliate.email} 
                            onChange={(e) => setEditingAffiliate(prev => prev ? {...prev, email: e.target.value} : null)} 
                            // disabled // Email changes are sensitive
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
                            onChange={(e) => setEditingAffiliate(prev => prev ? {...prev, status: e.target.value as Affiliate['status']} : null)}
                            className="border rounded px-2 py-1 bg-background text-foreground w-full"
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
                        <div key={tierIndex} className="grid grid-cols-1 md:grid-cols-4 gap-4 border p-3 mb-3 rounded-md items-end">
                          <div>
                            <Label htmlFor={`tier-name-${affiliate.id}-${tierIndex}`}>Tier Name</Label>
                            <Input id={`tier-name-${affiliate.id}-${tierIndex}`} value={tier.name} onChange={(e) => handleCommissionChange(affiliate.id, tierIndex, 'name', e.target.value)} placeholder="e.g., Standard" />
                          </div>
                          <div>
                            <Label htmlFor={`tier-rate-${affiliate.id}-${tierIndex}`}>Rate (%)</Label>
                            <Input type="number" id={`tier-rate-${affiliate.id}-${tierIndex}`} value={tier.rate} onChange={(e) => handleCommissionChange(affiliate.id, tierIndex, 'rate', parseFloat(e.target.value))} placeholder="e.g., 10" />
                          </div>
                          <div>
                            <Label htmlFor={`tier-threshold-${affiliate.id}-${tierIndex}`}>Min Revenue (Optional)</Label>
                            <Input type="number" id={`tier-threshold-${affiliate.id}-${tierIndex}`} value={tier.min_revenue_threshold || ''} onChange={(e) => handleCommissionChange(affiliate.id, tierIndex, 'min_revenue_threshold', parseFloat(e.target.value))} placeholder="e.g., 1000" />
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => removeCommissionTier(affiliate.id, tierIndex)} className="self-center">Remove Tier</Button>
                        </div>
                      ))}
                      <Button onClick={() => addCommissionTier(affiliate.id)} size="sm" className="mt-2">Add Commission Tier</Button>
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button variant="outline" onClick={() => setEditingAffiliate(null)}>Cancel</Button>
                        <Button onClick={() => editingAffiliate && handleSaveAffiliate(editingAffiliate as AffiliateFormData)}>Save Changes</Button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={isMobile ? 4: 6}>
              {filteredAffiliates.length} {filteredAffiliates.length === 1 ? 'affiliate user' : 'affiliate users'}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

       <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Affiliate User</DialogTitle>
            <DialogDescription>
              Create a new user account with an affiliate role.
            </DialogDescription>
          </DialogHeader>
          {/* This form needs to be controlled and use a state object for formData */}
          <CreateAffiliateForm onSubmit={handleCreateUserAndAffiliate} onModalClose={() => setShowCreateModal(false)} />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

// A new component for the creation form to manage its own state
interface CreateAffiliateFormProps {
    onSubmit: (data: AffiliateFormData) => Promise<void>;
    onModalClose: () => void;
}

const CreateAffiliateForm: React.FC<CreateAffiliateFormProps> = ({ onSubmit, onModalClose }) => {
    const [formData, setFormData] = useState<AffiliateFormData>({
        name: '',
        email: '',
        password: '',
        tracking_code: '',
        website_url: '',
        status: 'pending',
        commission_tiers: [],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };
    
    // Simplified commission tier handling for create form for brevity
    // A more robust solution would allow adding/removing tiers here too

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.password) {
            toast.error("Password is required for new user creation.");
            return;
        }
        await onSubmit(formData);
        // onModalClose(); // onSubmit should handle closing on success
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                {/* Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
                </div>
                {/* Email */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input type="email" id="email" value={formData.email} onChange={handleChange} className="col-span-3" required />
                </div>
                {/* Password */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">Password</Label>
                    <Input type="password" id="password" value={formData.password} onChange={handleChange} className="col-span-3" required />
                </div>
                {/* Tracking Code */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tracking_code" className="text-right">Tracking Code</Label>
                    <Input id="tracking_code" value={formData.tracking_code} onChange={handleChange} className="col-span-3" />
                </div>
                {/* Website URL */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="website_url" className="text-right">Website URL</Label>
                    <Input id="website_url" value={formData.website_url} onChange={handleChange} className="col-span-3" />
                </div>
                {/* Status */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <select id="status" value={formData.status} onChange={handleChange} className="col-span-3 border rounded px-2 py-1 bg-background text-foreground w-full">
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
                {/* Commission Tiers - simplified for create form, could be more complex */}
                 <p className="text-sm text-muted-foreground col-span-4">Commission tiers can be configured after creation.</p>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onModalClose}>Cancel</Button>
                <Button type="submit">Create Affiliate</Button>
            </DialogFooter>
        </form>
    );
};


export default AdminAffiliates;

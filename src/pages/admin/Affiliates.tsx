import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { UserPageLoadingSkeleton } from '../user/UserPageLoadingSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Assuming types like Affiliate, AffiliateFormData, CommissionTier are defined elsewhere or imported
// For example:
// import { Affiliate, AffiliateFormData, CommissionTier } from '@/types/affiliate'; // Ensure this path is correct

// Placeholder types if not imported (should be imported ideally)
interface CommissionTier {
  id?: string;
  name: string;
  rate: number;
  min_revenue_threshold?: number | null;
}
interface Affiliate {
  id: string;
  user_id: string;
  name: string;
  email?: string; // Added email as it's often part of user/affiliate data
  tracking_code: string;
  website_url?: string | null;
  status: 'active' | 'pending' | 'suspended' | 'archived';
  commission_tiers?: CommissionTier[];
  created_at: string;
  updated_at?: string | null;
  user?: { /* basic user details if joined */
    email?: string;
    full_name?: string;
  }
}
interface AffiliateFormData {
  id?: string;
  user_id?: string; // For linking to an existing user or for creation
  name: string;
  email: string; // For user creation
  password?: string; // For new user creation
  tracking_code: string;
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
  const { user } = useAuth();

  const fetchAffiliates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select(`*, user:user_id (email, full_name)`)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error);
        toast.error(`Error fetching affiliates: ${error.message}`);
      } else {
        setAffiliates(data);
      }
    } catch (err: any) {
      setError(err);
      toast.error(`Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const handleDeleteAffiliate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this affiliate?')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('affiliates')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error(`Error deleting affiliate: ${error.message}`);
      } else {
        toast.success('Affiliate deleted successfully.');
        fetchAffiliates(); // Refresh the list
      }
    } catch (err: any) {
      toast.error(`Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAffiliate = async (formData: AffiliateFormData) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .update(formData)
        .eq('id', formData.id)
        .select()
        .single();

      if (error) {
        toast.error(`Error updating affiliate: ${error.message}`);
      } else {
        toast.success('Affiliate updated successfully.');
        setEditingAffiliate(null); // Close the editing form
        fetchAffiliates(); // Refresh the list
      }
    } catch (err: any) {
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
        password: formData.password || 'defaultpassword', // Consider generating a random password
        options: {
          data: {
            full_name: formData.name,
            role: 'affiliate',
          },
        },
      });

      if (userError) {
        toast.error(`Error creating user: ${userError.message}`);
        return;
      }

      if (!userResponse.user?.id) {
        toast.error('User creation failed, user ID not found.');
        return;
      }

      // 2. Create Affiliate Profile
      const { error: affiliateError } = await supabase
        .from('affiliates')
        .insert([
          {
            user_id: userResponse.user.id,
            name: formData.name,
            tracking_code: formData.tracking_code,
            website_url: formData.website_url,
            status: formData.status,
            commission_tiers: formData.commission_tiers,
          },
        ]);

      if (affiliateError) {
        // Optionally delete the created user if affiliate creation fails
        await supabase.auth.admin.deleteUser(userResponse.user.id);
        toast.error(`Error creating affiliate: ${affiliateError.message}`);
        return;
      }

      toast.success('Affiliate created successfully.');
      setShowCreateModal(false);
      fetchAffiliates(); // Refresh the list
    } catch (err: any) {
      toast.error(`Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommissionChange = (affiliateId: string, tierIndex: number, field: keyof CommissionTier, value: string | number | null) => {
    setAffiliates(prevAffiliates =>
      prevAffiliates.map(affiliate => {
        if (affiliate.id === affiliateId) {
          const updatedTiers = [...(affiliate.commission_tiers || [])];
          // Ensure tierIndex is within bounds
          if (tierIndex >= 0 && tierIndex < updatedTiers.length) {
            updatedTiers[tierIndex] = {
              ...updatedTiers[tierIndex],
              [field]: value,
            };
          }
          return { ...affiliate, commission_tiers: updatedTiers };
        }
        return affiliate;
      })
    );
  };

  const addCommissionTier = (affiliateId: string) => {
    setAffiliates(prevAffiliates =>
      prevAffiliates.map(affiliate => {
        if (affiliate.id === affiliateId) {
          return {
            ...affiliate,
            commission_tiers: [
              ...(affiliate.commission_tiers || []),
              { name: '', rate: 0 }, // Default values for a new tier
            ],
          };
        }
        return affiliate;
      })
    );
  };

  const removeCommissionTier = (affiliateId: string, tierIndex: number) => {
    setAffiliates(prevAffiliates =>
      prevAffiliates.map(affiliate => {
        if (affiliate.id === affiliateId) {
          const updatedTiers = [...(affiliate.commission_tiers || [])];
          updatedTiers.splice(tierIndex, 1); // Remove the tier at tierIndex
          return { ...affiliate, commission_tiers: updatedTiers };
        }
        return affiliate;
      })
    );
  };

  useEffect(() => {
    // Reset editingAffiliate when it changes
    if (editingAffiliate) {
      // You might want to perform additional logic here when editingAffiliate changes
    }
  }, [editingAffiliate]);

  const isMobile = useIsMobile();

  const filteredAffiliates = affiliates.filter(affiliate => {
    const searchTermLower = searchTerm.toLowerCase();
    const nameMatch = affiliate.name.toLowerCase().includes(searchTermLower);
    const emailMatch = affiliate.user?.email?.toLowerCase().includes(searchTermLower); // Check nested email

    let statusMatch = true;
    if (filters.status && filters.status !== 'all') {
      statusMatch = affiliate.status === filters.status;
    }

    return (nameMatch || emailMatch) && statusMatch;
  });

  if (isLoading) return <UserPageLoadingSkeleton />;
  if (error) return <div className="text-red-500">Error loading affiliates: {error.message}</div>;

  return (
    <AdminPageLayout title="Affiliates">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Affiliates</h1>
        <Button onClick={() => setShowCreateModal(true)}><PlusCircle className="mr-2 h-4 w-4" /> Create Affiliate</Button>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <Input
          type="text"
          placeholder="Search affiliates..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="md:w-1/3"
        />
        <select
          value={filters.status || 'all'}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="border rounded px-2 py-1 bg-background"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <Table>
        <TableCaption>A list of your affiliates.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {!isMobile && <TableHead>Email</TableHead>}
            <TableHead>Tracking Code</TableHead>
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
                {!isMobile && <TableCell>{affiliate.user?.email}</TableCell>}
                <TableCell>{affiliate.tracking_code}</TableCell>
                {!isMobile && <TableCell>{affiliate.website_url}</TableCell>}
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
                  <td colSpan={isMobile ? 3 : 7} className="p-0">
                    <div className="p-4 bg-muted dark:bg-slate-800">
                      <h3 className="text-lg font-semibold mb-4">Edit Affiliate: {editingAffiliate.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`affiliate-name-${affiliate.id}`}>Name</Label>
                          <Input id={`affiliate-name-${affiliate.id}`} value={editingAffiliate.name} onChange={(e) => setAffiliates(prevAffiliates =>
                            prevAffiliates.map(a => a.id === affiliate.id ? { ...a, name: e.target.value } : a)
                          )} />
                        </div>
                        <div>
                          <Label htmlFor={`affiliate-email-${affiliate.id}`}>Email</Label>
                          <Input id={`affiliate-email-${affiliate.id}`} type="email" value={editingAffiliate.user?.email || ''} disabled />
                        </div>
                        <div>
                          <Label htmlFor={`affiliate-tracking-code-${affiliate.id}`}>Tracking Code</Label>
                          <Input id={`affiliate-tracking-code-${affiliate.id}`} value={editingAffiliate.tracking_code} onChange={(e) => setAffiliates(prevAffiliates =>
                            prevAffiliates.map(a => a.id === affiliate.id ? { ...a, tracking_code: e.target.value } : a)
                          )} />
                        </div>
                        <div>
                          <Label htmlFor={`affiliate-website-url-${affiliate.id}`}>Website URL</Label>
                          <Input id={`affiliate-website-url-${affiliate.id}`} value={editingAffiliate.website_url || ''} onChange={(e) => setAffiliates(prevAffiliates =>
                            prevAffiliates.map(a => a.id === affiliate.id ? { ...a, website_url: e.target.value } : a)
                          )} />
                        </div>
                        <div>
                          <Label htmlFor={`affiliate-status-${affiliate.id}`}>Status</Label>
                          <select
                            id={`affiliate-status-${affiliate.id}`}
                            value={editingAffiliate.status}
                            onChange={(e) => setAffiliates(prevAffiliates =>
                              prevAffiliates.map(a => a.id === affiliate.id ? { ...a, status: e.target.value as 'active' | 'pending' | 'suspended' | 'archived' } : a)
                            )}
                            className="border rounded px-2 py-1 bg-background"
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
                            {/* Assuming shadcn Label component, it handles its own closing. If raw <label>, it needs </label> */}
                            <label htmlFor={`tier-name-${affiliate.id}-${tierIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tier Name</label>
                            <input id={`tier-name-${affiliate.id}-${tierIndex}`} value={tier.name} onChange={(e) => handleCommissionChange(affiliate.id, tierIndex, 'name', e.target.value)} placeholder="e.g., Standard" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                          </div>
                          <div>
                            {/* THIS IS WHERE THE ERROR WAS (around line 198) */}
                            <label htmlFor={`tier-rate-${affiliate.id}-${tierIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Rate (%)
                            </label> {/* Ensure this closing tag is present. This is the fix. */}
                            <input type="number" id={`tier-rate-${affiliate.id}-${tierIndex}`} value={tier.rate} onChange={(e) => handleCommissionChange(affiliate.id, tierIndex, 'rate', parseFloat(e.target.value))} placeholder="e.g., 10" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                          </div>
                          <div>
                            <label htmlFor={`tier-threshold-${affiliate.id}-${tierIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Min Revenue (Optional)</label>
                            <input type="number" id={`tier-threshold-${affiliate.id}-${tierIndex}`} value={tier.min_revenue_threshold || ''} onChange={(e) => handleCommissionChange(affiliate.id, tierIndex, 'min_revenue_threshold', parseFloat(e.target.value))} placeholder="e.g., 1000" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
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
            <TableCell colSpan={6}>
              {filteredAffiliates.length} {filteredAffiliates.length === 1 ? 'affiliate' : 'affiliates'}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogTrigger asChild>
          {/* The button is now outside, in the page header */}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Affiliate</DialogTitle>
            <DialogDescription>
              Create a new affiliate account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input type="email" id="email" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trackingCode" className="text-right">
                Tracking Code
              </Label>
              <Input id="trackingCode" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="websiteUrl" className="text-right">
                Website URL
              </Label>
              <Input id="websiteUrl" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <select
                id="status"
                defaultValue="pending"
                className="col-span-3 border rounded px-2 py-1 bg-background"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Affiliate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default AdminAffiliates;

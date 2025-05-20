import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Affiliate } from '@/types/affiliate';
import { User } from '@/types/user'; // Assuming User type for general user info
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog'; // Assuming this exists
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// Zod schema for affiliate form validation
const affiliateSchema = z.object({
  userId: z.string().uuid({ message: "Valid User ID is required." }),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  code: z.string().optional(),
  commissionRate: z.number().min(0).max(1).optional(), // e.g., 0.2 for 20%
  isActive: z.boolean().default(true),
  // Add other relevant fields from Affiliate type that are editable
  affiliate_revenue_share: z.number().min(0).optional(),
  affiliate_cpa: z.number().min(0).optional(),
  affiliate_baseline: z.number().min(0).optional(),
});

type AffiliateFormData = z.infer<typeof affiliateSchema>;

const AdminAffiliates: React.FC = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [users, setUsers] = useState<User[]>([]); // For selecting user to become affiliate
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [affiliateToDelete, setAffiliateToDelete] = useState<Affiliate | null>(null);
  
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAffiliates, setTotalAffiliates] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof Affiliate | null>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');


  const form = useForm<AffiliateFormData>({
    resolver: zodResolver(affiliateSchema),
    defaultValues: {
      isActive: true,
    }
  });

  const fetchAffiliates = useCallback(async (page: number, search: string, sortCol: keyof Affiliate | null, sortDir: 'asc' | 'desc') => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('affiliates') // Assuming your table is named 'affiliates'
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,code.ilike.%${search}%`);
      }
      
      if (sortCol) {
        query = query.order(sortCol, { ascending: sortDir === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      setAffiliates(data || []);
      setTotalAffiliates(count || 0);
    } catch (error: any) {
      toast.error(`Failed to fetch affiliates: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUsers = async () => { // Fetch users who are not yet affiliates
    try {
      // This might need refinement if you have many users.
      // Ideally, fetch users not present in the affiliates table.
      const { data, error } = await supabase.from('users').select('id, username, email').limit(100); // Example selection
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch users: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchAffiliates(currentPage, searchTerm, sortColumn, sortDirection);
  }, [fetchAffiliates, currentPage, searchTerm, sortColumn, sortDirection]);

  useEffect(() => {
    if (showFormDialog) {
      fetchUsers(); // Fetch users when form dialog opens for assigning
      if (editingAffiliate) {
        form.reset({
          userId: editingAffiliate.userId, // This would be the public.users ID
          name: editingAffiliate.name,
          email: editingAffiliate.email,
          code: editingAffiliate.code || '',
          commissionRate: editingAffiliate.commissionRate || 0,
          isActive: editingAffiliate.isActive !== undefined ? editingAffiliate.isActive : true,
          affiliate_revenue_share: editingAffiliate.affiliate_revenue_share || 0,
          affiliate_cpa: editingAffiliate.affiliate_cpa || 0,
          affiliate_baseline: editingAffiliate.affiliate_baseline || 0,
        });
      } else {
        form.reset({
            userId: '', name: '', email: '', code: '', commissionRate: 0.1, isActive: true, // Default values
            affiliate_revenue_share: 0, affiliate_cpa: 0, affiliate_baseline: 0,
        });
      }
    }
  }, [showFormDialog, editingAffiliate, form]);

  const handleFormSubmit = async (formData: AffiliateFormData) => {
    setIsLoading(true);
    try {
      // Map AffiliateFormData to the structure expected by your 'affiliates' table
      const affiliateDataPayload = {
        user_id: formData.userId, // Ensure this is the correct foreign key to your public.users table
        name: formData.name,
        email: formData.email,
        code: formData.code || `REF-${formData.name.substring(0,3).toUpperCase()}${Date.now()%10000}`, // Auto-generate code if empty
        commission_rate: formData.commissionRate,
        is_active: formData.isActive,
        // Other fields from your 'affiliates' table schema
        affiliate_revenue_share: formData.affiliate_revenue_share,
        affiliate_cpa: formData.affiliate_cpa,
        affiliate_baseline: formData.affiliate_baseline,
        // 'created_at' and 'updated_at' are usually handled by db
      };

      if (editingAffiliate) {
        const { error } = await supabase
          .from('affiliates')
          .update(affiliateDataPayload)
          .eq('id', editingAffiliate.id); // Assuming 'id' is the primary key of 'affiliates' table
        if (error) throw error;
        toast.success('Affiliate updated successfully!');
      } else {
        // Check if user is already an affiliate
        const { data: existingAffiliate, error: fetchError } = await supabase
          .from('affiliates')
          .select('id')
          .eq('user_id', formData.userId)
          .single();
        
        if(fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'exact one row not found'
            throw fetchError;
        }
        if(existingAffiliate) {
            toast.error('This user is already an affiliate.');
            setIsLoading(false);
            return;
        }

        const { error } = await supabase.from('affiliates').insert(affiliateDataPayload);
        if (error) throw error;
        toast.success('Affiliate created successfully!');
      }
      setShowFormDialog(false);
      setEditingAffiliate(null);
      fetchAffiliates(currentPage, searchTerm, sortColumn, sortDirection); // Refresh list
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (affiliate: Affiliate) => {
    setAffiliateToDelete(affiliate);
    setShowConfirmDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!affiliateToDelete) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('affiliates').delete().eq('id', affiliateToDelete.id);
      if (error) throw error;
      toast.success('Affiliate deleted successfully!');
      setShowConfirmDeleteDialog(false);
      setAffiliateToDelete(null);
      fetchAffiliates(currentPage, searchTerm, sortColumn, sortDirection); // Refresh list
    } catch (error: any) {
      toast.error(`Failed to delete affiliate: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSort = (column: keyof Affiliate) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const SortIndicator = ({ column }: { column: keyof Affiliate }) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />;
    }
    return null;
  };

  const totalPages = Math.ceil(totalAffiliates / itemsPerPage);

  return (
    <div className="container mx-auto p-4">
      <CMSPageHeader
        title="Affiliate Management"
        description="Manage your casino affiliates."
        actions={
          <Button onClick={() => { setEditingAffiliate(null); setShowFormDialog(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Affiliate
          </Button>
        }
      />

      <div className="mb-4 flex items-center">
        <Input
          placeholder="Search affiliates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => fetchAffiliates(1, searchTerm, sortColumn, sortDirection)} className="ml-2">
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>
      
      {isLoading && affiliates.length === 0 && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}

      {!isLoading && affiliates.length === 0 && searchTerm && (
        <p className="text-center text-muted-foreground py-4">No affiliates found matching "{searchTerm}".</p>
      )}
      {!isLoading && affiliates.length === 0 && !searchTerm && (
        <p className="text-center text-muted-foreground py-4">No affiliates created yet. Click "Add New Affiliate" to start.</p>
      )}


      {affiliates.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('name')}>Name <SortIndicator column="name" /></TableHead>
                <TableHead onClick={() => handleSort('email')}>Email <SortIndicator column="email" /></TableHead>
                <TableHead onClick={() => handleSort('code')}>Code <SortIndicator column="code" /></TableHead>
                <TableHead onClick={() => handleSort('commissionRate')}>Rate <SortIndicator column="commissionRate" /></TableHead>
                <TableHead onClick={() => handleSort('isActive')}>Status <SortIndicator column="isActive" /></TableHead>
                <TableHead onClick={() => handleSort('createdAt')}>Joined <SortIndicator column="createdAt" /></TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell>{affiliate.name}</TableCell>
                  <TableCell>{affiliate.email}</TableCell>
                  <TableCell>{affiliate.code}</TableCell>
                  <TableCell>{((affiliate.commissionRate || 0) * 100).toFixed(1)}%</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${affiliate.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {affiliate.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(affiliate.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingAffiliate(affiliate); setShowFormDialog(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(affiliate)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button 
            onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
            disabled={currentPage === 1 || isLoading}
            variant="outline"
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
            disabled={currentPage === totalPages || isLoading}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}


      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAffiliate ? 'Edit Affiliate' : 'Add New Affiliate'}</DialogTitle>
            <DialogDescription>
              {editingAffiliate ? 'Update the details for this affiliate.' : 'Select a user and set their affiliate details.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            {!editingAffiliate && (
                <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                    <FormItem>
                    <Label htmlFor="userId">Select User</Label>
                     <Controller
                        name="userId"
                        control={form.control}
                        render={({ field: controllerField }) => (
                            <select
                            id="userId"
                            {...controllerField}
                            className="w-full mt-1 p-2 border rounded-md bg-input"
                            onChange={(e) => {
                                controllerField.onChange(e.target.value);
                                const selectedUser = users.find(u => u.id === e.target.value);
                                if (selectedUser) {
                                form.setValue('name', selectedUser.username || selectedUser.email?.split('@')[0] || '');
                                form.setValue('email', selectedUser.email || '');
                                }
                            }}
                            >
                            <option value="">Select a user</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.username || user.email} ({user.id.substring(0,8)})</option>
                            ))}
                            </select>
                        )}
                        />
                    {form.formState.errors.userId && <p className="text-sm text-red-500 mt-1">{form.formState.errors.userId.message}</p>}
                    </FormItem>
                )}
                />
            )}
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...field} className="mt-1" readOnly={!editingAffiliate && !!form.watch('userId')} />
                  {form.formState.errors.name && <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...field} className="mt-1" readOnly={!editingAffiliate && !!form.watch('userId')} />
                  {form.formState.errors.email && <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="code">Referral Code (optional)</Label>
                  <Input id="code" {...field} className="mt-1" placeholder="Auto-generated if empty" />
                  {form.formState.errors.code && <p className="text-sm text-red-500 mt-1">{form.formState.errors.code.message}</p>}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="commissionRate"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="commissionRate">Commission Rate (0.0 to 1.0)</Label>
                  <Input id="commissionRate" type="number" step="0.01" {...field} 
                         onChange={e => field.onChange(parseFloat(e.target.value))} className="mt-1" />
                  {form.formState.errors.commissionRate && <p className="text-sm text-red-500 mt-1">{form.formState.errors.commissionRate.message}</p>}
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="affiliate_revenue_share"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="affiliate_revenue_share">Revenue Share % (optional)</Label>
                  <Input id="affiliate_revenue_share" type="number" step="0.01" {...field} 
                         onChange={e => field.onChange(parseFloat(e.target.value))} className="mt-1" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="affiliate_cpa"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="affiliate_cpa">CPA Amount (optional)</Label>
                  <Input id="affiliate_cpa" type="number" step="0.01" {...field} 
                         onChange={e => field.onChange(parseFloat(e.target.value))} className="mt-1" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="affiliate_baseline"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="affiliate_baseline">Baseline Amount (optional)</Label>
                  <Input id="affiliate_baseline" type="number" step="0.01" {...field} 
                         onChange={e => field.onChange(parseFloat(e.target.value))} className="mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Active Status</Label>
                    <p className="text-xs text-muted-foreground">
                      Determines if the affiliate can earn commissions.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowFormDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAffiliate ? 'Save Changes' : 'Create Affiliate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={showConfirmDeleteDialog}
        onClose={() => setShowConfirmDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Affiliate"
        description={`Are you sure you want to delete affiliate "${affiliateToDelete?.name}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminAffiliates;

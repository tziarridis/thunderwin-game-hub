
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Affiliate, AffiliateUser, AffiliateCommissionTier, AffiliateData } from '@/types/affiliate'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, ExternalLink, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

const AFFILIATES_QUERY_KEY = 'admin_affiliates';

const AffiliatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Partial<AffiliateUser> | null>(null);
  
  // Fetch affiliates
  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useQuery<AffiliateData[], Error>({
    queryKey: [AFFILIATES_QUERY_KEY, searchTerm],
    queryFn: async () => {
      // For the purposes of this demo, let's use a mock implementation
      // since the 'affiliates' table doesn't seem to exist in the DB schema
      
      // Simulating a data fetch
      const mockData: AffiliateData[] = Array(5).fill(null).map((_, i) => ({
        id: `aff-${i+1}`,
        user_id: `user-${i+1}`,
        firstName: `First${i+1}`,
        lastName: `Last${i+1}`,
        email: `affiliate${i+1}@example.com`,
        tracking_code: `CODE${i+1}`,
        website_url: `https://site${i+1}.com`,
        status: i % 2 === 0 ? 'approved' : 'pending',
        commission_type: i % 3 === 0 ? 'cpa' : 'revshare',
        default_commission_rate: 20 + i,
        commission_tiers: [
          { threshold: 0, rate: 10 + i, type: 'percentage' },
          { threshold: 10, rate: 15 + i, type: 'percentage' }
        ],
        created_at: new Date().toISOString()
      }));
      
      // Filter by search term if provided
      return searchTerm 
        ? mockData.filter(aff => 
            aff.tracking_code.includes(searchTerm) || 
            aff.email.includes(searchTerm) ||
            aff.firstName.includes(searchTerm) ||
            aff.lastName.includes(searchTerm)
          )
        : mockData;
    },
  });

  // Create or Update Affiliate Mutation
  const affiliateMutation = useMutation({
    mutationFn: async (affiliateData: Partial<AffiliateUser>) => {
      // Here, decide if it's an insert or update based on affiliateData.id
      // This is a placeholder for actual Supabase insert/update logic.
      
      // const { data, error } = await supabase.from('affiliates')
      //   .upsert(affiliateData) // This assumes affiliateData matches your table structure
      //   .select()
      //   .single();

      // if (error) throw error;
      // return data as AffiliateUser;
      console.log("Simulating upsert for:", affiliateData);
      if (!affiliateData.email) throw new Error("Email is required for affiliate user.");

      // This is highly simplified. Real implementation needs to handle user creation if not exists,
      // then affiliate profile creation.
      const mockUpsertedData: AffiliateUser = {
        id: affiliateData.id || Date.now().toString(),
        userId: affiliateData.userId || `user_${Date.now()}`,
        email: affiliateData.email,
        tracking_code: affiliateData.tracking_code || `TRACK${Date.now()}`,
        commission_tiers: affiliateData.commission_tiers || [],
        status: affiliateData.status || 'pending',
        commission_type: affiliateData.commission_type || 'revshare',
        ...affiliateData,
      };
      return mockUpsertedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AFFILIATES_QUERY_KEY] });
      setIsModalOpen(false);
      setEditingAffiliate(null);
      toast.success(`Affiliate ${editingAffiliate?.id ? 'updated' : 'created'} successfully.`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleEdit = (affiliate: AffiliateData) => {
    const affiliateUserShape: Partial<AffiliateUser> = {
        id: affiliate.id,
        userId: affiliate.user_id, // Assuming user_id is the link to auth user
        email: affiliate.email || '',
        firstName: affiliate.firstName || '',
        lastName: affiliate.lastName || '',
        tracking_code: affiliate.tracking_code,
        website_url: affiliate.website_url,
        status: affiliate.status,
        commission_type: affiliate.commission_type,
        default_commission_rate: affiliate.default_commission_rate,
        commission_tiers: affiliate.commission_tiers || [] // Ensure this is an array
    };
    setEditingAffiliate(affiliateUserShape);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingAffiliate({ commission_tiers: [{ threshold: 0, rate: 10, type: 'percentage' }] }); // Default tier
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this affiliate?')) return;
    // const { error } = await supabase.from('affiliates').delete().match({ id });
    // if (error) {
    //   toast.error(`Failed to delete affiliate: ${error.message}`);
    // } else {
    //   toast.success('Affiliate deleted successfully.');
    //   queryClient.invalidateQueries({ queryKey: [AFFILIATES_QUERY_KEY] });
    // }
    toast.info("Delete functionality placeholder.");
  };

  const handleSaveAffiliate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingAffiliate) {
      affiliateMutation.mutate(editingAffiliate);
    }
  };

  const handleTierChange = (index: number, field: keyof AffiliateCommissionTier, value: string | number) => {
    if (!editingAffiliate || !editingAffiliate.commission_tiers) return;
    const updatedTiers = [...editingAffiliate.commission_tiers];
    // @ts-ignore
    updatedTiers[index] = { ...updatedTiers[index], [field]: field === 'rate' || field === 'threshold' ? parseFloat(value as string) || 0 : value };
    setEditingAffiliate(prev => ({ ...prev, commission_tiers: updatedTiers } as Partial<AffiliateUser>));
  };
  
  const addTier = () => {
    if (!editingAffiliate) return;
    const newTier: AffiliateCommissionTier = { threshold: 0, rate: 0, type: 'percentage' };
    setEditingAffiliate(prev => ({
      ...prev,
      commission_tiers: [...(prev?.commission_tiers || []), newTier]
    } as Partial<AffiliateUser>));
  };
  
  const removeTier = (index: number) => {
    if (!editingAffiliate || !editingAffiliate.commission_tiers) return;
    const updatedTiers = editingAffiliate.commission_tiers.filter((_, i) => i !== index);
    setEditingAffiliate(prev => ({ ...prev, commission_tiers: updatedTiers } as Partial<AffiliateUser>));
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Affiliate Management</h1>
        <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New Affiliate</Button>
      </div>

      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search affiliates (ID, code, email)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoadingAffiliates ? (
        <p>Loading affiliates...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tracking Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Commission Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliates.map((affiliate) => (
              <TableRow key={affiliate.id}>
                <TableCell>{affiliate.firstName || ''} {affiliate.lastName || ''}</TableCell>
                <TableCell>{affiliate.email || 'N/A'}</TableCell>
                <TableCell>{affiliate.tracking_code}</TableCell>
                <TableCell><span className={`px-2 py-1 text-xs rounded-full ${affiliate.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{affiliate.status}</span></TableCell>
                <TableCell>{affiliate.commission_type}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(affiliate)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(affiliate.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {affiliates.length === 0 && !isLoadingAffiliates && <p className="text-center py-4">No affiliates found.</p>}

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
          if (!isOpen) setEditingAffiliate(null);
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAffiliate?.id ? 'Edit' : 'Add New'} Affiliate</DialogTitle>
          </DialogHeader>
          {editingAffiliate && (
            <form onSubmit={handleSaveAffiliate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={editingAffiliate.firstName || ''} onChange={(e) => setEditingAffiliate(prev => ({...prev, firstName: e.target.value}))} /></div>
                <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={editingAffiliate.lastName || ''} onChange={(e) => setEditingAffiliate(prev => ({...prev, lastName: e.target.value}))} /></div>
                <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={editingAffiliate.email || ''} onChange={(e) => setEditingAffiliate(prev => ({...prev, email: e.target.value}))} required /></div>
                <div><Label htmlFor="tracking_code">Tracking Code</Label><Input id="tracking_code" value={editingAffiliate.tracking_code || ''} onChange={(e) => setEditingAffiliate(prev => ({...prev, tracking_code: e.target.value}))} required /></div>
                <div><Label htmlFor="website_url">Website URL</Label><Input id="website_url" value={editingAffiliate.website_url || ''} onChange={(e) => setEditingAffiliate(prev => ({...prev, website_url: e.target.value}))} /></div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editingAffiliate.status || 'pending'} onValueChange={(value) => setEditingAffiliate(prev => ({...prev, status: value as AffiliateUser['status']}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="commission_type">Commission Type</Label>
                  <Select value={editingAffiliate.commission_type || 'revshare'} onValueChange={(value) => setEditingAffiliate(prev => ({...prev, commission_type: value as AffiliateUser['commission_type']}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revshare">RevShare</SelectItem>
                      <SelectItem value="cpa">CPA</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editingAffiliate.commission_type !== 'cpa' && (
                    <div><Label htmlFor="default_commission_rate">Default Rate (%)</Label><Input id="default_commission_rate" type="number" step="0.1" value={editingAffiliate.default_commission_rate || ''} onChange={(e) => setEditingAffiliate(prev => ({...prev, default_commission_rate: parseFloat(e.target.value) || 0}))} /></div>
                )}
              </div>

              <h3 className="text-lg font-semibold pt-2">Commission Tiers</h3>
              {editingAffiliate.commission_tiers?.map((tier, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-end border p-3 rounded-md">
                  <div><Label>Threshold</Label><Input type="number" value={tier.threshold} onChange={(e) => handleTierChange(index, 'threshold', e.target.value)} placeholder="e.g., 10 (FTDs) or 1000 (Revenue)" /></div>
                  <div><Label>Rate</Label><Input type="number" step="0.1" value={tier.rate} onChange={(e) => handleTierChange(index, 'rate', e.target.value)} placeholder="e.g., 25 (%) or 50 (Fixed)" /></div>
                  <div className="flex items-end gap-x-2">
                    <div className="flex-grow">
                        <Label>Type</Label>
                        <Select value={tier.type} onValueChange={(value) => handleTierChange(index, 'type', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeTier(index)} className="text-destructive"><X className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTier} size="sm">Add Tier</Button>
              
              <DialogFooter className="pt-4">
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={affiliateMutation.isPending}>
                  {affiliateMutation.isPending ? 'Saving...' : 'Save Affiliate'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AffiliatesPage;

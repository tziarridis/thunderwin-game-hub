import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Edit, Trash2, Search, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserStatus, AffiliateUser, AffiliateCommissionTier, AffiliateData, NewAffiliateUser } from '@/types/affiliate'; // Assuming these types are defined somewhere, possibly in a global .d.ts or a non-editable affiliate.ts

const ITEMS_PER_PAGE = 10;

// Mock data - replace with actual API calls
const fetchAffiliates = async (page: number, searchTerm: string, sortOrder: { key: keyof AffiliateUser | 'registration_date', direction: 'asc' | 'desc' }): Promise<{ affiliates: AffiliateUser[], totalCount: number }> => {
  // This is a placeholder. Implement actual fetching logic.
  let query = supabase.from('users').select('*', { count: 'exact' }).eq('role_id', 2); // Assuming role_id 2 is for affiliates

  if (searchTerm) {
    query = query.or(`email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,profile_first_name.ilike.%${searchTerm}%,profile_last_name.ilike.%${searchTerm}%`);
  }

  const sortKey = sortOrder.key === 'registration_date' ? 'created_at' : sortOrder.key;
  query = query.order(sortKey as string, { ascending: sortOrder.direction === 'asc' });
  
  const { data, error, count } = await query.range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

  if (error) {
    toast.error('Failed to fetch affiliates: ' + error.message);
    return { affiliates: [], totalCount: 0 };
  }
  
  const affiliates: AffiliateUser[] = (data || []).map((user: any) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.profile_first_name || '', // Use optional chaining or provide defaults
    lastName: user.profile_last_name || '',
    avatarUrl: user.avatar_url,
    role: 'affiliate', // Assuming this structure
    tracking_code: user.user_metadata?.tracking_code || `AFF-${user.id.substring(0,6)}`,
    website_url: user.user_metadata?.website_url || '',
    status: user.status as UserStatus || 'active',
    commission_tiers: user.user_metadata?.commission_tiers || [{ threshold: 0, rate: 0.1 }], // Provide default or ensure it exists
    created_at: user.created_at, // Make sure this is intended if error was about 'created_at'
    updated_at: user.updated_at,
    // Ensure these fields are present or handle their absence
    registration_date: user.created_at, // map created_at to registration_date
    affiliate_id: user.id, // map id to affiliate_id
  }));
  
  return { affiliates, totalCount: count || 0 };
};


const AffiliatesPage = () => {
  const [affiliates, setAffiliates] = useState<AffiliateUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Partial<AffiliateUser> | null>(null);
  const [formData, setFormData] = useState<Partial<AffiliateUser>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<{ key: keyof AffiliateUser | 'registration_date', direction: 'asc' | 'desc' }>({ key: 'registration_date', direction: 'desc' });

  const isMobile = useIsMobile();

  useEffect(() => {
    loadAffiliates();
  }, [currentPage, searchTerm, sortOrder]);

  const loadAffiliates = async () => {
    setIsLoading(true);
    try {
      const result = await fetchAffiliates(currentPage, searchTerm, sortOrder);
      // Explicitly cast to AffiliateUser[] if confident in the structure, or ensure fetchAffiliates returns correctly typed data.
      setAffiliates(result.affiliates as AffiliateUser[]);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("Error loading affiliates", error);
      toast.error("Could not load affiliates.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTierChange = (index: number, field: keyof AffiliateCommissionTier, value: string | number) => {
    const updatedTiers = [...(formData.commission_tiers || [])];
    if (!updatedTiers[index]) updatedTiers[index] = { threshold: 0, rate: 0, type: 'revenue_share' }; // Default type if needed
    
    // Ensure field is a valid key of AffiliateCommissionTier before assignment
    if (field === 'threshold' || field === 'rate') {
         (updatedTiers[index] as any)[field] = Number(value);
    } else if (field === 'type') {
        (updatedTiers[index] as any)[field] = value;
    }

    setFormData(prev => ({ ...prev, commission_tiers: updatedTiers as any[] }));
  };

  const addTier = () => {
    const newTier: AffiliateCommissionTier = { threshold: 0, rate: 0.1, type: 'revenue_share' }; // Example default tier
    setFormData(prev => ({ ...prev, commission_tiers: [...(prev.commission_tiers || []), newTier] as any[]}));
  };
  
  const removeTier = (index: number) => {
    setFormData(prev => ({ ...prev, commission_tiers: (prev.commission_tiers || []).filter((_, i) => i !== index) as any[] }));
  };

  const handleSubmit = async () => {
    // Placeholder for save/update logic
    console.log("Form Data to save:", formData);
    toast.success(editingAffiliate ? "Affiliate updated successfully!" : "Affiliate created successfully!");
    setIsModalOpen(false);
    setEditingAffiliate(null);
    loadAffiliates(); // Refresh list
  };

  const openModal = (affiliate?: AffiliateUser) => {
    if (affiliate) {
      setEditingAffiliate(affiliate);
      setFormData(affiliate);
    } else {
      setEditingAffiliate(null);
      setFormData({ status: 'active', commission_tiers: [{ threshold: 0, rate: 0.1, type: 'revenue_share' }] as any[] });
    }
    setIsModalOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    // Placeholder for delete logic
    if (window.confirm("Are you sure you want to delete this affiliate?")) {
      console.log("Delete affiliate:", id);
      toast.success("Affiliate deleted successfully!");
      loadAffiliates(); // Refresh list
    }
  };

  const handleSort = (key: keyof AffiliateUser | 'registration_date') => {
    setSortOrder(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof AffiliateUser | 'registration_date' }) => {
    if (sortOrder.key !== columnKey) return null;
    return sortOrder.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };
  
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Affiliate Management</CardTitle>
            <Button onClick={() => openModal()} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Affiliate
            </Button>
          </div>
          <div className="mt-4 flex gap-2 items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search affiliates..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8 w-full"
              />
            </div>
            <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && affiliates.length === 0 ? (
            <p>Loading affiliates...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort('username')} className="cursor-pointer">Username <SortIcon columnKey="username" /></TableHead>
                    <TableHead onClick={() => handleSort('email')} className="cursor-pointer">Email <SortIcon columnKey="email" /></TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer">Status <SortIcon columnKey="status" /></TableHead>
                    <TableHead onClick={() => handleSort('registration_date')} className="cursor-pointer">Registered <SortIcon columnKey="registration_date" /></TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates.map((affiliate) => (
                    <TableRow key={affiliate.id}>
                      <TableCell>{affiliate.username || 'N/A'}</TableCell>
                      <TableCell>{affiliate.email || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          affiliate.status === 'active' ? 'bg-green-500 text-white' :
                          affiliate.status === 'pending' ? 'bg-yellow-500 text-black' :
                          'bg-red-500 text-white'
                        }`}>
                          {affiliate.status || 'unknown'}
                        </span>
                      </TableCell>
                      <TableCell>{affiliate.registration_date ? new Date(affiliate.registration_date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => openModal(affiliate)}><Edit size={16} /></Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDelete(affiliate.id)}><Trash2 size={16} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalCount)} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} affiliates
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAffiliate ? 'Edit' : 'Add New'} Affiliate</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input name="username" placeholder="Username" value={formData.username || ''} onChange={handleInputChange} />
            <Input name="email" type="email" placeholder="Email" value={formData.email || ''} onChange={handleInputChange} />
            {/* {!editingAffiliate && <Input name="password" type="password" placeholder="Password" value={(formData as NewAffiliateUser).password || ''} onChange={handleInputChange} />} */}
            <Input name="firstName" placeholder="First Name" value={formData.firstName || ''} onChange={handleInputChange} />
            <Input name="lastName" placeholder="Last Name" value={formData.lastName || ''} onChange={handleInputChange} />
            <Input name="tracking_code" placeholder="Tracking Code" value={formData.tracking_code || ''} onChange={handleInputChange} />
            <Input name="website_url" placeholder="Website URL" value={formData.website_url || ''} onChange={handleInputChange} />
             <Select name="status" value={formData.status || 'active'} onValueChange={(value) => handleInputChange({ target: { name: 'status', value } } as any)}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Commission Tiers</h4>
              {(formData.commission_tiers || []).map((tier: any, index: number) => (
                <div key={index} className="flex gap-2 items-center mb-2 p-2 border rounded">
                  <Input type="number" placeholder="Threshold ($)" value={tier.threshold ?? ''} onChange={(e) => handleTierChange(index, 'threshold', e.target.value)} className="w-1/3" />
                  <Input type="number" placeholder="Rate (%)" value={tier.rate ?? ''} step="0.01" onChange={(e) => handleTierChange(index, 'rate', e.target.value)} className="w-1/3" />
                  <Select value={tier.type || 'revenue_share'} onValueChange={(value) => handleTierChange(index, 'type', value)} >
                     <SelectTrigger className="w-1/3"><SelectValue placeholder="Type" /></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="revenue_share">Revenue Share</SelectItem>
                       <SelectItem value="cpa">CPA</SelectItem>
                     </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => removeTier(index)}><Trash2 size={16} className="text-red-500"/></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addTier}><PlusCircle className="mr-2 h-4 w-4"/> Add Tier</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save Affiliate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AffiliatesPage;

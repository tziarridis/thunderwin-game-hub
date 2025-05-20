import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Promotion } from '@/types/promotion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, Loader2, Eye, EyeOff, Gift } from 'lucide-react';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { promotionsService } from '@/services/promotionsService'; // Assuming this service exists and is typed
import { Game } from '@/types'; // For game selection

const ITEMS_PER_PAGE = 10;

const AdminPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [games, setGames] = useState<Game[]>([]); // For selecting eligible games
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPromotions, setTotalPromotions] = useState(0);

  const fetchPromotions = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    try {
      // Adapt to promotionsService methods or use supabase directly
      const { data, error, count } = await supabase
        .from('promotions') // Assuming table name
        .select('*', { count: 'exact' })
        .ilike('title', `%${search}%`) // Example search
        .order('created_at', { ascending: false }) // Assuming created_at field
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);
      
      if (error) throw error;
      setPromotions(data as Promotion[] || []); // Cast if supabase types are generic
      setTotalPromotions(count || 0);
    } catch (error: any) {
      toast.error(`Failed to fetch promotions: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchGames = async () => {
     try {
        const { data, error } = await supabase.from('games').select('id, title, slug').limit(100); // Fetch basic game info
        if (error) throw error;
        setGames(data as Game[] || []);
     } catch (error: any) {
        toast.error(`Failed to fetch games for promotions: ${error.message}`);
     }
  };


  useEffect(() => {
    fetchPromotions(currentPage, searchTerm);
  }, [fetchPromotions, currentPage, searchTerm]);

  useEffect(() => {
    if (showFormDialog) {
        fetchGames(); // Fetch games when dialog is open
    }
  }, [showFormDialog]);


  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const promoData: Partial<Promotion> = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string,
      status: formData.get('status') as Promotion['status'],
      validFrom: formData.get('validFrom') ? new Date(formData.get('validFrom') as string).toISOString() : new Date().toISOString(),
      validUntil: formData.get('validUntil') ? new Date(formData.get('validUntil') as string).toISOString() : null,
      imageUrl: formData.get('imageUrl') as string || undefined,
      termsAndConditions: formData.get('termsAndConditions') as string || undefined,
      category: formData.get('category') as string,
      code: formData.get('code') as string || undefined,
      value: formData.get('value') ? parseFloat(formData.get('value') as string) : undefined,
      bonusPercentage: formData.get('bonusPercentage') ? parseFloat(formData.get('bonusPercentage') as string) : undefined,
      freeSpinsCount: formData.get('freeSpinsCount') ? parseInt(formData.get('freeSpinsCount') as string) : undefined,
      minDeposit: formData.get('minDeposit') ? parseFloat(formData.get('minDeposit') as string) : undefined,
      maxBonusAmount: formData.get('maxBonusAmount') ? parseFloat(formData.get('maxBonusAmount') as string) : undefined,
      wageringRequirement: formData.get('wageringRequirement') ? parseInt(formData.get('wageringRequirement') as string) : undefined,
      games: formData.getAll('games') as string[] || undefined, // Ensure this is string[]
      targetAudience: formData.get('targetAudience') as Promotion['targetAudience'],
      ctaText: formData.get('ctaText') as string || undefined,
      // isActive: formData.get('isActive') === 'on', // status field is more comprehensive
    };

    // Derive isActive based on status and dates
    if (promoData.status === 'active') {
        const now = new Date();
        const from = new Date(promoData.validFrom);
        const until = new Date(promoData.validUntil) ? new Date(promoData.validUntil) : null;
        if (from <= now && (!until || until >= now)) {
            promoData.isActive = true;
        } else {
            promoData.isActive = false;
            // Optionally update status to 'expired' or 'upcoming' if isActive is false due to dates
            if (until && until < now) promoData.status = 'expired';
            if (from > now) promoData.status = 'upcoming';
        }
    } else {
        promoData.isActive = false;
    }


    setIsLoading(true);
    try {
      if (editingPromotion) {
        // Use promotionsService or supabase directly
        const { error } = await supabase.from('promotions').update(promoData).eq('id', editingPromotion.id);
        if (error) throw error;
        toast.success('Promotion updated successfully!');
      } else {
        const { error } = await supabase.from('promotions').insert(promoData);
        if (error) throw error;
        toast.success('Promotion created successfully!');
      }
      setShowFormDialog(false);
      setEditingPromotion(null);
      fetchPromotions(currentPage, searchTerm);
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (promotion: Promotion) => {
    setPromotionToDelete(promotion);
    setShowConfirmDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promotionToDelete) return;
    setIsLoading(true);
    try {
      // Use promotionsService or supabase directly
      const { error } = await supabase.from('promotions').delete().eq('id', promotionToDelete.id);
      if (error) throw error;
      toast.success('Promotion deleted successfully!');
      setShowConfirmDeleteDialog(false);
      setPromotionToDelete(null);
      fetchPromotions(currentPage, searchTerm);
    } catch (error: any) {
      toast.error(`Failed to delete promotion: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const totalPages = Math.ceil(totalPromotions / ITEMS_PER_PAGE);

  // Helper to format date for input type="datetime-local"
  const formatDateForInput = (date?: string | Date | null) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      // Format: YYYY-MM-DDTHH:mm
      return d.toISOString().substring(0, 16);
    } catch {
      return '';
    }
  };


  return (
    <div className="container mx-auto p-4">
      <CMSPageHeader
        title="Promotion Management"
        description="Create, edit, and manage all casino promotions."
        actions={
          <Button onClick={() => { setEditingPromotion(null); setShowFormDialog(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Promotion
          </Button>
        }
      />

      <div className="mb-4 flex items-center">
        <Input
          placeholder="Search promotions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
         <Button onClick={() => fetchPromotions(1, searchTerm)} className="ml-2">
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>

      {isLoading && promotions.length === 0 && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
      {promotions.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Valid From</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {promo.imageUrl ? <img src={promo.imageUrl} alt={promo.title} className="h-8 w-8 object-cover rounded-sm"/> : <Gift className="h-6 w-6 text-muted-foreground"/>}
                    {promo.title}
                  </TableCell>
                  <TableCell>{promo.type?.replace(/_/g, ' ')}</TableCell>
                  <TableCell>
                     <Badge variant={
                        promo.status === 'active' ? 'success' : 
                        promo.status === 'draft' ? 'outline' :
                        promo.status === 'expired' ? 'destructive' : 'secondary'
                     }>{promo.status?.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    {promo.isActive ? (
                      <span className="text-green-600 flex items-center"><Eye className="mr-1 h-4 w-4" /> Yes</span>
                    ) : (
                      <span className="text-red-600 flex items-center"><EyeOff className="mr-1 h-4 w-4" /> No</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(promo.validFrom).toLocaleDateString()}</TableCell>
                  <TableCell>{promo.validUntil ? new Date(promo.validUntil).toLocaleDateString() : 'Ongoing'}</TableCell>
                  <TableCell className="space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingPromotion(promo); setShowFormDialog(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(promo)}>
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
      
      {!isLoading && promotions.length === 0 && (
        <p className="text-center text-muted-foreground py-6">
          No promotions found. Click "Add New Promotion" to create one.
        </p>
      )}


      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? 'Edit Promotion' : 'Add New Promotion'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="title">Title</Label><Input id="title" name="title" defaultValue={editingPromotion?.title || ''} required /></div>
              <div><Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={editingPromotion?.type || ''}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {['deposit_bonus', 'free_spins', 'cashback', 'tournament_prize', 'welcome_bonus', 'reload_bonus', 'loyalty_reward', 'no_deposit_bonus'].map(t => 
                      <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').toUpperCase()}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" defaultValue={editingPromotion?.description || ''} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div><Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editingPromotion?.status || 'draft'}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                        {['draft', 'active', 'inactive', 'upcoming', 'expired'].map(s => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="category">Category (e.g., slots, sports)</Label><Input id="category" name="category" defaultValue={editingPromotion?.category || 'casino'} /></div>
            </div>
            
            {/* Dates & Image */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label htmlFor="validFrom">Valid From</Label><Input id="validFrom" type="datetime-local" name="validFrom" defaultValue={formatDateForInput(editingPromotion?.validFrom)} required /></div>
              <div><Label htmlFor="validUntil">Valid Until (optional)</Label><Input id="validUntil" type="datetime-local" name="validUntil" defaultValue={formatDateForInput(editingPromotion?.validUntil)} /></div>
              <div><Label htmlFor="imageUrl">Image URL</Label><Input id="imageUrl" name="imageUrl" defaultValue={editingPromotion?.imageUrl || ''} /></div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="value">Value (e.g. amount, prize pool)</Label><Input id="value" name="value" type="number" step="any" defaultValue={editingPromotion?.value || ''} /></div>
                <div><Label htmlFor="bonusPercentage">Bonus Percentage (e.g. 100 for 100%)</Label><Input id="bonusPercentage" name="bonusPercentage" type="number" step="any" defaultValue={editingPromotion?.bonusPercentage || ''} /></div>
                <div><Label htmlFor="freeSpinsCount">Free Spins Count</Label><Input id="freeSpinsCount" name="freeSpinsCount" type="number" defaultValue={editingPromotion?.freeSpinsCount || ''} /></div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="minDeposit">Min Deposit</Label><Input id="minDeposit" name="minDeposit" type="number" step="any" defaultValue={editingPromotion?.minDeposit || ''} /></div>
                <div><Label htmlFor="maxBonusAmount">Max Bonus Amount</Label><Input id="maxBonusAmount" name="maxBonusAmount" type="number" step="any" defaultValue={editingPromotion?.maxBonusAmount || ''} /></div>
                <div><Label htmlFor="wageringRequirement">Wagering Requirement (e.g. 35 for 35x)</Label><Input id="wageringRequirement" name="wageringRequirement" type="number" defaultValue={editingPromotion?.wageringRequirement || ''} /></div>
            </div>

            {/* Audience & CTA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label htmlFor="targetAudience">Target Audience</Label>
                <Select name="targetAudience" defaultValue={editingPromotion?.targetAudience || 'all'}>
                  <SelectTrigger><SelectValue placeholder="Select audience" /></SelectTrigger>
                  <SelectContent>
                    {['all', 'new_users', 'existing_users', 'vip_only'].map(ta => <SelectItem key={ta} value={ta}>{ta.replace(/_/g, ' ').toUpperCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="code">Promo Code (optional)</Label><Input id="code" name="code" defaultValue={editingPromotion?.code || ''} /></div>
              <div><Label htmlFor="ctaText">CTA Button Text</Label><Input id="ctaText" name="ctaText" defaultValue={editingPromotion?.ctaText || 'Claim Now'} /></div>
            </div>
             <div>
                <Label>Eligible Games (for Free Spins, etc.)</Label>
                <div className="mt-1 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                    {games.map(game => (
                    <div key={game.id} className="flex items-center space-x-2">
                        <Checkbox 
                        id={`game-${game.id}`} 
                        name="games" 
                        value={game.slug || game.id!} // Use slug if available, otherwise ID
                        defaultChecked={editingPromotion?.games?.includes(game.slug || game.id!) || false}
                        />
                        <Label htmlFor={`game-${game.id}`} className="font-normal truncate" title={game.title}>{game.title}</Label>
                    </div>
                    ))}
                </div>
            </div>
            <div><Label htmlFor="termsAndConditions">Terms & Conditions</Label><Textarea id="termsAndConditions" name="termsAndConditions" rows={5} defaultValue={editingPromotion?.termsAndConditions || ''} /></div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowFormDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPromotion ? 'Save Changes' : 'Create Promotion'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={showConfirmDeleteDialog}
        onClose={() => setShowConfirmDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Promotion"
        description={`Are you sure you want to delete the promotion "${promotionToDelete?.title}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminPromotions;

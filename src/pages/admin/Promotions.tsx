import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Promotion, PromotionType, PromotionStatus, PromotionAudience } from '@/types/promotion'; // Using defined types
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker'; // Assuming single date picker for from/to
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import ConfirmationDialog, { ConfirmationDialogProps } from '@/components/admin/shared/ConfirmationDialog';
import { format, parseISO, isValid } from 'date-fns';
import { Badge } from '@/components/ui/badge'; // Import Badge

const ITEMS_PER_PAGE = 10;

const AdminPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Partial<Promotion> | null>(null);
  
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPromotions, setTotalPromotions] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPromotions = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      let query = supabase.from('promotions').select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
      }
      
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      setPromotions((data as Promotion[]) || []);
      setTotalPromotions(count || 0);
    } catch (error: any) {
      toast.error(`Failed to fetch promotions: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchPromotions(currentPage);
  }, [fetchPromotions, currentPage]);

  const handleAddNew = () => {
    setEditingPromotion({ 
      type: 'deposit_bonus', // Default type
      status: 'draft', 
      is_active: false,
      valid_from: new Date().toISOString(),
      valid_until: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), // Default 30 days validity
      target_audience: 'all',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromotion({
        ...promo,
        // Ensure dates are in string format if DatePicker expects strings
        valid_from: promo.valid_from ? (isValid(parseISO(promo.valid_from)) ? promo.valid_from : new Date().toISOString()) : new Date().toISOString(),
        valid_until: promo.valid_until ? (isValid(parseISO(promo.valid_until)) ? promo.valid_until : new Date().toISOString()) : new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (promo: Promotion) => {
    setPromotionToDelete(promo);
    setShowConfirmDeleteDialog(true);
  };

  const confirmDeletePromotion = async () => {
    if (!promotionToDelete) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('promotions').delete().eq('id', promotionToDelete.id);
      if (error) throw error;
      toast.success('Promotion deleted successfully.');
      fetchPromotions(currentPage); // Refresh
      setShowConfirmDeleteDialog(false);
      setPromotionToDelete(null);
    } catch (error: any) {
      toast.error(`Failed to delete promotion: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePromotion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPromotion) return;
    setIsSubmitting(true);

    // Ensure numeric fields are numbers or null
    const payload: Partial<Promotion> = {
      ...editingPromotion,
      value: editingPromotion.value ? Number(editingPromotion.value) : undefined,
      bonus_percentage: editingPromotion.bonus_percentage ? Number(editingPromotion.bonus_percentage) : undefined,
      free_spins_count: editingPromotion.free_spins_count ? Number(editingPromotion.free_spins_count) : undefined,
      min_deposit: editingPromotion.min_deposit ? Number(editingPromotion.min_deposit) : undefined,
      max_bonus_amount: editingPromotion.max_bonus_amount ? Number(editingPromotion.max_bonus_amount) : undefined,
      wagering_requirement: editingPromotion.wagering_requirement ? Number(editingPromotion.wagering_requirement) : undefined,
      is_active: !!editingPromotion.is_active, // Ensure boolean
      // Dates should be ISO strings
      valid_from: editingPromotion.valid_from ? new Date(editingPromotion.valid_from).toISOString() : new Date().toISOString(),
      valid_until: editingPromotion.valid_until ? new Date(editingPromotion.valid_until).toISOString() : new Date().toISOString(),
    };
    
    // Clean up undefined fields before upsert to avoid issues with Supabase expecting null for empty optional fields.
    Object.keys(payload).forEach(key => payload[key as keyof Promotion] === undefined && delete payload[key as keyof Promotion]);


    try {
      if (editingPromotion.id) { // Update
        const { error } = await supabase.from('promotions').update(payload).eq('id', editingPromotion.id);
        if (error) throw error;
        toast.success('Promotion updated successfully.');
      } else { // Create
        const { error } = await supabase.from('promotions').insert(payload as Promotion); // Cast if needed for new record
        if (error) throw error;
        toast.success('Promotion created successfully.');
      }
      setIsModalOpen(false);
      setEditingPromotion(null);
      fetchPromotions(currentPage); // Refresh
    } catch (error: any) {
      toast.error(`Failed to save promotion: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const promotionTypes: PromotionType[] = ['deposit_bonus', 'free_spins', 'cashback_offer', 'tournament', 'special_event', 'welcome_offer', 'reload_bonus'];
  const promotionStatuses: PromotionStatus[] = ['active', 'inactive', 'upcoming', 'expired', 'draft'];
  const promotionAudiences: PromotionAudience[] = ['all', 'new_users', 'vip_only', 'segmented'];


  const deleteDialogProps: ConfirmationDialogProps = {
    isOpen: showConfirmDeleteDialog,
    onClose: () => setShowConfirmDeleteDialog(false),
    onConfirm: confirmDeletePromotion,
    title: "Delete Promotion",
    description: `Are you sure you want to delete the promotion "${promotionToDelete?.title}"? This action cannot be undone.`,
    confirmText: "Delete", // Changed from confirmButtonText
    variant: "destructive",
    isLoading: isSubmitting,
  };


  return (
    <AdminPageLayout title="Promotions Management">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manage Promotions</h1>
        <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add Promotion</Button>
      </div>
      <div className="mb-4">
        <Input
          placeholder="Search promotions by title, code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : promotions.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">No promotions found.</p>
      ) : (
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
                    {promo.image_url && <img src={promo.image_url} alt={promo.title} className="h-10 w-10 rounded-sm object-cover"/>}
                    {promo.title}
                </TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{promo.type.replace(/_/g, ' ')}</Badge></TableCell>
                <TableCell><Badge variant={promo.status === 'active' ? 'success' : 'secondary'} className="capitalize">{promo.status}</Badge></TableCell>
                <TableCell>{promo.is_active ? <CheckCircle2 className="text-green-500"/> : <XCircle className="text-red-500"/>}</TableCell>
                <TableCell>{promo.valid_from ? format(parseISO(promo.valid_from), 'PP') : 'N/A'}</TableCell>
                <TableCell>{promo.valid_until ? format(parseISO(promo.valid_until), 'PP') : 'N/A'}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(promo)} className="mr-2"><Edit className="mr-1 h-3 w-3"/>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(promo)}><Trash2 className="mr-1 h-3 w-3"/>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

        {/* Pagination */}
        {totalPromotions > ITEMS_PER_PAGE && (
            <div className="flex justify-end items-center space-x-2 pt-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
            >
                Previous
            </Button>
            <span className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalPromotions / ITEMS_PER_PAGE)}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalPromotions / ITEMS_PER_PAGE), prev + 1))}
                disabled={currentPage === Math.ceil(totalPromotions / ITEMS_PER_PAGE)}
            >
                Next
            </Button>
            </div>
        )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => { if (!isOpen) setEditingPromotion(null); setIsModalOpen(isOpen);}}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPromotion?.id ? 'Edit' : 'Add New'} Promotion</DialogTitle>
          </DialogHeader>
          {editingPromotion && (
            <form onSubmit={handleSavePromotion} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="title">Title</Label><Input id="title" value={editingPromotion.title || ''} onChange={(e) => setEditingPromotion(p => ({...p, title: e.target.value}))} required /></div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={editingPromotion.type || ''} onValueChange={(value) => setEditingPromotion(p => ({...p, type: value as PromotionType}))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{promotionTypes.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editingPromotion.status || ''} onValueChange={(value) => setEditingPromotion(p => ({...p, status: value as PromotionStatus}))}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>{promotionStatuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target_audience">Target Audience</Label>
                   <Select value={editingPromotion.target_audience || ''} onValueChange={(value) => setEditingPromotion(p => ({...p, target_audience: value as PromotionAudience}))}>
                    <SelectTrigger><SelectValue placeholder="Select audience" /></SelectTrigger>
                    <SelectContent>{promotionAudiences.map(a => <SelectItem key={a} value={a}>{a.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                    <Label htmlFor="valid_from">Valid From</Label>
                    <DatePicker 
                        date={editingPromotion.valid_from ? parseISO(editingPromotion.valid_from) : undefined} 
                        onDateChange={(date) => setEditingPromotion(p => ({...p, valid_from: date?.toISOString()}))} 
                    />
                </div>
                <div>
                    <Label htmlFor="valid_until">Valid Until</Label>
                    <DatePicker 
                        date={editingPromotion.valid_until ? parseISO(editingPromotion.valid_until) : undefined} 
                        onDateChange={(date) => setEditingPromotion(p => ({...p, valid_until: date?.toISOString()}))} 
                    />
                </div>
                <div><Label htmlFor="image_url">Image URL</Label><Input id="image_url" value={editingPromotion.image_url || ''} onChange={(e) => setEditingPromotion(p => ({...p, image_url: e.target.value}))} /></div>
                <div><Label htmlFor="category">Category</Label><Input id="category" value={editingPromotion.category || ''} onChange={(e) => setEditingPromotion(p => ({...p, category: e.target.value}))} /></div>
                <div><Label htmlFor="value">Value (e.g., cashback %)</Label><Input type="number" id="value" value={editingPromotion.value || ''} onChange={(e) => setEditingPromotion(p => ({...p, value: parseFloat(e.target.value) || undefined}))} /></div>
                <div><Label htmlFor="bonus_percentage">Bonus Percentage</Label><Input type="number" id="bonus_percentage" value={editingPromotion.bonus_percentage || ''} onChange={(e) => setEditingPromotion(p => ({...p, bonus_percentage: parseFloat(e.target.value) || undefined}))} /></div>
                <div><Label htmlFor="free_spins_count">Free Spins Count</Label><Input type="number" id="free_spins_count" value={editingPromotion.free_spins_count || ''} onChange={(e) => setEditingPromotion(p => ({...p, free_spins_count: parseInt(e.target.value) || undefined}))} /></div>
                <div><Label htmlFor="min_deposit">Min Deposit</Label><Input type="number" id="min_deposit" value={editingPromotion.min_deposit || ''} onChange={(e) => setEditingPromotion(p => ({...p, min_deposit: parseFloat(e.target.value) || undefined}))} /></div>
                <div><Label htmlFor="max_bonus_amount">Max Bonus Amount</Label><Input type="number" id="max_bonus_amount" value={editingPromotion.max_bonus_amount || ''} onChange={(e) => setEditingPromotion(p => ({...p, max_bonus_amount: parseFloat(e.target.value) || undefined}))} /></div>
                <div><Label htmlFor="wagering_requirement">Wagering Requirement (e.g., 30 for 30x)</Label><Input type="number" id="wagering_requirement" value={editingPromotion.wagering_requirement || ''} onChange={(e) => setEditingPromotion(p => ({...p, wagering_requirement: parseFloat(e.target.value) || undefined}))} /></div>
                 <div><Label htmlFor="code">Promo Code</Label><Input id="code" value={editingPromotion.code || ''} onChange={(e) => setEditingPromotion(p => ({...p, code: e.target.value}))} /></div>
                <div><Label htmlFor="cta_text">CTA Button Text</Label><Input id="cta_text" value={editingPromotion.cta_text || ''} onChange={(e) => setEditingPromotion(p => ({...p, cta_text: e.target.value}))} /></div>
                <div className="md:col-span-2"><Label htmlFor="games">Applicable Games (comma-separated IDs/slugs)</Label><Input id="games" value={(editingPromotion.games || []).join(',')} onChange={(e) => setEditingPromotion(p => ({...p, games: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}))} /></div>
                <div className="md:col-span-2"><Label htmlFor="terms_and_conditions_url">Terms & Conditions URL</Label><Input id="terms_and_conditions_url" value={editingPromotion.terms_and_conditions_url || ''} onChange={(e) => setEditingPromotion(p => ({...p, terms_and_conditions_url: e.target.value}))} /></div>
              </div>
              <div className="md:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={editingPromotion.description || ''} onChange={(e) => setEditingPromotion(p => ({...p, description: e.target.value}))} /></div>
              <div className="flex items-center space-x-2">
                <Checkbox id="is_active" checked={!!editingPromotion.is_active} onCheckedChange={(checked) => setEditingPromotion(p => ({...p, is_active: !!checked}))} />
                <Label htmlFor="is_active">Is Active</Label>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" onClick={() => {setIsModalOpen(false); setEditingPromotion(null);}}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingPromotion?.id ? 'Save Changes' : 'Create Promotion'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmationDialog {...deleteDialogProps} />
    </AdminPageLayout>
  );
};

export default AdminPromotionsPage;


import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PlusCircle, Loader2, BarChart, Users, Search, Filter, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import AdminPromotionCard from "@/components/admin/promotions/AdminPromotionCard"; // Specific card for admin
import { Promotion } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CMSPageHeader from "@/components/admin/cms/CMSPageHeader";
import { promotionsService } from "@/services/promotionsService"; // Using the actual service
import { Skeleton } from "@/components/ui/skeleton";

const uiCategories = [ // For filtering/grouping in UI
  { value: "all", label: "All Promotions" },
  { value: "deposit_bonus", label: "Deposit Bonus" },
  { value: "cashback", label: "Cashback" },
  { value: "tournament", label: "Tournament" },
  { value: "free_spins", label: "Free Spins" },
  { value: "welcome_bonus", label: "Welcome Bonus"},
  { value: "reload_bonus", label: "Reload Bonus"},
  { value: "loyalty_reward", label: "Loyalty Reward"},
  { value: "other", label: "Other" }
];

// Matches Promotion type more closely for form data
interface PromotionFormData {
  title: string;
  description: string;
  type: Promotion['type'];
  category: string; // UI helper, maps to promotion properties or tags
  
  imageUrl?: string;
  validFrom: string; // ISO string
  validUntil: string | null; // ISO string or null for ongoing
  
  termsAndConditions?: string;
  cta_text?: string;

  status?: Promotion['status'];
  isActive?: boolean;

  // Bonus specific details
  bonusPercentage?: number;
  maxBonusAmount?: number;
  freeSpinsCount?: number;
  wageringRequirement?: number;
  minDeposit?: number;
  currency?: string;
  games?: string[]; // Game slugs/IDs for free spins or restricted play
  code?: string; // Promo code
}

const initialFormData: PromotionFormData = {
  title: "",
  description: "",
  type: "deposit_bonus", // Default type
  category: "deposit_bonus", // Default category
  validFrom: new Date().toISOString().split("T")[0], // Default to today
  validUntil: null,
  imageUrl: "",
  termsAndConditions: "",
  cta_text: "Claim Now",
  status: "draft",
  isActive: false,
  currency: "USD",
};

const PromotionsAdminPage = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    claimed: 0 // This would need actual tracking from backend
  });
  
  const [formData, setFormData] = useState<PromotionFormData>(initialFormData);
  
  const [isLoading, setIsLoading] = useState(true); // For loading list
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState<string>("all"); // For UI category filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with a service call that gets ALL promotions for admin
      // promotionsService.getAllPromotions() or similar
      const data = await promotionsService.getActivePromotions(); // For now, using active as placeholder
      setPromotions(data);
      updateStats(data);
    } catch (error) {
      toast.error("Failed to load promotions.");
      console.error("Fetch promotions error:", error);
      setPromotions([]); // Clear on error or use cached
      updateStats([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateStats = (currentPromotions: Promotion[]) => {
     setStats({
        total: currentPromotions.length,
        active: currentPromotions.filter(p => p.isActive && p.status === 'active').length,
        claimed: currentPromotions.reduce((acc, p) => acc + (p.usageLimitPerUser || 0), 0) // Example, needs real data
      });
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bonusPercentage' || name === 'maxBonusAmount' || name === 'freeSpinsCount' || name === 'wageringRequirement' || name === 'minDeposit'
                ? (value === '' ? undefined : parseFloat(value)) 
                : val
    }));
  };

  const handleDateChange = (name: 'validFrom' | 'validUntil', value: string) => {
    setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
  };
  
  const handleSelectChange = (name: keyof PromotionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const promotionPayload: Partial<Promotion> = {
        ...formData,
        // Ensure dates are in correct format if needed by backend (e.g. ISO string)
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        // Ensure isActive is set based on status if status is 'active'
        isActive: formData.status === 'active' ? true : (formData.isActive ?? false),
    };

    // Remove undefined fields that might cause issues with Supabase partial updates
    Object.keys(promotionPayload).forEach(key => 
        promotionPayload[key as keyof Partial<Promotion>] === undefined && delete promotionPayload[key as keyof Partial<Promotion>]
    );


    try {
      if (editingId) {
        // await promotionsService.updatePromotion(editingId, promotionPayload);
        // Mock update for now
        setPromotions(prev => prev.map(p => p.id === editingId ? { ...p, ...promotionPayload, id: editingId, validFrom: p.validFrom } as Promotion : p));
        toast.success("Promotion updated successfully (mock)");
      } else {
        // const newPromo = await promotionsService.createPromotion(promotionPayload);
        // Mock create for now
        const newPromo: Promotion = { 
            ...initialFormData, // Spread initial defaults
            ...promotionPayload, // Spread payload over defaults
            id: `${Date.now()}`, 
            validFrom: promotionPayload.validFrom || new Date().toISOString(), // Ensure validFrom is set
            type: promotionPayload.type || 'deposit_bonus', // Ensure type is set
            category: promotionPayload.category || 'other', // Ensure category is set
            isActive: promotionPayload.isActive || false, // Ensure isActive is set
         } as Promotion;
        setPromotions(prev => [...prev, newPromo]);
        toast.success("Promotion added successfully (mock)");
      }
      updateStats(promotions); // Update stats after modification
      setFormData(initialFormData); 
      setEditingId(null);
      setIsDialogOpen(false);
    } catch (error: any) {
        toast.error(`Operation failed: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEditPromotion = (promo: Promotion) => {
    setFormData({
      title: promo.title,
      description: promo.description,
      type: promo.type,
      category: promo.category || 'other',
      imageUrl: promo.imageUrl || "",
      validFrom: typeof promo.validFrom === 'string' ? promo.validFrom.split('T')[0] : new Date(promo.validFrom).toISOString().split('T')[0],
      validUntil: promo.validUntil ? (typeof promo.validUntil === 'string' ? promo.validUntil.split('T')[0] : new Date(promo.validUntil).toISOString().split('T')[0]) : null,
      termsAndConditions: promo.termsAndConditions || "",
      cta_text: promo.cta_text || "Claim Now",
      status: promo.status || 'draft',
      isActive: promo.isActive,
      bonusPercentage: promo.bonusPercentage,
      maxBonusAmount: promo.maxBonusAmount,
      freeSpinsCount: promo.freeSpinsCount,
      wageringRequirement: promo.wageringRequirement,
      minDeposit: promo.minDeposit,
      currency: promo.currency || "USD",
      games: promo.games,
      code: promo.code
    });
    setEditingId(promo.id);
    setIsDialogOpen(true);
  };
  
  const handleDeletePromotion = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
        try {
            // await promotionsService.deletePromotion(id);
             // Mock delete for now
            setPromotions(prev => prev.filter(promo => promo.id !== id));
            updateStats(promotions.filter(promo => promo.id !== id));
            toast.success("Promotion deleted successfully (mock)");
        } catch (error: any) {
            toast.error(`Deletion failed: ${error.message}`);
        }
    }
  };
  
  const handleToggleActive = async (id: string) => {
    const promo = promotions.find(p => p.id === id);
    if (!promo) return;

    const newIsActive = !promo.isActive;
    const newStatus = newIsActive ? 'active' : 'inactive';
    
    try {
        // await promotionsService.updatePromotion(id, { isActive: newIsActive, status: newStatus });
        // Mock toggle for now
        setPromotions(prev => 
          prev.map(p => 
            p.id === id 
              ? { ...p, isActive: newIsActive, status: newStatus }
              : p
          )
        );
        updateStats(promotions.map(p => p.id === id ? { ...p, isActive: newIsActive, status: newStatus } : p));
        toast.success(`Promotion ${newIsActive ? "activated" : "deactivated"} (mock)`);
    } catch (error: any) {
        toast.error(`Toggle failed: ${error.message}`);
    }
  };

  const filteredPromotions = useMemo(() => promotions.filter(promo => {
    const tabMatch = activeFilterTab === "all" || promo.category === activeFilterTab || (activeFilterTab === 'other' && !uiCategories.slice(1).find(c => c.value === promo.category));
    if (!tabMatch) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        promo.title.toLowerCase().includes(query) ||
        (promo.description && promo.description.toLowerCase().includes(query)) ||
        (promo.type && promo.type.toLowerCase().includes(query))
      );
    }
    return true;
  }), [promotions, activeFilterTab, searchQuery]);

  return (
    <div className="p-4 md:p-6">
      <CMSPageHeader
        title="Promotions Management"
        description="Create, edit, and manage all casino promotions."
        actions={
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
                setIsDialogOpen(isOpen);
                if (!isOpen) {
                    setFormData(initialFormData);
                    setEditingId(null);
                }
                }}>
            <DialogTrigger asChild>
                <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Promotion
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                <DialogTitle>{editingId ? "Edit Promotion" : "Add New Promotion"}</DialogTitle>
                <DialogDescription>
                    Fill in the details below to {editingId ? "update" : "create"} a promotion.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {/* Column 1 */}
                  <div className="space-y-3">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} />
                    </div>
                    <div>
                        <Label htmlFor="type">Promotion Type</Label>
                        <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                                {uiCategories.slice(1).map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                                 <SelectItem value="tournament_prize">Tournament Prize</SelectItem>
                                 <SelectItem value="no_deposit_bonus">No Deposit Bonus</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="category">UI Category</Label>
                        <Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                            <SelectTrigger><SelectValue placeholder="Select UI category" /></SelectTrigger>
                            <SelectContent>
                                {uiCategories.slice(1).map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input id="imageUrl" name="imageUrl" value={formData.imageUrl || ''} onChange={handleInputChange} placeholder="https://example.com/image.png" />
                    </div>
                     <div>
                        <Label htmlFor="cta_text">CTA Button Text</Label>
                        <Input id="cta_text" name="cta_text" value={formData.cta_text || ''} onChange={handleInputChange} placeholder="e.g., Claim Now, Get Bonus" />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="validFrom">Valid From</Label>
                            <Input id="validFrom" name="validFrom" type="date" value={formData.validFrom} onChange={(e) => handleDateChange('validFrom', e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                            <Input id="validUntil" name="validUntil" type="date" value={formData.validUntil || ''} onChange={(e) => handleDateChange('validUntil', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                        <Textarea id="termsAndConditions" name="termsAndConditions" value={formData.termsAndConditions || ''} onChange={handleInputChange} rows={3} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="minDeposit">Min Deposit</Label>
                            <Input id="minDeposit" name="minDeposit" type="number" value={formData.minDeposit || ''} onChange={handleInputChange} placeholder="e.g., 20" />
                        </div>
                        <div>
                            <Label htmlFor="wageringRequirement">Wagering (x)</Label>
                            <Input id="wageringRequirement" name="wageringRequirement" type="number" value={formData.wageringRequirement || ''} onChange={handleInputChange} placeholder="e.g., 35" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="bonusPercentage">Bonus % (if applicable)</Label>
                            <Input id="bonusPercentage" name="bonusPercentage" type="number" value={formData.bonusPercentage || ''} onChange={handleInputChange} placeholder="e.g., 100 for 100%" />
                        </div>
                        <div>
                            <Label htmlFor="maxBonusAmount">Max Bonus (if applicable)</Label>
                            <Input id="maxBonusAmount" name="maxBonusAmount" type="number" value={formData.maxBonusAmount || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="freeSpinsCount">Free Spins (if applicable)</Label>
                        <Input id="freeSpinsCount" name="freeSpinsCount" type="number" value={formData.freeSpinsCount || ''} onChange={handleInputChange} />
                    </div>
                     <div>
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value as Promotion['status'])}>
                            <SelectTrigger><SelectValue placeholder="Set status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex items-center space-x-2 pt-2">
                        <Switch id="isActive" name="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData(prev => ({...prev, isActive: checked}))} />
                        <Label htmlFor="isActive">Is Active (Overrides status for display)</Label>
                    </div>
                  </div>
                </form>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingId ? "Save Changes" : "Create Promotion"}
                  </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Promotions</CardTitle><BarChart className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Now</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : stats.active}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Claims (Example)</CardTitle><BarChart className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : stats.claimed}</div></CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 p-4 bg-card rounded-lg shadow flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search by title, description, type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
            />
        </div>
        <Tabs value={activeFilterTab} onValueChange={setActiveFilterTab} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-none md:flex">
            {uiCategories.map(cat => (
              <TabsTrigger key={cat.value} value={cat.value}>{cat.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Promotions Grid */}
      {isLoading && promotions.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Card key={i} className="h-[300px]"><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /><Skeleton className="h-8 w-1/2 mt-4" /></CardContent></Card>)}
        </div>
      )}
      {!isLoading && filteredPromotions.length === 0 && (
        <div className="text-center py-16 bg-card rounded-lg shadow">
            <Filter className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">No promotions match your current filters.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.map((promo) => (
          <AdminPromotionCard
            key={promo.id}
            promotion={promo}
            onEdit={() => handleEditPromotion(promo)}
            onDelete={() => handleDeletePromotion(promo.id)}
            onToggleActive={() => handleToggleActive(promo.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PromotionsAdminPage;

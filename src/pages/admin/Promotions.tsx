import React, { useState, useEffect } from "react"; // Added React import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { PlusCircle, Loader2, BarChart, Users, Search, Filter } from "lucide-react";
import PromotionCard from "@/components/promotions/PromotionCard"; // Assuming this component expects Promotion type
import { Promotion } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { motion } from "framer-motion"; // Not used

const uiCategories = [ // Renamed from categories to avoid conflict with Promotion's category field
  { value: "deposit_bonus", label: "Deposit Bonus" }, // Values should match Promotion.category values if used for filtering
  { value: "cashback", label: "Cashback" },
  { value: "tournament", label: "Tournament" },
  { value: "free_spins", label: "Free Spins" }, // Added
  { value: "recurring", label: "Recurring" }, // Custom category
  { value: "special", label: "Special" } // Custom category
];

// Define PromotionFormData based on Promotion type and form needs
interface PromotionFormData {
  title: string;
  description: string;
  imageUrl?: string;
  endDate: string; // Or Date
  category: string; // This aligns with Promotion.category
  promotionType: Promotion['promotionType']; // Use the defined types
  // Add other fields as needed by the form
  terms?: string;
  bonusPercentage?: number;
  maxBonusAmount?: number;
  freeSpinsCount?: number;
  wageringRequirement?: number;
  minDeposit?: number;
}

const Promotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    claimed: 0
  });
  
  const initialFormData: PromotionFormData = {
    title: "",
    description: "",
    imageUrl: "",
    endDate: "",
    category: "deposit_bonus", // Default category
    promotionType: "deposit_bonus", // Default type
    terms: "",
  };
  const [formData, setFormData] = useState<PromotionFormData>(initialFormData);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all"); // "all" or a category value
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Load promotions from localStorage on component mount
  useEffect(() => {
    const storedPromotions = localStorage.getItem('promotions');
    if (storedPromotions) {
      const parsedPromotions: Promotion[] = JSON.parse(storedPromotions);
      setPromotions(parsedPromotions);
      
      setStats({
        total: parsedPromotions.length,
        active: parsedPromotions.filter((p: Promotion) => p.isActive).length,
        claimed: Math.floor(Math.random() * 100) 
      });
    } else {
      const defaultPromotions: Promotion[] = [
        {
          id: "1",
          title: "Welcome Bonus",
          description: "Get a 100% match up to $1,000 + 50 free spins on your first deposit.",
          imageUrl: "https://images.unsplash.com/photo-1596731490442-1533cf2a1f18?auto=format&fit=crop&q=80&w=400",
          startDate: "2023-01-01",
          endDate: "Ongoing",
          isActive: true,
          promotionType: "deposit_bonus",
          category: "deposit_bonus",
          terms: "Terms and conditions apply",
          bonusPercentage: 100, maxBonusAmount: 1000, freeSpinsCount: 50
        },
        // ... other default promotions
      ];
      setPromotions(defaultPromotions);
      localStorage.setItem('promotions', JSON.stringify(defaultPromotions));
      
      setStats({
        total: defaultPromotions.length,
        active: defaultPromotions.filter(p => p.isActive).length,
        claimed: 0
      });
    }
  }, []);

  // Save promotions to localStorage whenever they change
  useEffect(() => {
    if (promotions.length > 0 || localStorage.getItem('promotions')) { // Save even if empty to clear it
      localStorage.setItem('promotions', JSON.stringify(promotions));
      setStats({
        total: promotions.length,
        active: promotions.filter(p => p.isActive).length,
        claimed: stats.claimed 
      });
    }
  }, [promotions, stats.claimed]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCategoryChange = (value: string) => { // This sets the 'category' field for UI
    setFormData(prev => ({
      ...prev,
      category: value,
      // Optionally map to promotionType if they are linked
      promotionType: value as Promotion['promotionType'] // Be careful with this cast
    }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const promotionDataFromForm: Omit<Promotion, 'id' | 'startDate' | 'isActive' | 'status'> & Partial<Pick<Promotion, 'startDate' | 'isActive' | 'status'>> = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        endDate: formData.endDate,
        category: formData.category,
        promotionType: formData.promotionType,
        terms: formData.terms || "Standard terms apply.",
        // Add other fields from formData like bonusPercentage, etc.
        bonusPercentage: formData.bonusPercentage,
        maxBonusAmount: formData.maxBonusAmount,
        freeSpinsCount: formData.freeSpinsCount,
        minDeposit: formData.minDeposit,
        wageringRequirement: formData.wageringRequirement,
      };

      if (editingId) {
        setPromotions(prev => 
          prev.map(promo => 
            promo.id === editingId 
              ? { 
                  ...promo, 
                  ...promotionDataFromForm,
                  isActive: promo.isActive, // Preserve current active state or update as needed
                  status: promo.status // Preserve status
                }
              : promo
          )
        );
        toast.success("Promotion updated successfully");
      } else {
        const newPromotion: Promotion = {
          id: `${Date.now()}`,
          ...promotionDataFromForm,
          startDate: new Date().toISOString().split('T')[0],
          isActive: true, // Default for new
          status: 'active', // Default for new
        };
        setPromotions(prev => [...prev, newPromotion]);
        toast.success("Promotion added successfully");
      }
      
      setFormData(initialFormData); // Reset form
      setEditingId(null);
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }, 500);
  };

  const handleEditPromotion = (id: string) => {
    const promoToEdit = promotions.find(p => p.id === id);
    if (promoToEdit) {
      setFormData({
        title: promoToEdit.title,
        description: promoToEdit.description,
        imageUrl: promoToEdit.imageUrl || "",
        endDate: promoToEdit.endDate,
        category: promoToEdit.category, // This is the UI category
        promotionType: promoToEdit.promotionType,
        terms: promoToEdit.terms || "",
        bonusPercentage: promoToEdit.bonusPercentage,
        maxBonusAmount: promoToEdit.maxBonusAmount,
        freeSpinsCount: promoToEdit.freeSpinsCount,
        minDeposit: promoToEdit.minDeposit,
        wageringRequirement: promoToEdit.wageringRequirement,
      });
      setEditingId(id);
      setIsDialogOpen(true);
    }
  };
  
  const handleDeletePromotion = (id: string) => {
    setPromotions(prev => prev.filter(promo => promo.id !== id));
    toast.success("Promotion deleted successfully");
  };
  
  const handleToggleActive = (id: string) => {
    setPromotions(prev => 
      prev.map(promo => 
        promo.id === id 
          ? { ...promo, isActive: !promo.isActive, status: !promo.isActive ? 'active' : 'inactive' }
          : promo
      )
    );
    
    const promotion = promotions.find(p => p.id === id);
    const action = promotion?.isActive ? "deactivated" : "activated"; // State before toggle
    toast.success(`Promotion ${action} successfully`);
  };

  const filteredPromotions = promotions.filter(promo => {
    if (activeTab !== "all" && promo.category !== activeTab) { // Filter by UI category
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        promo.title.toLowerCase().includes(query) ||
        promo.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Promotions Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            setFormData(initialFormData);
            setEditingId(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { /* Dialog open will trigger reset if not editing */ }}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-casino-thunder-dark text-white border-casino-thunder-green/50">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Promotion" : "Add New Promotion"}</DialogTitle>
              <DialogDescription className="text-white/70">
                Fill in the details below to {editingId ? "update" : "create"} a promotion.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Title */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} className="col-span-3 bg-casino-thunder-gray/30 border-white/10" />
              </div>
              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="col-span-3 bg-casino-thunder-gray/30 border-white/10" rows={3} />
              </div>
              {/* Image URL */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                <Input id="imageUrl" name="imageUrl" value={formData.imageUrl || ''} onChange={handleInputChange} className="col-span-3 bg-casino-thunder-gray/30 border-white/10" />
              </div>
              {/* End Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">End Date</Label>
                <Input id="endDate" name="endDate" value={formData.endDate} onChange={handleInputChange} placeholder="Ongoing, YYYY-MM-DD, etc." className="col-span-3 bg-casino-thunder-gray/30 border-white/10" />
              </div>
              {/* Category (for UI grouping and form selection) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="col-span-3 bg-casino-thunder-gray/30 border-white/10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {uiCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Terms */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="terms" className="text-right">Terms</Label>
                <Textarea id="terms" name="terms" value={formData.terms || ''} onChange={handleInputChange} className="col-span-3 bg-casino-thunder-gray/30 border-white/10" rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="bg-casino-thunder-green text-black">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="thunder-card">
          <CardHeader><CardTitle className="flex items-center"><BarChart className="h-5 w-5 mr-2 text-casino-thunder-green" />Total Promotions</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card className="thunder-card">
          <CardHeader><CardTitle className="flex items-center"><BarChart className="h-5 w-5 mr-2 text-casino-thunder-green" />Active Promotions</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.active}</div></CardContent>
        </Card>
        <Card className="thunder-card">
          <CardHeader><CardTitle className="flex items-center"><Users className="h-5 w-5 mr-2 text-casino-thunder-green" />Claimed Promotions</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.claimed}</div></CardContent>
        </Card>
      </div>


      <Card className="thunder-card mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
            <CardTitle>Manage Promotions</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search promotions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-60 bg-casino-thunder-gray/30 border-white/10"
                />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              {uiCategories.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {filteredPromotions.length === 0 && !searchQuery && (
                 <div className="text-center py-12 text-white/60">No promotions found. Create your first promotion!</div>
              )}
              {filteredPromotions.length === 0 && searchQuery && (
                 <div className="text-center py-12 text-white/60">No promotions found for "{searchQuery}".</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPromotions.map((promotion) => (
                  <PromotionCard
                    key={promotion.id}
                    promotion={promotion}
                    onEdit={() => handleEditPromotion(promotion.id)} // Ensure PromotionCardProps matches
                    onDelete={() => handleDeletePromotion(promotion.id)}
                    onToggleActive={() => handleToggleActive(promotion.id)}
                    isAdmin
                  />
                ))}
              </div>
            </TabsContent>

            {uiCategories.map((cat) => (
              <TabsContent key={cat.value} value={cat.value} className="mt-0">
                {filteredPromotions.filter(p => p.category === cat.value).length === 0 && (
                   <div className="text-center py-12 text-white/60">No {cat.label.toLowerCase()} promotions found.</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPromotions
                    .filter(p => p.category === cat.value) // Ensure only relevant promos are mapped
                    .map((promotion) => (
                      <PromotionCard
                        key={promotion.id}
                        promotion={promotion}
                        onEdit={() => handleEditPromotion(promotion.id)}
                        onDelete={() => handleDeletePromotion(promotion.id)}
                        onToggleActive={() => handleToggleActive(promotion.id)}
                        isAdmin
                      />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Promotions;

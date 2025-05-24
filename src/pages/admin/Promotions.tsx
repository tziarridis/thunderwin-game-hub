import { useState, useEffect } from "react";
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
import PromotionCard from "@/components/promotions/PromotionCard";
import { Promotion } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const categories = [
  { value: "deposit", label: "Deposit Bonus" },
  { value: "cashback", label: "Cashback" },
  { value: "tournament", label: "Tournament" },
  { value: "recurring", label: "Recurring" },
  { value: "special", label: "Special" }
];

const Promotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    claimed: 0
  });
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    endDate: "",
    category: "deposit"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Load promotions from localStorage on component mount
  useEffect(() => {
    const storedPromotions = localStorage.getItem('promotions');
    if (storedPromotions) {
      const parsedPromotions = JSON.parse(storedPromotions);
      setPromotions(parsedPromotions);
      
      // Calculate stats
      setStats({
        total: parsedPromotions.length,
        active: parsedPromotions.filter((p: Promotion) => p.isActive).length,
        claimed: Math.floor(Math.random() * 100) // Simulated data for now
      });
    } else {
      // Initial default promotions if none exist yet
      const defaultPromotions: Promotion[] = [
        {
          id: "1",
          title: "Welcome Bonus",
          description: "Get a 100% match up to $1,000 + 50 free spins on your first deposit.",
          image: "https://images.unsplash.com/photo-1596731490442-1533cf2a1f18?auto=format&fit=crop&q=80&w=400",
          startDate: "2023-01-01",
          endDate: "Ongoing",
          isActive: true,
          promotionType: "deposit",
          terms: "Terms and conditions apply",
          category: "deposit"
        },
        {
          id: "2",
          title: "Thunder Thursday",
          description: "Every Thursday, get 50 free spins when you deposit $50 or more.",
          image: "https://images.unsplash.com/photo-1587302273406-7104978770d2?auto=format&fit=crop&q=80&w=400",
          startDate: "2023-01-01",
          endDate: "Every Thursday",
          isActive: true,
          promotionType: "deposit",
          terms: "Terms and conditions apply",
          category: "recurring"
        },
        {
          id: "3",
          title: "Weekend Reload",
          description: "Reload your account during weekends and get a 75% bonus up to $500.",
          image: "https://images.unsplash.com/photo-1593183630166-2b4c86293796?auto=format&fit=crop&q=80&w=400",
          startDate: "2023-01-01",
          endDate: "Every Weekend",
          isActive: true,
          promotionType: "deposit",
          terms: "Terms and conditions apply",
          category: "deposit"
        }
      ];
      setPromotions(defaultPromotions);
      localStorage.setItem('promotions', JSON.stringify(defaultPromotions));
      
      // Initial stats
      setStats({
        total: defaultPromotions.length,
        active: defaultPromotions.filter(p => p.isActive).length,
        claimed: 0
      });
    }
  }, []);

  // Save promotions to localStorage whenever they change
  useEffect(() => {
    if (promotions.length > 0) {
      localStorage.setItem('promotions', JSON.stringify(promotions));
      
      // Update stats when promotions change
      setStats({
        total: promotions.length,
        active: promotions.filter(p => p.isActive).length,
        claimed: stats.claimed // Keep existing claimed count
      });
    }
  }, [promotions, stats.claimed]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value
    });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      if (editingId) {
        // Update existing promotion
        setPromotions(prev => 
          prev.map(promo => 
            promo.id === editingId 
              ? { 
                  ...promo, 
                  ...formData, 
                  isActive: true 
                }
              : promo
          )
        );
        toast.success("Promotion updated successfully");
      } else {
        // Add new promotion
        const newPromotion: Promotion = {
          id: `${Date.now()}`,
          title: formData.title,
          description: formData.description,
          image: formData.image,
          startDate: new Date().toISOString().split('T')[0],
          endDate: formData.endDate,
          isActive: true,
          promotionType: "deposit",
          terms: "Standard terms and conditions apply.",
          category: formData.category
        };
        setPromotions(prev => [...prev, newPromotion]);
        toast.success("Promotion added successfully");
      }
      
      setFormData({
        title: "",
        description: "",
        image: "",
        endDate: "",
        category: "deposit"
      });
      setEditingId(null);
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }, 500);
  };

  const handleEditPromotion = (id: string) => {
    const promotionToEdit = promotions.find(p => p.id === id);
    if (promotionToEdit) {
      setFormData({
        title: promotionToEdit.title,
        description: promotionToEdit.description,
        image: promotionToEdit.image || "",
        endDate: promotionToEdit.endDate,
        category: promotionToEdit.category || "deposit"
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
          ? { ...promo, isActive: !promo.isActive }
          : promo
      )
    );
    
    const promotion = promotions.find(p => p.id === id);
    const action = promotion?.isActive ? "deactivated" : "activated";
    toast.success(`Promotion ${action} successfully`);
  };
  
  const filteredPromotions = promotions.filter(promo => {
    // Filter by tab
    if (activeTab !== "all" && promo.category !== activeTab) {
      return false;
    }
    
    // Filter by search query
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setFormData({
                title: "",
                description: "",
                image: "",
                endDate: "",
                category: "deposit"
              });
              setEditingId(null);
            }}>
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="col-span-3 bg-casino-thunder-gray/30 border-white/10"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3 bg-casino-thunder-gray/30 border-white/10"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="col-span-3 bg-casino-thunder-gray/30 border-white/10"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  placeholder="Ongoing, Every Weekend, etc."
                  className="col-span-3 bg-casino-thunder-gray/30 border-white/10"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="col-span-3 bg-casino-thunder-gray/30 border-white/10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-casino-thunder-green text-black"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="thunder-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-casino-thunder-green" />
              Total Promotions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="thunder-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-casino-thunder-green" />
              Active Promotions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="thunder-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-casino-thunder-green" />
              Claimed Promotions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.claimed}</div>
          </CardContent>
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
              {categories.map((category) => (
                <TabsTrigger key={category.value} value={category.value}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPromotions.map((promotion) => (
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
              {filteredPromotions.length === 0 && (
                <div className="text-center py-12 text-white/60">
                  No promotions found. Create your first promotion!
                </div>
              )}
            </TabsContent>
            {categories.map((category) => (
              <TabsContent key={category.value} value={category.value} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPromotions.map((promotion) => (
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
                {filteredPromotions.length === 0 && (
                  <div className="text-center py-12 text-white/60">
                    No {category.label.toLowerCase()} promotions found. Create one!
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Promotions;

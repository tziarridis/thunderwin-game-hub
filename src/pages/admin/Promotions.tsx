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
import { PlusCircle, Loader2, BarChart, Users } from "lucide-react";
import PromotionCard from "@/components/promotions/PromotionCard";
import { Promotion } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const handleEdit = (promo: Promotion) => {
    setFormData({
      title: promo.title,
      description: promo.description,
      image: promo.image,
      endDate: promo.endDate,
      category: promo.category || "deposit"
    });
    setEditingId(promo.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this promotion?")) {
      setPromotions(prev => prev.filter(promo => promo.id !== id));
      toast.success("Promotion deleted successfully");
    }
  };
  
  const handleToggleStatus = (id: string) => {
    setPromotions(prev => 
      prev.map(promo => 
        promo.id === id 
          ? { ...promo, isActive: !promo.isActive }
          : promo
      )
    );
    toast.success("Promotion status updated");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Promotions</h1>
          <p className="text-gray-500">Manage casino promotions and offers</p>
        </div>
        
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
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Promotion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Promotion" : "Add New Promotion"}</DialogTitle>
              <DialogDescription>
                Fill in the details to {editingId ? "update the" : "create a new"} promotion.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Welcome Bonus"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the promotion"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  placeholder="e.g. 2025-04-30 or 'Ongoing'"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
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
                onClick={handleSubmit} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingId ? "Update Promotion" : "Create Promotion"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Promotions</CardTitle>
            <div className="text-muted-foreground bg-primary/10 p-2 rounded-full">
              <BarChart className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Promotions in the system</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
            <div className="text-muted-foreground bg-primary/10 p-2 rounded-full">
              <BarChart className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently visible to users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claimed Promotions</CardTitle>
            <div className="text-muted-foreground bg-primary/10 p-2 rounded-full">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.claimed}</div>
            <p className="text-xs text-muted-foreground">Total user claims</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map(promo => (
          <PromotionCard
            key={promo.id}
            title={promo.title}
            description={promo.description}
            image={promo.image}
            endDate={promo.endDate}
            isAdmin={true}
            onEdit={() => handleEdit(promo)}
            onDelete={() => handleDelete(promo.id)}
            onClick={() => handleToggleStatus(promo.id)}
            className={!promo.isActive ? "opacity-60" : ""}
          />
        ))}
      </div>
      
      {promotions.length === 0 && (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-foreground">No promotions available. Add your first promotion!</p>
        </div>
      )}
    </div>
  );
};

export default Promotions;

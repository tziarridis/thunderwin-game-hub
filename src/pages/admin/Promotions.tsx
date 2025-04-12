
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { PlusCircle, Loader2 } from "lucide-react";
import PromotionCard from "@/components/promotions/PromotionCard";

interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  endDate: string;
  isActive: boolean;
}

const Promotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: "1",
      title: "Welcome Bonus",
      description: "Get a 100% match up to $1,000 + 50 free spins on your first deposit.",
      image: "https://images.unsplash.com/photo-1596731490442-1533cf2a1f18?auto=format&fit=crop&q=80&w=400",
      endDate: "Ongoing",
      isActive: true
    },
    {
      id: "2",
      title: "Thunder Thursday",
      description: "Every Thursday, get 50 free spins when you deposit $50 or more.",
      image: "https://images.unsplash.com/photo-1587302273406-7104978770d2?auto=format&fit=crop&q=80&w=400",
      endDate: "Every Thursday",
      isActive: true
    },
    {
      id: "3",
      title: "Weekend Reload",
      description: "Reload your account during weekends and get a 75% bonus up to $500.",
      image: "https://images.unsplash.com/photo-1593183630166-2b4c86293796?auto=format&fit=crop&q=80&w=400",
      endDate: "Every Weekend",
      isActive: true
    }
  ]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    endDate: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
              ? { ...promo, ...formData, isActive: true }
              : promo
          )
        );
        toast.success("Promotion updated successfully");
      } else {
        // Add new promotion
        const newPromotion: Promotion = {
          id: `${Date.now()}`,
          ...formData,
          isActive: true
        };
        setPromotions(prev => [...prev, newPromotion]);
        toast.success("Promotion added successfully");
      }
      
      setFormData({
        title: "",
        description: "",
        image: "",
        endDate: ""
      });
      setEditingId(null);
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }, 1000);
  };

  const handleEdit = (promo: Promotion) => {
    setFormData({
      title: promo.title,
      description: promo.description,
      image: promo.image,
      endDate: promo.endDate
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
                endDate: ""
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
          />
        ))}
      </div>
    </div>
  );
};

export default Promotions;

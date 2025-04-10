
import { useState } from "react";
import { Game } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GameFormProps {
  initialValues?: Game;
  onSubmit: (values: Game | Omit<Game, 'id'>) => void;
}

const GameForm = ({ initialValues, onSubmit }: GameFormProps) => {
  const [formData, setFormData] = useState<any>({
    title: initialValues?.title || "",
    image: initialValues?.image || "",
    provider: initialValues?.provider || "",
    category: initialValues?.category || "slots",
    isPopular: initialValues?.isPopular || false,
    isNew: initialValues?.isNew || false,
    rtp: initialValues?.rtp || 96.0,
    minBet: initialValues?.minBet || 0.10,
    maxBet: initialValues?.maxBet || 100,
    volatility: initialValues?.volatility || "Medium",
    releaseDate: initialValues?.releaseDate || new Date().toISOString().split('T')[0],
    description: initialValues?.description || ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.image.trim()) {
      newErrors.image = "Image URL is required";
    }
    
    if (!formData.provider.trim()) {
      newErrors.provider = "Provider is required";
    }
    
    if (formData.rtp < 80 || formData.rtp > 100) {
      newErrors.rtp = "RTP must be between 80% and 100%";
    }
    
    if (formData.minBet <= 0) {
      newErrors.minBet = "Minimum bet must be greater than 0";
    }
    
    if (formData.maxBet <= formData.minBet) {
      newErrors.maxBet = "Maximum bet must be greater than minimum bet";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Format data for submission
    const gameData = {
      ...(initialValues?.id ? { id: initialValues.id } : {}),
      title: formData.title,
      image: formData.image,
      provider: formData.provider,
      category: formData.category as Game['category'],
      isPopular: formData.isPopular,
      isNew: formData.isNew,
      rtp: parseFloat(formData.rtp),
      minBet: parseFloat(formData.minBet),
      maxBet: parseFloat(formData.maxBet),
      volatility: formData.volatility as Game['volatility'],
      releaseDate: formData.releaseDate,
      description: formData.description
    };
    
    onSubmit(gameData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Game Title</Label>
          <Input 
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Input 
            id="provider"
            value={formData.provider}
            onChange={(e) => handleChange('provider', e.target.value)}
            className={errors.provider ? "border-red-500" : ""}
          />
          {errors.provider && <p className="text-red-500 text-xs">{errors.provider}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image">Image URL</Label>
        <Input 
          id="image"
          value={formData.image}
          onChange={(e) => handleChange('image', e.target.value)}
          className={errors.image ? "border-red-500" : ""}
        />
        {errors.image && <p className="text-red-500 text-xs">{errors.image}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => handleChange('category', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slots">Slots</SelectItem>
              <SelectItem value="live">Live Casino</SelectItem>
              <SelectItem value="table">Table Games</SelectItem>
              <SelectItem value="crash">Crash Games</SelectItem>
              <SelectItem value="jackpot">Jackpot</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="volatility">Volatility</Label>
          <Select 
            value={formData.volatility} 
            onValueChange={(value) => handleChange('volatility', value)}
          >
            <SelectTrigger id="volatility">
              <SelectValue placeholder="Select volatility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rtp">RTP (%)</Label>
          <Input 
            id="rtp"
            type="number"
            min="80"
            max="100"
            step="0.1"
            value={formData.rtp}
            onChange={(e) => handleChange('rtp', e.target.value)}
            className={errors.rtp ? "border-red-500" : ""}
          />
          {errors.rtp && <p className="text-red-500 text-xs">{errors.rtp}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minBet">Min Bet ($)</Label>
          <Input 
            id="minBet"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.minBet}
            onChange={(e) => handleChange('minBet', e.target.value)}
            className={errors.minBet ? "border-red-500" : ""}
          />
          {errors.minBet && <p className="text-red-500 text-xs">{errors.minBet}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maxBet">Max Bet ($)</Label>
          <Input 
            id="maxBet"
            type="number"
            min="1"
            step="1"
            value={formData.maxBet}
            onChange={(e) => handleChange('maxBet', e.target.value)}
            className={errors.maxBet ? "border-red-500" : ""}
          />
          {errors.maxBet && <p className="text-red-500 text-xs">{errors.maxBet}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="releaseDate">Release Date</Label>
        <Input 
          id="releaseDate"
          type="date"
          value={formData.releaseDate}
          onChange={(e) => handleChange('releaseDate', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <textarea 
          id="description"
          rows={3}
          className="w-full p-2 border rounded bg-black/20 border-white/20"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>
      
      <div className="flex items-center space-x-8 pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isPopular" 
            checked={formData.isPopular}
            onCheckedChange={(checked) => handleChange('isPopular', checked)}
          />
          <Label htmlFor="isPopular">Mark as Popular</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isNew" 
            checked={formData.isNew}
            onCheckedChange={(checked) => handleChange('isNew', checked)}
          />
          <Label htmlFor="isNew">Mark as New</Label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="submit" className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
          {initialValues ? "Update Game" : "Add Game"}
        </Button>
      </div>
    </form>
  );
};

export default GameForm;

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Game, GameProvider } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { clientGamesApi } from "@/services/gamesService";
import { adaptProvidersForUI } from "@/utils/gameAdapter";

export interface GameFormProps {
  onSubmit: (gameData: Game | Omit<Game, "id">) => void;
  initialData?: Game;
}

const GameForm: React.FC<GameFormProps> = ({ onSubmit, initialData }) => {
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const { toast } = useToast();
  
  // Helper to safely extract provider value
  const getProviderValue = (provider: any): string => {
    if (!provider) return "";
    if (typeof provider === 'string') return provider;
    if (typeof provider === 'object' && provider.name) return provider.name;
    return "";
  };
  
  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    provider: getProviderValue(initialData?.provider),
    category: initialData?.category || "slots",
    image: initialData?.image || "",
    rtp: initialData?.rtp || 96,
    volatility: initialData?.volatility || "medium",
    minBet: initialData?.minBet || 0.1,
    maxBet: initialData?.maxBet || 100,
    isPopular: initialData?.isPopular || false,
    isNew: initialData?.isNew || false,
    jackpot: initialData?.jackpot || false,
  });
  
  // Fetch providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoadingProviders(true);
        const data = await clientGamesApi.getProviders();
        // Convert API providers to UI providers
        const uiProviders = adaptProvidersForUI(data);
        setProviders(uiProviders);
      } catch (err) {
        console.error("Error fetching providers:", err);
        toast({
          title: "Error",
          description: "Failed to load game providers.",
          variant: "destructive",
        });
      } finally {
        setLoadingProviders(false);
      }
    };
    
    fetchProviders();
  }, [toast]);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create game object from form data
    const gameData: Omit<Game, "id"> = {
      title: formData.title,
      description: formData.description,
      provider: formData.provider,
      category: formData.category,
      image: formData.image,
      rtp: formData.rtp,
      volatility: formData.volatility,
      minBet: formData.minBet,
      maxBet: formData.maxBet,
      isPopular: formData.isPopular,
      isNew: formData.isNew,
      jackpot: formData.jackpot,
      isFavorite: false,
      releaseDate: new Date().toISOString(),
      tags: [],
    };
    
    if (initialData) {
      onSubmit({ ...gameData, id: initialData.id });
    } else {
      onSubmit(gameData);
    }
  };

  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Game Title</Label>
          <Input 
            id="title" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            placeholder="Enter game title" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Select 
            name="provider" 
            value={formData.provider} 
            onValueChange={(value) => handleSelectChange("provider", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.name}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            name="category" 
            value={formData.category} 
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slots">Slots</SelectItem>
              <SelectItem value="table">Table Games</SelectItem>
              <SelectItem value="live">Live Casino</SelectItem>
              <SelectItem value="crash">Crash Games</SelectItem>
              <SelectItem value="fishing">Fishing Games</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input 
            id="image" 
            name="image" 
            value={formData.image} 
            onChange={handleChange} 
            placeholder="Enter image URL" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rtp">RTP (%)</Label>
          <Input 
            id="rtp" 
            name="rtp" 
            type="number" 
            min="1" 
            max="100" 
            step="0.01" 
            value={formData.rtp} 
            onChange={handleNumberChange} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="volatility">Volatility</Label>
          <Select 
            name="volatility" 
            value={formData.volatility} 
            onValueChange={(value) => handleSelectChange("volatility", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select volatility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minBet">Minimum Bet</Label>
          <Input 
            id="minBet" 
            name="minBet" 
            type="number" 
            min="0.1" 
            step="0.1" 
            value={formData.minBet} 
            onChange={handleNumberChange} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maxBet">Maximum Bet</Label>
          <Input 
            id="maxBet" 
            name="maxBet" 
            type="number" 
            min="1" 
            value={formData.maxBet} 
            onChange={handleNumberChange} 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          placeholder="Enter game description" 
          rows={4} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="isPopular" 
            checked={formData.isPopular} 
            onCheckedChange={(checked) => handleSwitchChange("isPopular", checked)} 
          />
          <Label htmlFor="isPopular">Popular Game</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="isNew" 
            checked={formData.isNew} 
            onCheckedChange={(checked) => handleSwitchChange("isNew", checked)} 
          />
          <Label htmlFor="isNew">New Game</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="jackpot" 
            checked={formData.jackpot} 
            onCheckedChange={(checked) => handleSwitchChange("jackpot", checked)} 
          />
          <Label htmlFor="jackpot">Jackpot Game</Label>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit">
          {initialData ? "Update Game" : "Add Game"}
        </Button>
      </div>
    </form>
  );
};

export default GameForm;

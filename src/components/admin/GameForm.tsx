
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Game, GameProvider } from "@/types/game";

interface GameFormProps {
  onSubmit: (gameData: Game | Omit<Game, 'id'>) => void;
  initialValues?: Game;
  providers?: GameProvider[];
}

const GameForm: React.FC<GameFormProps> = ({ onSubmit, initialValues, providers = [] }) => {
  const [formData, setFormData] = useState({
    id: initialValues?.id,
    provider_id: initialValues?.provider_id || providers[0]?.id || 1,
    game_server_url: initialValues?.game_server_url || "",
    game_id: initialValues?.game_id || "",
    game_name: initialValues?.game_name || "",
    game_code: initialValues?.game_code || "",
    game_type: initialValues?.game_type || "slots",
    description: initialValues?.description || "",
    cover: initialValues?.cover || "",
    status: initialValues?.status || "active",
    technology: initialValues?.technology || "HTML5",
    has_lobby: initialValues?.has_lobby || false,
    is_mobile: initialValues?.is_mobile || true,
    has_freespins: initialValues?.has_freespins || false,
    has_tables: initialValues?.has_tables || false,
    only_demo: initialValues?.only_demo || false,
    rtp: initialValues?.rtp || 96,
    distribution: initialValues?.distribution || (providers[0]?.name || ""),
    views: initialValues?.views || 0,
    is_featured: initialValues?.is_featured || false,
    show_home: initialValues?.show_home || false
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: name === 'provider_id' ? parseInt(value) : value
    });
    
    // If provider changes, update distribution too
    if (name === 'provider_id') {
      const provider = providers.find(p => p.id === parseInt(value));
      if (provider) {
        setFormData(prev => ({
          ...prev,
          provider_id: parseInt(value),
          distribution: provider.name
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="game_name">Game Name</Label>
          <Input
            id="game_name"
            name="game_name"
            value={formData.game_name}
            onChange={handleChange}
            className="thunder-input"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="provider_id">Provider</Label>
          <Select
            value={formData.provider_id.toString()}
            onValueChange={(value) => handleSelectChange("provider_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id.toString()}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="game_id">Game ID</Label>
          <Input
            id="game_id"
            name="game_id"
            value={formData.game_id}
            onChange={handleChange}
            className="thunder-input"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="game_code">Game Code</Label>
          <Input
            id="game_code"
            name="game_code"
            value={formData.game_code}
            onChange={handleChange}
            className="thunder-input"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="game_type">Game Type</Label>
          <Select
            value={formData.game_type}
            onValueChange={(value) => handleSelectChange("game_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select game type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slots">Slots</SelectItem>
              <SelectItem value="table">Table Games</SelectItem>
              <SelectItem value="live">Live Casino</SelectItem>
              <SelectItem value="jackpot">Jackpot</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="rtp">RTP (%)</Label>
          <Input
            id="rtp"
            name="rtp"
            type="number"
            value={formData.rtp}
            onChange={handleChange}
            className="thunder-input"
            min="1"
            max="100"
            step="0.01"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="technology">Technology</Label>
          <Select
            value={formData.technology}
            onValueChange={(value) => handleSelectChange("technology", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select technology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HTML5">HTML5</SelectItem>
              <SelectItem value="Flash">Flash</SelectItem>
              <SelectItem value="Native">Native</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="cover">Cover Image URL</Label>
          <Input
            id="cover"
            name="cover"
            value={formData.cover}
            onChange={handleChange}
            className="thunder-input"
          />
        </div>
        
        <div>
          <Label htmlFor="game_server_url">Game Server URL</Label>
          <Input
            id="game_server_url"
            name="game_server_url"
            value={formData.game_server_url}
            onChange={handleChange}
            className="thunder-input"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="thunder-input min-h-[100px]"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="has_lobby"
            checked={formData.has_lobby}
            onCheckedChange={(checked) => handleSwitchChange("has_lobby", checked)}
          />
          <Label htmlFor="has_lobby">Has Lobby</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="is_mobile"
            checked={formData.is_mobile}
            onCheckedChange={(checked) => handleSwitchChange("is_mobile", checked)}
          />
          <Label htmlFor="is_mobile">Mobile Compatible</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="has_freespins"
            checked={formData.has_freespins}
            onCheckedChange={(checked) => handleSwitchChange("has_freespins", checked)}
          />
          <Label htmlFor="has_freespins">Has Free Spins</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="has_tables"
            checked={formData.has_tables}
            onCheckedChange={(checked) => handleSwitchChange("has_tables", checked)}
          />
          <Label htmlFor="has_tables">Has Tables</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="only_demo"
            checked={formData.only_demo}
            onCheckedChange={(checked) => handleSwitchChange("only_demo", checked)}
          />
          <Label htmlFor="only_demo">Demo Only</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="is_featured"
            checked={formData.is_featured}
            onCheckedChange={(checked) => handleSwitchChange("is_featured", checked)}
          />
          <Label htmlFor="is_featured">Featured Game</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show_home"
            checked={formData.show_home}
            onCheckedChange={(checked) => handleSwitchChange("show_home", checked)}
          />
          <Label htmlFor="show_home">Show on Home</Label>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-white"
        >
          {initialValues ? "Update Game" : "Add Game"}
        </Button>
      </div>
    </form>
  );
};

export default GameForm;

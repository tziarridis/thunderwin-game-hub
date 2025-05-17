
import React, { useState, useEffect } from 'react';
import { Game, GameProvider, GameCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Assuming you have services to fetch providers and categories
// import { gameProviderService } from '@/services/gameProviderService';
// import { gameCategoryService } from '@/services/gameCategoryService';

interface GameFormProps {
  initialValues?: Game;
  onSubmit: (data: Partial<Game>) => void;
  providers: GameProvider[]; // Pass providers as props
  categories: GameCategory[]; // Pass categories as props
}

const GameForm: React.FC<GameFormProps> = ({ initialValues, onSubmit, providers, categories }) => {
  const [formData, setFormData] = useState<Partial<Game>>({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        ...initialValues,
        // Ensure category_slugs is an array for multi-select or single for single-select
        category_slugs: initialValues.category_slugs || [], 
      });
    } else {
      // Defaults for a new game
      setFormData({
        title: '',
        provider_slug: providers.length > 0 ? providers[0].slug : '',
        category_slugs: [],
        status: 'active',
        rtp: 96,
        isPopular: false,
        isNew: false,
        is_featured: false,
        show_home: false,
        // Add other necessary defaults
      });
    }
  }, [initialValues, providers]);

  const handleChange = (field: keyof Game, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field: keyof Game, selectedValue: string) => {
    setFormData(prev => {
      const currentValues = (prev[field] as string[] | undefined) || [];
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter(v => v !== selectedValue)
        : [...currentValues, selectedValue];
      return { ...prev, [field]: newValues };
    });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Game Title</Label>
          <Input id="title" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="provider_slug">Provider</Label>
          <Select value={formData.provider_slug || ''} onValueChange={value => handleChange('provider_slug', value)}>
            <SelectTrigger id="provider_slug">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map(p => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="category_slugs">Categories</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-1">
            {categories.map(category => (
            <div key={category.slug} className="flex items-center space-x-2 p-2 border rounded-md">
                <Switch
                id={`category-${category.slug}`}
                checked={(formData.category_slugs || []).includes(category.slug)}
                onCheckedChange={() => handleMultiSelectChange('category_slugs', category.slug)}
                />
                <Label htmlFor={`category-${category.slug}`} className="text-sm font-normal">
                {category.name}
                </Label>
            </div>
            ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="gameCode">Game Code (for launching)</Label>
          <Input id="gameCode" value={formData.gameCode || ''} onChange={e => handleChange('gameCode', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="slug">Game Slug (URL)</Label>
          <Input id="slug" value={formData.slug || ''} onChange={e => handleChange('slug', e.target.value)} />
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="rtp">RTP (%)</Label>
          <Input id="rtp" type="number" value={formData.rtp || 0} onChange={e => handleChange('rtp', parseFloat(e.target.value))} step="0.1" />
        </div>
        <div>
          <Label htmlFor="minBet">Min Bet</Label>
          <Input id="minBet" type="number" value={formData.minBet || 0} onChange={e => handleChange('minBet', parseFloat(e.target.value))} step="0.01" />
        </div>
        <div>
          <Label htmlFor="maxBet">Max Bet</Label>
          <Input id="maxBet" type="number" value={formData.maxBet || 0} onChange={e => handleChange('maxBet', parseFloat(e.target.value))} step="1" />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="image">Image URL</Label>
          <Input id="image" value={formData.image || ''} onChange={e => handleChange('image', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="cover">Cover Image URL</Label>
          <Input id="cover" value={formData.cover || ''} onChange={e => handleChange('cover', e.target.value)} />
        </div>
         <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status || 'active'} onValueChange={value => handleChange('status', value as Game['status'])}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>


      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="isPopular" checked={formData.isPopular || false} onCheckedChange={checked => handleChange('isPopular', checked)} />
          <Label htmlFor="isPopular">Popular Game</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="isNew" checked={formData.isNew || false} onCheckedChange={checked => handleChange('isNew', checked)} />
          <Label htmlFor="isNew">New Game</Label>
        </div>
         <div className="flex items-center space-x-2">
          <Switch id="is_featured" checked={formData.is_featured || false} onCheckedChange={checked => handleChange('is_featured', checked)} />
          <Label htmlFor="is_featured">Featured Game</Label>
        </div>
         <div className="flex items-center space-x-2">
          <Switch id="show_home" checked={formData.show_home || false} onCheckedChange={checked => handleChange('show_home', checked)} />
          <Label htmlFor="show_home">Show on Home Page</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="jackpot" checked={formData.jackpot || false} onCheckedChange={checked => handleChange('jackpot', checked)} />
          <Label htmlFor="jackpot">Has Jackpot</Label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          {initialValues?.id ? 'Update Game' : 'Create Game'}
        </Button>
      </div>
    </form>
  );
};

export default GameForm;

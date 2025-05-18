import React, { useState, useEffect } from 'react';
import { DbGame, GameProvider, GameCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GameFormProps {
  game?: DbGame;
  providers: GameProvider[];
  categories: GameCategory[];
  onSubmit: (gameData: Partial<DbGame>) => void;
  onCancel: () => void;
}

const GameForm = ({ game, providers, categories, onSubmit, onCancel }: GameFormProps) => {
  const [formData, setFormData] = useState<Partial<DbGame>>({
    title: '',
    provider_slug: '', // Changed from provider_id to provider_slug for consistency if providers are identified by slugs
    category_slugs: [], // Changed from category_ids
    status: 'active',
    rtp: 0,
    // ... other default fields from DbGame
    game_code: '',
    launch_url_template: '', // or launch_url
    is_featured: false,
    is_new: false,
    is_popular: false,
    show_home: false,
  });

  useEffect(() => {
    if (game) {
      setFormData({
        ...game,
        provider_slug: game.provider_slug || (providers.find(p => p.id === game.provider_id)?.slug),
        category_slugs: Array.isArray(game.category_slugs) ? game.category_slugs : (typeof game.category_slugs === 'string' ? [game.category_slugs] : []),
      });
    } else {
       // Reset for new game form
       setFormData({
        title: '',
        provider_slug: providers[0]?.slug || '', 
        category_slugs: [],
        status: 'active',
        rtp: 96, // Default RTP
        game_code: '',
        launch_url_template: '',
        is_featured: false,
        is_new: false,
        is_popular: false,
        show_home: false,
        volatility: 'medium',
        description: '',
        cover: '',
        banner: ''
      });
    }
  }, [game, providers, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const checked = type === 'checkbox' ? e.target.checked : undefined;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
    }));
  };

  const handleSelectChange = (name: keyof DbGame, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: keyof DbGame, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = { ...formData };
    // Ensure provider_id is set if provider_slug is used primarily in form
    const selectedProvider = providers.find(p => p.slug === submissionData.provider_slug);
    if (selectedProvider) {
        submissionData.provider_id = selectedProvider.id;
    }
    // Ensure category_ids are set if category_slugs are used
    // This depends on how categories are linked, assuming slugs are primary keys or need mapping
    // For now, we submit slugs if that's what backend expects or handle mapping in service
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Game Title</Label>
        <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} required />
      </div>

      <div>
        <Label htmlFor="game_code">Game Code/ID (External)</Label>
        <Input id="game_code" name="game_code" value={formData.game_code || ''} onChange={handleChange} placeholder="e.g., provider-specific-id" />
      </div>

      <div>
        <Label htmlFor="provider_slug">Provider</Label>
        <Select name="provider_slug" value={formData.provider_slug || ''} onValueChange={(value) => handleSelectChange('provider_slug', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map(p => <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="category_slugs">Categories (multi-select)</Label>
        {/* Basic multi-select example. A better component might be needed. */}
        <Select 
            // @ts-ignore
            value={formData.category_slugs} 
            onValueChange={(value) => handleSelectChange('category_slugs', value)}
            // Shadcn Select doesn't directly support multi-select. This is a placeholder.
            // You might need a custom component or multiple single selects / checkboxes.
        >
            <SelectTrigger>
                <SelectValue placeholder="Select categories" />
            </SelectTrigger>
            <SelectContent>
                {categories.map(c => (
                    <SelectItem 
                        key={c.id} 
                        value={c.slug}
                        // For a real multi-select, you'd handle selection state differently
                    >
                        {c.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          Current: {Array.isArray(formData.category_slugs) ? formData.category_slugs.join(', ') : formData.category_slugs}
        </p>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} />
      </div>

      <div>
        <Label htmlFor="rtp">RTP (%)</Label>
        <Input id="rtp" name="rtp" type="number" step="0.01" value={formData.rtp || 0} onChange={handleChange} />
      </div>

      <div>
        <Label htmlFor="volatility">Volatility</Label>
        <Select name="volatility" value={formData.volatility || ''} onValueChange={(value) => handleSelectChange('volatility', value)}>
          <SelectTrigger><SelectValue placeholder="Select volatility" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="low-medium">Low-Medium</SelectItem>
            <SelectItem value="medium-high">Medium-High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="launch_url_template">Launch URL / Template</Label>
        <Input id="launch_url_template" name="launch_url_template" value={formData.launch_url_template || ''} onChange={handleChange} placeholder="e.g., https://provider.com/launch?game_id={GAME_ID}" />
      </div>
      
      <div>
        <Label htmlFor="cover">Cover Image URL</Label>
        <Input id="cover" name="cover" value={formData.cover || ''} onChange={handleChange} />
      </div>
      
      <div>
        <Label htmlFor="banner">Banner Image URL</Label>
        <Input id="banner" name="banner" value={formData.banner || ''} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" value={formData.status || 'active'} onValueChange={(value) => handleSelectChange('status', value)}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
         <div>
          <Label htmlFor="release_date">Release Date</Label>
          <Input id="release_date" name="release_date" type="date" value={formData.release_date ? formData.release_date.split('T')[0] : ''} onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch id="is_featured" name="is_featured" checked={!!formData.is_featured} onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)} />
          <Label htmlFor="is_featured">Featured Game</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="is_new" name="is_new" checked={!!formData.is_new} onCheckedChange={(checked) => handleSwitchChange('is_new', checked)} />
          <Label htmlFor="is_new">New Game</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="is_popular" name="is_popular" checked={!!formData.is_popular} onCheckedChange={(checked) => handleSwitchChange('is_popular', checked)} />
          <Label htmlFor="is_popular">Popular Game</Label>
        </div>
         <div className="flex items-center space-x-2">
          <Switch id="show_home" name="show_home" checked={!!formData.show_home} onCheckedChange={(checked) => handleSwitchChange('show_home', checked)} />
          <Label htmlFor="show_home">Show on Homepage</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{game?.id ? 'Update Game' : 'Create Game'}</Button>
      </div>
    </form>
  );
};

export default GameForm;

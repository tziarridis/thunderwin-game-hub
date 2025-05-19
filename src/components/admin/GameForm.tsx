import React, { useState, useEffect } from 'react';
import { Game, DbGame, GameProvider, GameCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface GameFormProps {
  game?: Game | DbGame | null;
  providers: GameProvider[];
  categories: GameCategory[];
  onSubmit: (gameData: Partial<DbGame>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const GameForm: React.FC<GameFormProps> = ({
  game,
  providers,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Partial<DbGame & { features_str?: string; themes_str?: string; tags_str?: string }>>({
    title: '',
    slug: '',
    provider_id: undefined,
    provider_slug: '',
    category_slugs: [],
    description: '',
    rtp: 0,
    volatility: 'medium',
    min_bet: 0,
    max_bet: 0,
    lines: 0,
    features_str: '', // Changed from features
    themes_str: '',   // Changed from themes
    tags_str: '',     // Changed from tags
    image_url: '',
    cover: '',
    banner: '',
    status: 'active',
    is_new: false,
    is_popular: false,
    is_featured: false,
    show_home: false,
    game_id: '', 
    game_code: '', 
    release_date: undefined,
  });

  useEffect(() => {
    if (game) {
      const gameFeatures = Array.isArray(game.features) ? game.features : (typeof game.features === 'string' ? game.features.split(',').map(f => f.trim()).filter(Boolean) : []);
      const gameThemes = Array.isArray(game.themes) ? game.themes : (typeof game.themes === 'string' ? game.themes.split(',').map(t => t.trim()).filter(Boolean) : []);
      const gameTags = Array.isArray(game.tags) ? game.tags : (typeof game.tags === 'string' ? game.tags.split(',').map(t => t.trim()).filter(Boolean) : []);

      const dbGameData: Partial<DbGame & { features_str?: string; themes_str?: string; tags_str?: string }> = {
        id: 'id' in game ? game.id : undefined,
        title: game.title || '',
        slug: game.slug || '',
        provider_id: 'provider_id' in game ? game.provider_id : undefined,
        provider_slug: ('provider_slug' in game && game.provider_slug) || ('provider' in game && game.provider) || '',
        category_slugs: Array.isArray(game.category_slugs) ? game.category_slugs : (typeof game.category_slugs === 'string' ? [game.category_slugs] : (game.category ? [game.category] : [])),
        description: game.description || '',
        rtp: typeof game.rtp === 'string' ? parseFloat(game.rtp) : (game.rtp || 0),
        volatility: ('volatility' in game && game.volatility) || 'medium',
        min_bet: ('minBet' in game && game.minBet !== undefined) ? game.minBet : (('min_bet' in game ? game.min_bet : undefined) ?? 0),
        max_bet: ('maxBet' in game && game.maxBet !== undefined) ? game.maxBet : (('max_bet' in game ? game.max_bet : undefined) ?? 0),
        lines: game.lines || 0,
        
        features_str: gameFeatures.join(', '),
        themes_str: gameThemes.join(', '),
        tags_str: gameTags.join(', '),

        image_url: ('image_url' in game && game.image_url) || ('image' in game && game.image) || '',
        cover: ('cover' in game && game.cover) || ('image' in game && game.image) || '',
        banner: ('banner' in game && game.banner) || '',
        status: game.status || 'active',
        is_new: ('is_new' in game ? game.is_new : ('isNew' in game ? game.isNew : false)) ?? false,
        is_popular: ('is_popular' in game ? game.is_popular : ('isPopular' in game ? game.isPopular : false)) ?? false,
        is_featured: game.is_featured || false,
        show_home: game.show_home || false,
        game_id: game.game_id || '',
        game_code: game.game_code || '',
        release_date: ('release_date' in game ? game.release_date : ('releaseDate' in game ? game.releaseDate : undefined)) || undefined,
      };
      setFormData(dbGameData);
    }
  }, [game]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // @ts-ignore
    setFormData(prev => ({ ...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSelectChange = (name: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
     if (name === 'provider_slug') {
        const selectedProvider = providers.find(p => p.slug === value);
        setFormData(prev => ({ ...prev, provider_id: selectedProvider?.id, provider_name: selectedProvider?.name }));
    }
    if (name === 'category_slugs' && typeof value === 'string') { // Assuming single select for now
        const selectedCategory = categories.find(c => c.slug === value);
        setFormData(prev => ({ ...prev, category_names: selectedCategory?.name ? [selectedCategory.name] : []}));
    }
  };
  
  const handleMultiSelectChange = (name: 'features' | 'themes' | 'tags' | 'category_slugs', values: string[]) => {
    setFormData(prev => ({ ...prev, [name]: values }));
    if (name === 'category_slugs') {
        const selectedCategories = categories.filter(c => values.includes(c.slug));
        setFormData(prev => ({...prev, category_names: selectedCategories.map(c => c.name) }))
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit: Partial<DbGame> = {
      ...formData,
      features: formData.features_str ? formData.features_str.split(',').map(f => f.trim()).filter(Boolean) : [],
      themes: formData.themes_str ? formData.themes_str.split(',').map(t => t.trim()).filter(Boolean) : [],
      tags: formData.tags_str ? formData.tags_str.split(',').map(t => t.trim()).filter(Boolean) : [],
      rtp: formData.rtp ? parseFloat(String(formData.rtp)) : undefined,
      min_bet: formData.min_bet ? parseFloat(String(formData.min_bet)) : undefined,
      max_bet: formData.max_bet ? parseFloat(String(formData.max_bet)) : undefined,
      lines: formData.lines ? parseInt(String(formData.lines), 10) : undefined,
    };
    // Remove the temporary string fields
    delete (dataToSubmit as any).features_str;
    delete (dataToSubmit as any).themes_str;
    delete (dataToSubmit as any).tags_str;
    
    try {
      await onSubmit(dataToSubmit);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit game form.");
      console.error("Game form submission error:", error);
    }
  };
  
  const getStringValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formData?.id ? 'Edit Game' : 'Add New Game'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Text Inputs */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL friendly)</Label>
              <Input id="slug" name="slug" value={formData.slug || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="game_id">Provider Game ID (External)</Label>
              <Input id="game_id" name="game_id" value={formData.game_id || ''} onChange={handleChange} />
            </div>
             <div>
              <Label htmlFor="game_code">Provider Game Code (External)</Label>
              <Input id="game_code" name="game_code" value={formData.game_code || ''} onChange={handleChange} />
            </div>

            {/* Selects: Provider & Category */}
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
              <Label htmlFor="category_slugs">Category (Primary)</Label>
              <Select
                name="category_slugs"
                // @ts-ignore
                value={Array.isArray(formData.category_slugs) && formData.category_slugs.length > 0 ? formData.category_slugs[0] : (formData.category_slugs as string || '')}
                onValueChange={(value) => handleMultiSelectChange('category_slugs', value ? [value] : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Numerical Inputs */}
            <div>
              <Label htmlFor="rtp">RTP (%)</Label>
              <Input id="rtp" name="rtp" type="number" step="0.01" value={getStringValue(formData.rtp)} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="min_bet">Min Bet</Label>
              <Input id="min_bet" name="min_bet" type="number" step="0.01" value={getStringValue(formData.min_bet)} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="max_bet">Max Bet</Label>
              <Input id="max_bet" name="max_bet" type="number" step="0.01" value={getStringValue(formData.max_bet)} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="lines">Lines</Label>
              <Input id="lines" name="lines" type="number" value={getStringValue(formData.lines)} onChange={handleChange} />
            </div>

            {/* Textareas for arrays (comma-separated) & Description */}
            <div>
              <Label htmlFor="features_str">Features (comma-separated)</Label>
              <Textarea id="features_str" name="features_str" value={formData.features_str || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="themes_str">Themes (comma-separated)</Label>
              <Textarea id="themes_str" name="themes_str" value={formData.themes_str || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="tags_str">Tags (comma-separated)</Label>
              <Textarea id="tags_str" name="tags_str" value={formData.tags_str || ''} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} />
            </div>

            {/* Image URLs */}
            <div>
              <Label htmlFor="image_url">Image URL (Primary)</Label>
              <Input id="image_url" name="image_url" value={formData.image_url || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="cover">Cover Image URL</Label>
              <Input id="cover" name="cover" value={formData.cover || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="banner">Banner Image URL</Label>
              <Input id="banner" name="banner" value={formData.banner || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="release_date">Release Date</Label>
              <Input id="release_date" name="release_date" type="date" value={formData.release_date ? formData.release_date.substring(0,10) : ''} onChange={handleChange} />
            </div>


            {/* Select for Status & Volatility */}
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
              <Label htmlFor="volatility">Volatility</Label>
              <Select name="volatility" value={formData.volatility || 'medium'} onValueChange={(value) => handleSelectChange('volatility', value)}>
                <SelectTrigger><SelectValue placeholder="Select volatility" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="low-medium">Low-Medium</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="medium-high">Medium-High</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2 pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="is_new" name="is_new" checked={!!formData.is_new} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_new: !!checked }))} />
              <Label htmlFor="is_new">Is New</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="is_popular" name="is_popular" checked={!!formData.is_popular} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: !!checked }))} />
              <Label htmlFor="is_popular">Is Popular</Label>
            </div>
             <div className="flex items-center space-x-2">
              <Checkbox id="is_featured" name="is_featured" checked={!!formData.is_featured} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: !!checked }))} />
              <Label htmlFor="is_featured">Is Featured (e.g. on homepage)</Label>
            </div>
             <div className="flex items-center space-x-2">
              <Checkbox id="show_home" name="show_home" checked={!!formData.show_home} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_home: !!checked }))} />
              <Label htmlFor="show_home">Show on Homepage Section</Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (formData?.id ? 'Saving...' : 'Adding...') : (formData?.id ? 'Save Changes' : 'Add Game')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GameForm;

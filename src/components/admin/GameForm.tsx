import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Game, DbGame } from '@/types';
import { toast } from 'sonner';

// This schema should align with the fields you expect in DbGame or the form
const gameSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  provider_slug: z.string().min(1, 'Provider is required'),
  category_slugs: z.array(z.string()).min(1, 'At least one category is required'),
  rtp: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0).max(100).optional().nullable()
  ),
  description: z.string().optional().nullable(),
  image: z.string().url('Must be a valid URL').optional().nullable(),
  bannerUrl: z.string().url('Must be a valid URL').optional().nullable(), // Changed to bannerUrl
  status: z.enum(['active', 'inactive', 'draft', 'maintenance', 'pending_review', 'archived']).default('active'), // Widened enum
  isPopular: z.boolean().default(false),
  isNew: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  show_home: z.boolean().default(false), // Added show_home
  game_id: z.string().optional().nullable(), 
  game_code: z.string().optional().nullable(), // Added game_code
  min_bet: z.preprocess( // Changed to min_bet
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0).optional().nullable()
  ),
  max_bet: z.preprocess( // Changed to max_bet
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0).optional().nullable()
  ),
  volatility: z.enum(['low', 'medium', 'high', 'low-medium', 'medium-high']).optional().nullable(), // Widened enum
  lines: z.preprocess( // Ensure number or null
    (val) => (val === '' || val === null || val === undefined ? null : parseInt(String(val), 10)),
    z.number().int().min(0).optional().nullable()
  ),
  features: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  themes: z.array(z.string()).optional(), // Added themes
  releaseDate: z.string().optional().nullable(), 
});

// Define a type for the form data based on the schema
export type GameFormData = z.infer<typeof gameSchema>;

// Define props for the GameForm component
export interface GameFormProps {
  game?: Game | DbGame | null; 
  onSubmit: (data: GameFormData, id?: string) => Promise<void>; 
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean; 
  providers?: { slug: string; name: string }[];
  categories?: { slug: string; name: string }[];
}

// Helper to map Game (frontend type) to GameFormData (form type)
const mapGameToFormData = (game: Game | DbGame): GameFormData => {
  const isDbGame = 'game_name' in game && !('title' in game); // More robust check

  return {
    title: isDbGame ? (game as DbGame).game_name || '' : (game as Game).title || '',
    slug: game.slug || '',
    provider_slug: (game as any).provider_slug || (game as Game).providerName?.toLowerCase().replace(/\s+/g, '-') || '',
    category_slugs: (game as any).category_slugs || (typeof (game as Game).categoryName === 'string' ? [(game as Game).categoryName.toLowerCase().replace(/\s+/g, '-')] : []),
    rtp: typeof game.rtp === 'string' ? parseFloat(game.rtp) : game.rtp,
    description: game.description || '',
    image: (game as Game).image || (game as any).cover || '',
    bannerUrl: (game as Game).bannerUrl || (game as any).banner_url || '', // Use bannerUrl
    status: (game.status as GameFormData['status']) || 'active',
    isPopular: (game as Game).isPopular ?? (game as any).is_popular ?? false,
    isNew: (game as Game).isNew ?? (game as any).is_new ?? false,
    is_featured: game.is_featured || false,
    show_home: (game as Game).show_home ?? (game as any).show_home ?? false, // Use show_home
    game_id: (game as Game).game_id || (game as any).game_id || '',
    game_code: (game as Game).game_code || (game as any).game_code || '', // Use game_code
    min_bet: (game as Game).min_bet ?? (game as any).min_bet ?? null, // Use min_bet
    max_bet: (game as Game).max_bet ?? (game as any).max_bet ?? null, // Use max_bet
    volatility: (game.volatility as GameFormData['volatility']) || null,
    lines: (game as any).lines ?? null,
    features: game.features || [],
    tags: game.tags || [],
    themes: (game as Game).themes || (game as any).themes || [], // Use themes
    releaseDate: (game as Game).releaseDate || (game as any).release_date || null,
  };
};


const GameForm: React.FC<GameFormProps> = ({
  game,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
  providers = [{slug: 'netent', name: 'NetEnt'}, {slug: 'pragmatic', name: 'Pragmatic Play'}],
  categories = [{slug: 'slots', name: 'Slots'}, {slug: 'live-casino', name: 'Live Casino'}],
}) => {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: game ? mapGameToFormData(game) : gameSchema.parse({
        title: '', slug: '', provider_slug: '', category_slugs: [], rtp: 96, status: 'active', // ensure all defaults are present
        isPopular: false, isNew: false, is_featured: false, show_home: false,
        min_bet: null, max_bet: null, lines: null, volatility: null, themes: []
    }),
  });

  useEffect(() => {
    if (game) {
      reset(mapGameToFormData(game));
    } else {
      reset(gameSchema.parse({
        title: '', slug: '', provider_slug: '', category_slugs: [], rtp: 96, status: 'active',
        isPopular: false, isNew: false, is_featured: false, show_home: false,
        min_bet: null, max_bet: null, lines: null, volatility: null, themes: []
      }));
    }
  }, [game, reset]);

  const handleFormSubmit = async (data: GameFormData) => {
    try {
      await onSubmit(data, game?.id ? String(game.id) : undefined);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} game.`);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register('title')} placeholder="Awesome Game Title" />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register('slug')} placeholder="awesome-game-title" />
          {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="provider_slug">Provider</Label>
        <Controller
          name="provider_slug"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
              <SelectContent>
                {providers.map(p => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
        {errors.provider_slug && <p className="text-red-500 text-sm mt-1">{errors.provider_slug.message}</p>}
      </div>
      
      <div>
        <Label>Categories</Label>
        <Controller
            name="category_slugs"
            control={control}
            render={({ field }) => ( // Assuming single category selection for simplicity. For multi-select, a different component would be better.
                <Select
                    onValueChange={(value) => field.onChange(value ? [value] : [])} 
                    defaultValue={field.value?.[0]}
                >
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                        {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            )}
        />
        {errors.category_slugs && <p className="text-red-500 text-sm mt-1">{errors.category_slugs.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} placeholder="Brief description of the game..." />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="image">Image URL (Cover)</Label>
          <Input id="image" {...register('image')} placeholder="https://example.com/game-cover.jpg" />
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
        </div>
        <div>
          <Label htmlFor="bannerUrl">Banner URL</Label> {/* Changed to bannerUrl */}
          <Input id="bannerUrl" {...register('bannerUrl')} placeholder="https://example.com/game-banner.jpg" /> {/* Changed to bannerUrl */}
          {errors.bannerUrl && <p className="text-red-500 text-sm mt-1">{errors.bannerUrl.message}</p>} {/* Changed to bannerUrl */}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
            <Label htmlFor="rtp">RTP (%)</Label>
            <Input id="rtp" type="number" step="0.01" {...register('rtp')} placeholder="e.g., 96.5" />
            {errors.rtp && <p className="text-red-500 text-sm mt-1">{errors.rtp.message}</p>}
        </div>
        <div>
            <Label htmlFor="status">Status</Label>
            <Controller
                name="status"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="pending_review">Pending Review</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
        </div>
        <div>
            <Label htmlFor="volatility">Volatility</Label>
            <Controller
                name="volatility"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <SelectTrigger><SelectValue placeholder="Select volatility" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="low-medium">Low-Medium</SelectItem>
                            <SelectItem value="medium-high">Medium-High</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
            {errors.volatility && <p className="text-red-500 text-sm mt-1">{errors.volatility.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="min_bet">Min Bet</Label> {/* Changed to min_bet */}
          <Input id="min_bet" type="number" step="0.01" {...register('min_bet')} placeholder="e.g., 0.10" /> {/* Changed to min_bet */}
          {errors.min_bet && <p className="text-red-500 text-sm mt-1">{errors.min_bet.message}</p>} {/* Changed to min_bet */}
        </div>
        <div>
          <Label htmlFor="max_bet">Max Bet</Label> {/* Changed to max_bet */}
          <Input id="max_bet" type="number" step="1" {...register('max_bet')} placeholder="e.g., 100" /> {/* Changed to max_bet */}
          {errors.max_bet && <p className="text-red-500 text-sm mt-1">{errors.max_bet.message}</p>} {/* Changed to max_bet */}
        </div>
      </div>
      
      {/* ... other fields like lines, game_id, game_code ... */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="lines">Lines</Label>
          <Input id="lines" type="number" {...register('lines')} placeholder="e.g., 20" />
          {errors.lines && <p className="text-red-500 text-sm mt-1">{errors.lines.message}</p>}
        </div>
        <div>
          <Label htmlFor="game_id">External Game ID</Label>
          <Input id="game_id" {...register('game_id')} placeholder="Provider's game ID" />
          {errors.game_id && <p className="text-red-500 text-sm mt-1">{errors.game_id.message}</p>}
        </div>
        <div>
          <Label htmlFor="game_code">External Game Code</Label>
          <Input id="game_code" {...register('game_code')} placeholder="Provider's launch code" />
          {errors.game_code && <p className="text-red-500 text-sm mt-1">{errors.game_code.message}</p>}
        </div>
      </div>
       <div>
          <Label htmlFor="themes">Themes (comma-separated)</Label>
          <Controller
            name="themes"
            control={control}
            render={({ field }) => (
              <Input
                id="themes"
                placeholder="e.g., adventure, mythology, fruits"
                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                onChange={(e) => field.onChange(e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : [])}
              />
            )}
          />
          {errors.themes && <p className="text-red-500 text-sm mt-1">{errors.themes.message}</p>}
        </div>


      <div className="space-y-2 pt-2">
        <div className="flex items-center space-x-2">
            <Controller name="isPopular" control={control} render={({ field }) => <Switch id="isPopular" checked={field.value} onCheckedChange={field.onChange} />} />
            <Label htmlFor="isPopular">Popular Game</Label>
        </div>
         <div className="flex items-center space-x-2">
            <Controller name="isNew" control={control} render={({ field }) => <Switch id="isNew" checked={field.value} onCheckedChange={field.onChange} />} />
            <Label htmlFor="isNew">New Game</Label>
        </div>
        <div className="flex items-center space-x-2">
            <Controller name="is_featured" control={control} render={({ field }) => <Switch id="is_featured" checked={field.value} onCheckedChange={field.onChange} />} />
            <Label htmlFor="is_featured">Featured Game</Label>
        </div>
        <div className="flex items-center space-x-2">
            <Controller name="show_home" control={control} render={({ field }) => <Switch id="show_home" checked={field.value} onCheckedChange={field.onChange} />} /> {/* Added show_home */}
            <Label htmlFor="show_home">Show on Homepage</Label> {/* Added show_home */}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Game')}
        </Button>
      </div>
    </form>
  );
};

export default GameForm;

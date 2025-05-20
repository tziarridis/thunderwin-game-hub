
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
import { Game, DbGame } from '@/types'; // Assuming Game is the primary type, DbGame might be for DB interaction
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
  banner: z.string().url('Must be a valid URL').optional().nullable(),
  status: z.enum(['active', 'inactive', 'draft']).default('active'),
  isPopular: z.boolean().default(false),
  isNew: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  show_home: z.boolean().default(false),
  game_id: z.string().optional().nullable(), // External game ID from provider
  game_code: z.string().optional().nullable(), // External game code/launch code
  minBet: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0).optional().nullable()
  ),
  maxBet: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0).optional().nullable()
  ),
  volatility: z.enum(['low', 'medium', 'high']).optional().nullable(),
  lines: z.number().int().min(0).optional().nullable(),
  features: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  themes: z.array(z.string()).optional(),
  releaseDate: z.string().optional().nullable(), // Or z.date() if using a date picker
});

// Define a type for the form data based on the schema
export type GameFormData = z.infer<typeof gameSchema>;

// Define props for the GameForm component
export interface GameFormProps {
  game?: Game | DbGame | null; // Game type from your types, DbGame if interacting with DB structure
  onSubmit: (data: GameFormData, id?: string) => Promise<void>; // Pass DbGame structure if that's what backend expects
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean; // To differentiate between create and edit
  // Mock data for providers and categories, replace with actual data fetching
  providers?: { slug: string; name: string }[];
  categories?: { slug: string; name: string }[];
}

// Helper to map Game (frontend type) to GameFormData (form type)
const mapGameToFormData = (game: Game | DbGame): GameFormData => {
  // Check if it's DbGame (has game_name) or Game (has title)
  const isDbGame = 'game_name' in game;

  return {
    title: isDbGame ? (game as DbGame).game_name || '' : (game as Game).title || '',
    slug: game.slug || '',
    provider_slug: (game as any).provider_slug || (game as Game).providerName?.toLowerCase().replace(' ', '-') || '', // Adjust based on your Game type
    category_slugs: (game as any).category_slugs || (typeof (game as Game).categoryName === 'string' ? [(game as Game).categoryName.toLowerCase().replace(' ', '-')] : []),
    rtp: typeof game.rtp === 'string' ? parseFloat(game.rtp) : game.rtp,
    description: game.description || '',
    image: (game as any).cover || (game as Game).image || '',
    banner: game.banner || '',
    status: (game.status as 'active' | 'inactive' | 'draft') || 'active',
    isPopular: (game as any).is_popular || (game as Game).isPopular || false,
    isNew: (game as any).is_new || (game as Game).isNew || false,
    is_featured: game.is_featured || false,
    show_home: game.show_home || false,
    game_id: (game as any).game_id || '',
    game_code: (game as any).game_code || '',
    minBet: (game as any).min_bet ?? (game as Game).minBet ?? null,
    maxBet: (game as any).max_bet ?? (game as Game).maxBet ?? null,
    volatility: (game.volatility as 'low' | 'medium' | 'high') || null,
    lines: (game as any).lines ?? null,
    features: game.features || [],
    tags: game.tags || [],
    themes: game.themes || [],
    releaseDate: (game as any).release_date || (game as Game).releaseDate || null,
  };
};


const GameForm: React.FC<GameFormProps> = ({
  game,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
  providers = [{slug: 'netent', name: 'NetEnt'}, {slug: 'pragmatic', name: 'Pragmatic Play'}], // Mock
  categories = [{slug: 'slots', name: 'Slots'}, {slug: 'live-casino', name: 'Live Casino'}], // Mock
}) => {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: game ? mapGameToFormData(game) : gameSchema.parse({
        title: '', slug: '', provider_slug: '', category_slugs: [], rtp: 96 // Example default
    }),
  });

  useEffect(() => {
    if (game) {
      reset(mapGameToFormData(game));
    } else {
      reset(gameSchema.parse({
        title: '', slug: '', provider_slug: '', category_slugs: [], rtp: 96
      }));
    }
  }, [game, reset]);

  const handleFormSubmit = async (data: GameFormData) => {
    try {
      // The onSubmit prop should handle mapping GameFormData to whatever the service expects (Partial<Game> or Partial<DbGame>)
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
            render={({ field }) => (
                <Select
                    onValueChange={(value) => field.onChange(value ? [value] : [])} // Simplified to single select for now, or implement multi-select
                    defaultValue={field.value?.[0]}
                >
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                        {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            )}
        />
        {/* For multi-select, you'd typically use checkboxes or a multi-select component */}
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
          <Label htmlFor="banner">Banner URL</Label>
          <Input id="banner" {...register('banner')} placeholder="https://example.com/game-banner.jpg" />
          {errors.banner && <p className="text-red-500 text-sm mt-1">{errors.banner.message}</p>}
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
                        </SelectContent>
                    </Select>
                )}
            />
            {errors.volatility && <p className="text-red-500 text-sm mt-1">{errors.volatility.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="minBet">Min Bet</Label>
          <Input id="minBet" type="number" step="0.01" {...register('minBet')} placeholder="e.g., 0.10" />
          {errors.minBet && <p className="text-red-500 text-sm mt-1">{errors.minBet.message}</p>}
        </div>
        <div>
          <Label htmlFor="maxBet">Max Bet</Label>
          <Input id="maxBet" type="number" step="1" {...register('maxBet')} placeholder="e.g., 100" />
          {errors.maxBet && <p className="text-red-500 text-sm mt-1">{errors.maxBet.message}</p>}
        </div>
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
            <Controller name="show_home" control={control} render={({ field }) => <Switch id="show_home" checked={field.value} onCheckedChange={field.onChange} />} />
            <Label htmlFor="show_home">Show on Homepage</Label>
        </div>
      </div>

      {/* Add more fields as needed: game_id, game_code, lines, features, tags, themes, releaseDate */}

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

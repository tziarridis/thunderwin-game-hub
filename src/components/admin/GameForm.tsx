
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Game, DbGame } from '@/types'; // Using updated types
import { mapDbGameToGameAdapter, mapGameToDbGameAdapter } from './GameAdapter';
import FormField from './shared/FormField'; // Assuming FormField component exists

// Define Zod schema based on the Game type for frontend validation
const gameSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  provider_slug: z.string().optional(),
  category_slugs: z.array(z.string()).optional(), // Array of strings
  rtp: z.preprocess((val) => Number(String(val).replace('%','')), z.number().min(0).max(100).optional()),
  status: z.enum(['active', 'inactive', 'maintenance', 'pending_review', 'draft', 'archived']).default('draft'),
  description: z.string().optional(),
  image: z.string().optional(), // Corresponds to cover in DbGame
  banner: z.string().optional(),
  isPopular: z.boolean().optional(),
  isNew: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  show_home: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  themes: z.array(z.string()).optional(),
  volatility: z.enum(['low', 'medium', 'high', 'low-medium', 'medium-high']).optional(),
  lines: z.preprocess((val) => Number(String(val)), z.number().int().min(0).optional()),
  minBet: z.preprocess((val) => Number(String(val)), z.number().min(0).optional()),
  maxBet: z.preprocess((val) => Number(String(val)), z.number().min(0).optional()),
  releaseDate: z.string().optional(), // Consider date picker or specific format
  game_id: z.string().optional(),
  game_code: z.string().optional(),

  // these are more for display and might not be directly edited or part of Game form schema
  // providerName: z.string().optional(), 
  // categoryName: z.string().optional(),
});

type GameFormData = z.infer<typeof gameSchema>;

interface GameFormProps {
  game?: DbGame | null; // Game from DB
  onSubmit: (data: Partial<DbGame>) => void; // Submitting DbGame compatible data
  onCancel: () => void;
  isLoading?: boolean;
  providers?: { id: string; name: string; slug: string }[]; // Assuming providers have slugs
  categories?: { id: string; name: string; slug: string }[]; // Assuming categories have slugs
}

const GameForm: React.FC<GameFormProps> = ({ game, onSubmit, onCancel, isLoading, providers = [], categories = [] }) => {
  const defaultValues = game ? mapDbGameToGameAdapter(game) : {};

  const { control, handleSubmit, reset, watch, setValue } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: defaultValues as GameFormData, // Cast: ensure mapDbGameToGameAdapter output matches GameFormData
  });

  useEffect(() => {
    if (game) {
      reset(mapDbGameToGameAdapter(game) as GameFormData);
    } else {
      reset(gameSchema.parse({}) as GameFormData); // Reset with default empty values according to schema
    }
  }, [game, reset]);

  const watchedTitle = watch('title');
  useEffect(() => {
    if (watchedTitle && !game?.slug) { // Only auto-generate slug if creating new or slug is empty
      setValue('slug', watchedTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [watchedTitle, setValue, game?.slug]);

  const handleFormSubmit = (data: GameFormData) => {
    const dbGamePayload = mapGameToDbGameAdapter(data as Game); // Map form data (Game-like) to DbGame structure
    onSubmit(dbGamePayload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={control} name="title" label="Title" placeholder="Enter game title" />
        <FormField control={control} name="slug" label="Slug" placeholder="game-slug" />
      </div>

      <FormField control={control} name="description" label="Description" render={({ field }) => <Textarea {...field} placeholder="Game description" rows={4} />} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={control} name="image" label="Image URL (Cover)" placeholder="https://example.com/image.png" />
        <FormField control={control} name="banner" label="Banner URL" placeholder="https://example.com/banner.png" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={control}
          name="provider_slug"
          label="Provider"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
              <SelectContent>
                {providers.map(p => <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
        <FormField
          control={control}
          name="status"
          label="Status"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                {['active', 'inactive', 'maintenance', 'pending_review', 'draft', 'archived'].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
         <FormField control={control} name="rtp" label="RTP (%)" placeholder="96.5" type="number" step="0.01" />
      </div>

      <FormField
        control={control}
        name="category_slugs"
        label="Categories (comma-separated slugs)"
        placeholder="slots,new,popular"
        render={({ field }) => (
            <Input 
                {...field} 
                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
            />
        )}
      />
      <FormField
        control={control}
        name="tags"
        label="Tags (comma-separated)"
        placeholder="jackpot,bonus-buy,megaways"
        render={({ field }) => (
            <Input 
                {...field} 
                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
            />
        )}
      />
       <FormField
        control={control}
        name="themes"
        label="Themes (comma-separated)"
        placeholder="ancient-egypt,space,adventure"
         render={({ field }) => (
            <Input 
                {...field} 
                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
            />
        )}
      />
       <FormField
        control={control}
        name="features"
        label="Features (comma-separated)"
        placeholder="free-spins,multipliers,wilds"
         render={({ field }) => (
            <Input 
                {...field} 
                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
            />
        )}
      />


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
            control={control}
            name="volatility"
            label="Volatility"
            render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select volatility" /></SelectTrigger>
                <SelectContent>
                    {['low', 'low-medium', 'medium', 'medium-high', 'high'].map(v => <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</SelectItem>)}
                </SelectContent>
                </Select>
            )}
        />
        <FormField control={control} name="lines" label="Lines" placeholder="20" type="number" />
        <FormField control={control} name="releaseDate" label="Release Date" type="date" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={control} name="minBet" label="Min Bet" placeholder="0.10" type="number" step="0.01" />
        <FormField control={control} name="maxBet" label="Max Bet" placeholder="100" type="number" step="1" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={control} name="game_id" label="External Game ID" placeholder="provider-game-id" />
        <FormField control={control} name="game_code" label="External Game Code" placeholder="PROVIDER_CODE_123" />
      </div>

      <div className="space-y-3 pt-4">
        <FormField control={control} name="isPopular" label="" render={({ field }) => (<div className="flex items-center space-x-2"><Checkbox id="isPopular" checked={field.value} onCheckedChange={field.onChange} /><Label htmlFor="isPopular">Popular Game</Label></div>)} />
        <FormField control={control} name="isNew" label="" render={({ field }) => (<div className="flex items-center space-x-2"><Checkbox id="isNew" checked={field.value} onCheckedChange={field.onChange} /><Label htmlFor="isNew">New Game</Label></div>)} />
        <FormField control={control} name="is_featured" label="" render={({ field }) => (<div className="flex items-center space-x-2"><Checkbox id="is_featured" checked={field.value} onCheckedChange={field.onChange} /><Label htmlFor="is_featured">Featured Game</Label></div>)} />
        <FormField control={control} name="show_home" label="" render={({ field }) => (<div className="flex items-center space-x-2"><Checkbox id="show_home" checked={field.value} onCheckedChange={field.onChange} /><Label htmlFor="show_home">Show on Home Page</Label></div>)} />
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Game'}</Button>
      </div>
    </form>
  );
};

export default GameForm;


import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame, GameProvider as FormGameProvider, GameCategory as FormGameCategory, GameStatusEnum, GameVolatilityEnum, GameTag, GameVolatility } from '@/types/game'; // Use GameVolatility
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { slugify } from '@/utils/gameTypeAdapter'; // Assuming this is correctly exported
import { convertGameToDbGame, convertDbGameToGame } from '@/utils/gameTypeAdapter';


const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const gameFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().optional(),
  game_id: z.string().optional().nullable(),
  provider_slug: z.string().min(1, "Provider is required"),
  // provider_id: z.string().optional().nullable(), // Assuming provider_slug is primary key from game_providers
  category_slugs: z.array(z.string()).optional().default([]),
  description: z.string().optional().nullable(),
  rtp: z.coerce.number().min(0).max(100).optional().nullable(),
  volatility: z.enum(Object.values(GameVolatilityEnum) as [GameVolatility, ...GameVolatility[]]).optional().nullable(), // Corrected enum usage
  tags: z.array(z.string()).optional().default([]), // Storing as string array, convert to GameTag[] if needed on display
  status: z.enum(Object.values(GameStatusEnum) as [GameStatusEnum, ...GameStatusEnum[]]).default(GameStatusEnum.ACTIVE),
  
  image_url: z.string().url().optional().nullable(),
  cover: z.string().url().optional().nullable(),
  banner_url: z.string().url().optional().nullable(),
  
  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_popular: z.boolean().default(false),
  show_home: z.boolean().default(false),
  
  lines: z.coerce.number().int().positive().optional().nullable(),
  min_bet: z.coerce.number().positive().optional().nullable(),
  max_bet: z.coerce.number().positive().optional().nullable(),
  
  only_demo: z.boolean().default(false),
  only_real: z.boolean().default(false),
  has_freespins: z.boolean().default(false),
  mobile_friendly: z.boolean().default(true), // is_mobile in DB
  
  release_date: z.string().optional().nullable(), // Consider z.date() if using a date picker
  game_code: z.string().optional().nullable(), // Internal game code from provider or for aggregator
  // Removed `providers` and `categories` from schema as they are for select options, not form fields
});

type GameFormValues = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  game?: DbGame | null; // Accept DbGame for editing
  onSubmitSuccess: () => void;
  onCancel: () => void;
  providers: FormGameProvider[]; // For select options
  categories: FormGameCategory[]; // For select options
  isLoading?: boolean;
}

// Fixed the syntax error in the component declaration
const GameForm = ({ game, onSubmitSuccess, onCancel, providers, categories, isLoading }: GameFormProps) => {
  // const [imagePreview, setImagePreview] = useState<string | null>(game?.cover || game?.image_url || null);
  // const [bannerPreview, setBannerPreview] = useState<string | null>(game?.banner_url || null);
  // Image handling can be complex, simplified for now by using URL inputs. File upload would require more logic.

  const gameForForm = game ? convertDbGameToGame(game) : null;

  const defaultValues: Partial<GameFormValues> = {
    title: gameForForm?.title || '',
    slug: gameForForm?.slug || '',
    game_id: gameForForm?.game_id || '',
    provider_slug: gameForForm?.provider_slug || '',
    category_slugs: gameForForm?.category_slugs || [],
    description: gameForForm?.description || '',
    rtp: gameForForm?.rtp || undefined,
    volatility: gameForForm?.volatility || undefined,
    tags: Array.isArray(gameForForm?.tags) ? gameForForm.tags.map(tag => typeof tag === 'string' ? tag : tag.name) : [],
    status: gameForForm?.status || GameStatusEnum.ACTIVE,
    image_url: gameForForm?.image_url || '',
    cover: gameForForm?.cover || '',
    banner_url: gameForForm?.bannerUrl || '',
    is_featured: gameForForm?.is_featured || false,
    is_new: gameForForm?.is_new || false,
    is_popular: gameForForm?.is_popular || false,
    show_home: gameForForm?.show_home || false,
    lines: gameForForm?.lines || undefined,
    min_bet: gameForForm?.min_bet || undefined,
    max_bet: gameForForm?.max_bet || undefined,
    only_demo: gameForForm?.only_demo || false,
    only_real: gameForForm?.only_real || false,
    has_freespins: gameForForm?.has_freespins || false,
    mobile_friendly: gameForForm?.mobile_friendly === undefined ? true : gameForForm.mobile_friendly,
    release_date: gameForForm?.releaseDate ? new Date(gameForForm.releaseDate).toISOString().split('T')[0] : '', // Format for date input
    game_code: gameForForm?.game_code || '',
  };


  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues,
  });

  const watchedTitle = watch('title');
  useEffect(() => {
    if (watchedTitle && !gameForForm?.slug) { // Only auto-slugify if not editing or slug is empty
      setValue('slug', slugify(watchedTitle));
    }
  }, [watchedTitle, setValue, gameForForm?.slug]);

  const onSubmit = async (data: GameFormValues) => {
    try {
      const gameDataToSave: Partial<Game> = { // Map form values to Game type
        ...data,
        // Ensure specific type conversions if needed, e.g., tags
        tags: data.tags?.map(tagName => ({ name: tagName, slug: slugify(tagName) })),
        // Volatility is already GameVolatility | undefined from schema
      };
      
      const dbGamePayload = convertGameToDbGame(gameDataToSave);
      
      // The ID handling needs to be careful:
      // For new games, 'id' should usually be generated by Supabase or be based on game_id if it's unique.
      // For existing games, game.id (from DbGame) is the UUID to update.
      // convertGameToDbGame might set `id` based on `gameDataToSave.id`.
      // If `gameDataToSave.id` is not set, it won't be in `dbGamePayload`.

      let result;
      if (game?.id) { // Editing existing game
        const { data: updatedGame, error } = await supabase
          .from('games')
          .update(dbGamePayload as any) // Cast to any to bypass strict Partial<DbGame> checks if needed
          .eq('id', game.id)
          .select()
          .single();
        if (error) throw error;
        result = updatedGame;
        toast.success('Game updated successfully!');
      } else { // Adding new game
         // Remove 'id' if it's empty or not meant for insert, Supabase will generate it
        const insertPayload = { ...dbGamePayload };
        if (!insertPayload.id) delete insertPayload.id;

        const { data: newGame, error } = await supabase
          .from('games')
          .insert(insertPayload as any) // Cast to any
          .select()
          .single();
        if (error) throw error;
        result = newGame;
        toast.success('Game added successfully!');
      }
      console.log("Game saved:", result);
      onSubmitSuccess();
    } catch (error: any) {
      console.error("Error saving game:", error);
      toast.error(`Failed to save game: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="slug">Slug (auto-generated from title if empty)</Label>
            <Input id="slug" {...register('slug')} />
            {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
          </div>
          <div>
            <Label htmlFor="provider_slug">Provider</Label>
            <Controller
              name="provider_slug"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select Provider" /></SelectTrigger>
                  <SelectContent>
                    {providers.map(p => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.provider_slug && <p className="text-red-500 text-sm">{errors.provider_slug.message}</p>}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    {Object.values(GameStatusEnum).map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
          </div>
           <div>
            <Label htmlFor="volatility">Volatility</Label>
            <Controller
              name="volatility"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || undefined} >
                  <SelectTrigger><SelectValue placeholder="Select Volatility" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {Object.values(GameVolatilityEnum).map(vol => (
                      <SelectItem key={vol} value={vol}>{vol.charAt(0).toUpperCase() + vol.slice(1)}</SelectItem>))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.volatility && <p className="text-red-500 text-sm">{errors.volatility.message}</p>}
          </div>
          <div>
            <Label htmlFor="rtp">RTP (%)</Label>
            <Input id="rtp" type="number" step="0.01" {...register('rtp')} />
            {errors.rtp && <p className="text-red-500 text-sm">{errors.rtp.message}</p>}
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>
           <div>
            <Label htmlFor="category_slugs">Categories (Ctrl+Click to select multiple)</Label>
            <Controller
              name="category_slugs"
              control={control}
              render={({ field }) => (
                <select
                  multiple
                  className="w-full p-2 border rounded-md h-32 bg-background text-foreground border-border"
                  value={field.value || []}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                    field.onChange(selectedOptions);
                  }}
                >
                  {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              )}
            />
            {errors.category_slugs && <p className="text-red-500 text-sm">{errors.category_slugs.message}</p>}
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g. popular, new, bonus-buy"
              {...register('tags', { setValueAs: (value: string | string[]) => typeof value === 'string' ? value.split(',').map(tag => tag.trim()).filter(Boolean) : value })}
            />
            {errors.tags && (
              <p className="text-red-500 text-sm">
                {Array.isArray(errors.tags)
                  ? errors.tags.map(e => e?.message).filter(Boolean).join(', ')
                  : errors.tags.message}
              </p>
            )}
          </div>
           <div>
            <Label htmlFor="game_id">External Game ID (from provider)</Label>
            <Input id="game_id" {...register('game_id')} />
            {errors.game_id && <p className="text-red-500 text-sm">{errors.game_id.message}</p>}
          </div>
          <div>
            <Label htmlFor="game_code">Internal Game Code (for aggregators, etc.)</Label>
            <Input id="game_code" {...register('game_code')} />
            {errors.game_code && <p className="text-red-500 text-sm">{errors.game_code.message}</p>}
          </div>
        </div>
        
        {/* Column 3 - URLs and Booleans */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="image_url">Image URL (Thumbnail/List View)</Label>
            <Input id="image_url" type="url" {...register('image_url')} />
            {errors.image_url && <p className="text-red-500 text-sm">{errors.image_url.message}</p>}
          </div>
          <div>
            <Label htmlFor="cover">Cover URL (Detail View/Larger Image)</Label>
            <Input id="cover" type="url" {...register('cover')} />
            {errors.cover && <p className="text-red-500 text-sm">{errors.cover.message}</p>}
          </div>
          <div>
            <Label htmlFor="banner_url">Banner URL (Promotional)</Label>
            <Input id="banner_url" type="url" {...register('banner_url')} />
            {errors.banner_url && <p className="text-red-500 text-sm">{errors.banner_url.message}</p>}
          </div>
           <div>
            <Label htmlFor="release_date">Release Date</Label>
            <Input id="release_date" type="date" {...register('release_date')} />
            {errors.release_date && <p className="text-red-500 text-sm">{errors.release_date.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              { name: 'is_featured', label: 'Featured' },
              { name: 'is_new', label: 'New' },
              { name: 'is_popular', label: 'Popular' },
              { name: 'show_home', label: 'Show on Home' },
              { name: 'only_demo', label: 'Demo Only' },
              { name: 'only_real', label: 'Real Money Only' },
              { name: 'has_freespins', label: 'Has Freespins' },
              { name: 'mobile_friendly', label: 'Mobile Friendly' },
            ].map(cb => (
              <div key={cb.name} className="flex items-center space-x-2">
                <Controller
                  name={cb.name as keyof GameFormValues}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={cb.name}
                      checked={field.value as boolean | undefined}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor={cb.name} className="text-sm font-medium">
                  {cb.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Numerical details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t mt-6">
          <div>
            <Label htmlFor="lines">Lines</Label>
            <Input id="lines" type="number" {...register('lines')} />
            {errors.lines && <p className="text-red-500 text-sm">{errors.lines.message}</p>}
          </div>
          <div>
            <Label htmlFor="min_bet">Min Bet</Label>
            <Input id="min_bet" type="number" step="0.01" {...register('min_bet')} />
            {errors.min_bet && <p className="text-red-500 text-sm">{errors.min_bet.message}</p>}
          </div>
          <div>
            <Label htmlFor="max_bet">Max Bet</Label>
            <Input id="max_bet" type="number" step="0.01" {...register('max_bet')} />
            {errors.max_bet && <p className="text-red-500 text-sm">{errors.max_bet.message}</p>}
          </div>
      </div>

      <div className="flex justify-end space-x-2 pt-6 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (game ? 'Update Game' : 'Add Game')}
        </Button>
      </div>
    </form>
  );
};

export default GameForm;

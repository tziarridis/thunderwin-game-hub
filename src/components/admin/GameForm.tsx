import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Game, GameStatus, GameVolatility, GameTag } from '@/types/game'; // GameTag might not be directly used in form values if tags are string[]
import { GameProvider, GameCategory } from '@/types'; // Assuming these are for select options
import { toast } from 'sonner';
import { Loader2, Trash2, PlusCircle } from 'lucide-react';

// Zod schema for game form validation
const gameFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  game_id: z.string().optional(), // External game ID
  provider_slug: z.string().min(1, 'Provider slug is required'), // Or provider_id
  category_slugs: z.array(z.string()).min(1, 'At least one category is required'),
  rtp: z.number().min(0).max(100).optional(),
  status: z.nativeEnum(GameStatus),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  bannerUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  volatility: z.nativeEnum(GameVolatility).optional(),
  tags: z.array(z.string()).optional(), // Tags are handled as an array of strings
  features: z.array(z.string()).optional(),
  themes: z.array(z.string()).optional(),
  lines: z.number().int().positive().optional(),
  min_bet: z.number().positive().optional(),
  max_bet: z.number().positive().optional(),
  releaseDate: z.string().optional(), // ISO date string
  is_featured: z.boolean().optional(),
  isNew: z.boolean().optional(), // Renamed from is_new to match Game type
  isPopular: z.boolean().optional(),
  show_home: z.boolean().optional(),
  only_demo: z.boolean().optional(),
  only_real: z.boolean().optional(),
  game_code: z.string().optional(),
});

export type GameFormValues = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  game?: Game; // For editing
  providers: GameProvider[]; // For select dropdown
  categories: GameCategory[]; // For multi-select or similar
  onSubmit: (data: GameFormValues) => Promise<void>;
  onDelete?: (gameId: string) => Promise<void>;
  isSubmitting: boolean;
  isDeleting?: boolean;
}


const GameForm: React.FC<GameFormProps> = ({
  game,
  providers,
  categories,
  onSubmit,
  onDelete,
  isSubmitting,
  isDeleting,
}) => {
  const { control, register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: game ? {
      ...game,
      rtp: game.rtp ?? undefined,
      lines: game.lines ?? undefined,
      min_bet: game.min_bet ?? undefined,
      max_bet: game.max_bet ?? undefined,
      tags: Array.isArray(game.tags) ? game.tags.map(t => typeof t === 'string' ? t : t.slug) : [], // Ensure tags are string[]
      features: game.features ?? [],
      themes: game.themes ?? [],
      category_slugs: game.category_slugs ?? [],
      isNew: game.isNew ?? game.is_new ?? false, // handle both isNew and is_new from Game type
    } : {
      status: GameStatus.DRAFT,
      tags: [],
      features: [],
      themes: [],
      category_slugs: [],
      is_featured: false,
      isNew: false,
      isPopular: false,
      show_home: false,
      only_demo: false,
      only_real: false,
    },
  });

  useEffect(() => {
    if (game) {
      const gameData = {
        ...game,
        rtp: game.rtp ?? undefined,
        lines: game.lines ?? undefined,
        min_bet: game.min_bet ?? undefined,
        max_bet: game.max_bet ?? undefined,
        tags: Array.isArray(game.tags) ? game.tags.map(t => typeof t === 'string' ? t : t.slug) : [],
        features: game.features ?? [],
        themes: game.themes ?? [],
        category_slugs: game.category_slugs ?? [],
        isNew: game.isNew ?? game.is_new ?? false,
      };
      reset(gameData);
    } else {
        reset({
            status: GameStatus.DRAFT,
            tags: [], features: [], themes: [], category_slugs: [],
            is_featured: false, isNew: false, isPopular: false, show_home: false,
            only_demo: false, only_real: false,
        });
    }
  }, [game, reset]);

  const [currentTag, setCurrentTag] = useState('');
  const [currentFeature, setCurrentFeature] = useState('');
  const [currentTheme, setCurrentTheme] = useState('');

  const watchedTags = watch('tags') || [];
  const watchedFeatures = watch('features') || [];
  const watchedThemes = watch('themes') || [];

  const handleAddToArray = (
    field: keyof Pick<GameFormValues, 'tags' | 'features' | 'themes'>,
    value: string,
    currentValueSetter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (value.trim() === '') return;
    const currentArray = watch(field) || [];
    if (!currentArray.includes(value.trim())) {
      setValue(field, [...currentArray, value.trim()], { shouldValidate: true });
    }
    currentValueSetter('');
  };

  const handleRemoveFromArray = (
    field: keyof Pick<GameFormValues, 'tags' | 'features' | 'themes'>,
    valueToRemove: string
  ) => {
    const currentArray = watch(field) || [];
    setValue(field, currentArray.filter(item => item !== valueToRemove), { shouldValidate: true });
  };


  const gameStatuses = Object.values(GameStatus);
  const gameVolatilities = Object.values(GameVolatility);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info Section */}
        <div className="space-y-4 p-4 border rounded-md">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...register("slug")} />
            {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
          </div>
          <div>
            <Label htmlFor="game_id">External Game ID (Optional)</Label>
            <Input id="game_id" {...register("game_id")} />
            {errors.game_id && <p className="text-sm text-destructive mt-1">{errors.game_id.message}</p>}
          </div>
           <div>
            <Label htmlFor="game_code">Game Code (e.g., for provider)</Label>
            <Input id="game_code" {...register("game_code")} />
            {errors.game_code && <p className="text-sm text-destructive mt-1">{errors.game_code.message}</p>}
          </div>
        </div>

        {/* Provider and Category Section */}
        <div className="space-y-4 p-4 border rounded-md">
          <h3 className="text-lg font-semibold">Provider & Category</h3>
          <div>
            <Label htmlFor="provider_slug">Provider</Label>
            <Controller
              name="provider_slug"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    {providers.map(p => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.provider_slug && <p className="text-sm text-destructive mt-1">{errors.provider_slug.message}</p>}
          </div>
          <div>
            <Label>Categories</Label>
            <Controller
                name="category_slugs"
                control={control}
                render={({ field }) => (
                    <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                    {categories.map(cat => (
                        <div key={cat.slug} className="flex items-center space-x-2">
                        <Checkbox
                            id={`category-${cat.slug}`}
                            checked={field.value?.includes(cat.slug)}
                            onCheckedChange={(checked) => {
                            const newValue = checked
                                ? [...(field.value || []), cat.slug]
                                : (field.value || []).filter(s => s !== cat.slug);
                            field.onChange(newValue);
                            }}
                        />
                        <Label htmlFor={`category-${cat.slug}`}>{cat.name}</Label>
                        </div>
                    ))}
                    </div>
                )}
            />
            {errors.category_slugs && <p className="text-sm text-destructive mt-1">{errors.category_slugs.message}</p>}
          </div>
        </div>
      </div>

      {/* URLs Section */}
      <div className="space-y-4 p-4 border rounded-md">
        <h3 className="text-lg font-semibold">Image URLs</h3>
        <div>
            <Label htmlFor="image">Cover Image URL</Label>
            <Input id="image" {...register("image")} placeholder="https://example.com/cover.jpg"/>
            {errors.image && <p className="text-sm text-destructive mt-1">{errors.image.message}</p>}
        </div>
        <div>
            <Label htmlFor="bannerUrl">Banner Image URL (Optional)</Label>
            <Input id="bannerUrl" {...register("bannerUrl")} placeholder="https://example.com/banner.jpg"/>
            {errors.bannerUrl && <p className="text-sm text-destructive mt-1">{errors.bannerUrl.message}</p>}
        </div>
      </div>
      
      {/* Details Section */}
      <div className="space-y-4 p-4 border rounded-md">
        <h3 className="text-lg font-semibold">Game Details</h3>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} />
          {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="rtp">RTP (%)</Label>
            <Input id="rtp" type="number" step="0.01" {...register("rtp", { valueAsNumber: true })} />
            {errors.rtp && <p className="text-sm text-destructive mt-1">{errors.rtp.message}</p>}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
             <Controller
                name="status"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                        {gameStatuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
                    </SelectContent>
                    </Select>
                )}
            />
            {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
          </div>
          <div>
            <Label htmlFor="volatility">Volatility</Label>
             <Controller
                name="volatility"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select volatility" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {gameVolatilities.map(v => <SelectItem key={v} value={v}>{v.replace(/_/g, ' ')}</SelectItem>)}
                    </SelectContent>
                    </Select>
                )}
            />
            {errors.volatility && <p className="text-sm text-destructive mt-1">{errors.volatility.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <Label htmlFor="lines">Lines (Optional)</Label>
                <Input id="lines" type="number" {...register("lines", {setValueAs: (v) => v === "" ? undefined : parseInt(v, 10)})} />
                {errors.lines && <p className="text-sm text-destructive mt-1">{errors.lines.message}</p>}
            </div>
            <div>
                <Label htmlFor="min_bet">Min Bet (Optional)</Label>
                <Input id="min_bet" type="number" step="0.01" {...register("min_bet", {setValueAs: (v) => v === "" ? undefined : parseFloat(v)})} />
                {errors.min_bet && <p className="text-sm text-destructive mt-1">{errors.min_bet.message}</p>}
            </div>
            <div>
                <Label htmlFor="max_bet">Max Bet (Optional)</Label>
                <Input id="max_bet" type="number" step="0.01" {...register("max_bet", {setValueAs: (v) => v === "" ? undefined : parseFloat(v)})} />
                {errors.max_bet && <p className="text-sm text-destructive mt-1">{errors.max_bet.message}</p>}
            </div>
        </div>
         <div>
            <Label htmlFor="releaseDate">Release Date (YYYY-MM-DD)</Label>
            <Input id="releaseDate" type="date" {...register("releaseDate")} />
            {errors.releaseDate && <p className="text-sm text-destructive mt-1">{errors.releaseDate.message}</p>}
        </div>
      </div>

      {/* Tags, Features, Themes Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tags */}
        <div className="space-y-2 p-4 border rounded-md">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
            <Input 
                id="currentTag" 
                value={currentTag} 
                onChange={(e) => setCurrentTag(e.target.value)} 
                placeholder="Add a tag"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddToArray('tags', currentTag, setCurrentTag);}}}
            />
            <Button type="button" size="icon" onClick={() => handleAddToArray('tags', currentTag, setCurrentTag)}><PlusCircle className="h-4 w-4"/></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
            {watchedTags.map(tag => (
                <span key={tag} className="flex items-center bg-muted px-2 py-1 rounded-md text-sm">
                {tag}
                <Button type="button" variant="ghost" size="icon" className="ml-1 h-5 w-5" onClick={() => handleRemoveFromArray('tags', tag)}>
                    <Trash2 className="h-3 w-3" />
                </Button>
                </span>
            ))}
            </div>
            {errors.tags && <p className="text-sm text-destructive mt-1">{errors.tags.message}</p>}
        </div>
        {/* Features */}
        <div className="space-y-2 p-4 border rounded-md">
            <Label htmlFor="features">Features</Label>
            <div className="flex gap-2">
            <Input 
                id="currentFeature" 
                value={currentFeature} 
                onChange={(e) => setCurrentFeature(e.target.value)} 
                placeholder="Add a feature"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddToArray('features', currentFeature, setCurrentFeature);}}}
            />
            <Button type="button" size="icon" onClick={() => handleAddToArray('features', currentFeature, setCurrentFeature)}><PlusCircle className="h-4 w-4"/></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
            {watchedFeatures.map(feature => (
                <span key={feature} className="flex items-center bg-muted px-2 py-1 rounded-md text-sm">
                {feature}
                <Button type="button" variant="ghost" size="icon" className="ml-1 h-5 w-5" onClick={() => handleRemoveFromArray('features', feature)}>
                    <Trash2 className="h-3 w-3" />
                </Button>
                </span>
            ))}
            </div>
            {errors.features && <p className="text-sm text-destructive mt-1">{errors.features.message}</p>}
        </div>
        {/* Themes */}
        <div className="space-y-2 p-4 border rounded-md">
            <Label htmlFor="themes">Themes</Label>
            <div className="flex gap-2">
            <Input 
                id="currentTheme" 
                value={currentTheme} 
                onChange={(e) => setCurrentTheme(e.target.value)} 
                placeholder="Add a theme"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddToArray('themes', currentTheme, setCurrentTheme);}}}
            />
            <Button type="button" size="icon" onClick={() => handleAddToArray('themes', currentTheme, setCurrentTheme)}><PlusCircle className="h-4 w-4"/></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
            {watchedThemes.map(theme => (
                <span key={theme} className="flex items-center bg-muted px-2 py-1 rounded-md text-sm">
                {theme}
                <Button type="button" variant="ghost" size="icon" className="ml-1 h-5 w-5" onClick={() => handleRemoveFromArray('themes', theme)}>
                    <Trash2 className="h-3 w-3" />
                </Button>
                </span>
            ))}
            </div>
            {errors.themes && <p className="text-sm text-destructive mt-1">{errors.themes.message}</p>}
        </div>
      </div>
      
      {/* Boolean Flags Section */}
      <div className="space-y-4 p-4 border rounded-md">
        <h3 className="text-lg font-semibold">Flags</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {([
            {name: 'is_featured', label: 'Featured'},
            {name: 'isNew', label: 'New Game'},
            {name: 'isPopular', label: 'Popular'},
            {name: 'show_home', label: 'Show on Home'},
            {name: 'only_demo', label: 'Demo Only'},
            {name: 'only_real', label: 'Real Play Only'},
          ] as {name: keyof GameFormValues, label: string}[]).map(flag => (
            <div key={flag.name} className="flex items-center space-x-2">
              <Controller
                name={flag.name as any} // Temp any due to complexity of Controller with boolean
                control={control}
                render={({ field }) => (
                    <Checkbox
                        id={flag.name}
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                    />
                )}
              />
              <Label htmlFor={flag.name}>{flag.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {game && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(String(game.id))} // Ensure game.id is string
            disabled={isDeleting || isSubmitting}
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete Game
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isDeleting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {game ? 'Save Changes' : 'Create Game'}
        </Button>
      </div>
    </form>
  );
};

export default GameForm;

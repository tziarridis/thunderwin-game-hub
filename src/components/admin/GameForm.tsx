import React, { useEffect, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Game, DbGame, GameStatusEnum, GameVolatilityEnum, AllGameStatuses, AllGameVolatilities, GameStatus, GameVolatility, GameTag } from '@/types/game'; // GameTag might need to be string if that's what your form handles
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon, PlusCircleIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Zod schema for form validation
const gameFormSchema = z.object({
  game_id: z.string().optional().nullable(), // External game ID from provider
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  provider_slug: z.string().min(1, "Provider slug is required"),
  provider_id: z.string().optional().nullable(), // Added provider_id
  category_slugs: z.array(z.string()).min(1, "At least one category is required"),
  rtp: z.number().min(0).max(100).optional().nullable(),
  image: z.string().url("Must be a valid URL").optional().nullable(), // Cover image
  bannerUrl: z.string().url("Must be a valid URL").optional().nullable(), // Banner image
  description: z.string().optional().nullable(),
  status: z.nativeEnum(GameStatusEnum).default(GameStatusEnum.DRAFT),
  volatility: z.nativeEnum(GameVolatilityEnum).optional().nullable(),
  lines: z.number().int().positive().optional().nullable(),
  min_bet: z.number().positive().optional().nullable(),
  max_bet: z.number().positive().optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(), // Assuming tags are strings for simplicity in form
  themes: z.array(z.string()).optional().nullable(),
  is_popular: z.boolean().default(false).optional(),
  is_new: z.boolean().default(false).optional(),
  is_featured: z.boolean().default(false).optional(),
  show_home: z.boolean().default(false).optional(),
  release_date: z.string().optional().nullable(), // Consider using a date picker
  has_freespins: z.boolean().default(false).optional(),
  has_jackpot: z.boolean().default(false).optional(), // This field is in the schema, but not in DbGame by default
  game_code: z.string().optional().nullable(), // Alternative game identifier
  only_demo: z.boolean().default(false).optional(),
  only_real: z.boolean().default(false).optional(),
  mobile_friendly: z.boolean().default(true).optional(),
});

type GameFormData = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  game?: Partial<DbGame> | Partial<Game> | null; // Accept DbGame or Game for editing
  onSubmit: (values: Partial<DbGame>) => void; // Submit DbGame compatible structure
  onCancel?: () => void;
  providers: { slug: string; name: string; id?: string | number }[]; // provider can have id
  categories: { slug: string; name: string }[];
  isLoading?: boolean;
}

// Helper to map various game type inputs to a consistent GameFormData structure
const mapGameToFormDefaults = (game?: Partial<DbGame> | Partial<Game> | null): GameFormData => {
  const defaults: GameFormData = {
    game_id: game?.game_id || '',
    title: game?.title || (game as DbGame)?.game_name || '',
    slug: game?.slug || '',
    provider_slug: game?.provider_slug || (game as DbGame)?.distribution || '',
    provider_id: (game as Game)?.provider_id || (game as DbGame)?.provider_id || undefined,
    category_slugs: game?.category_slugs || [],
    rtp: typeof game?.rtp === 'string' ? parseFloat(game.rtp) : (typeof game?.rtp === 'number' ? game.rtp : undefined),
    image: (game as Game)?.image || (game as DbGame)?.cover || (game as DbGame)?.image_url || '',
    bannerUrl: (game as Game)?.bannerUrl || (game as DbGame)?.banner_url || '',
    description: game?.description || '',
    status: game?.status ? (game.status as GameStatusEnum) : GameStatusEnum.DRAFT,
    volatility: game?.volatility ? (game.volatility as GameVolatilityEnum) : null,
    lines: typeof game?.lines === 'number' ? game.lines : undefined,
    min_bet: typeof game?.min_bet === 'number' ? game.min_bet : undefined,
    max_bet: typeof game?.max_bet === 'number' ? game.max_bet : undefined,
    features: Array.isArray(game?.features) ? game.features.map(String) : [],
    tags: Array.isArray(game?.tags) ? game.tags.map(t => typeof t === 'string' ? t : (t as GameTag).name) : [],
    themes: Array.isArray(game?.themes) ? game.themes.map(String) : [],
    is_popular: (game as Game)?.is_popular ?? (game as DbGame)?.is_popular ?? false,
    is_new: (game as Game)?.is_new ?? (game as DbGame)?.is_new ?? false,
    is_featured: game?.is_featured || false,
    show_home: game?.show_home || false,
    release_date: game?.release_date ? new Date(game.release_date).toISOString().split('T')[0] : '',
    has_freespins: game?.has_freespins || false,
    has_jackpot: (game as Game)?.has_jackpot || false,
    game_code: game?.game_code || '',
    only_demo: game?.only_demo || false,
    only_real: (game as Game)?.only_real || (game as DbGame)?.only_real || false,
    mobile_friendly: (game as Game)?.mobile_friendly ?? (game as DbGame)?.is_mobile ?? true,
  };
  return defaults;
};


const GameForm: React.FC<GameFormProps> = ({ game, onSubmit: handleFormSubmit, onCancel, providers, categories, isLoading }) => {
  const queryClient = useQueryClient();
  
  const defaultValues = mapGameToFormDefaults(game);

  const [currentFeatures, setCurrentFeatures] = useState<string[]>(defaultValues.features || []);
  const [featureInput, setFeatureInput] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>(defaultValues.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [currentThemes, setCurrentThemes] = useState<string[]>(defaultValues.themes || []);
  const [themeInput, setThemeInput] = useState('');


  const form = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    const newDefaults = mapGameToFormDefaults(game);
    form.reset(newDefaults);
    setCurrentFeatures(newDefaults.features || []);
    setCurrentTags(newDefaults.tags || []);
    setCurrentThemes(newDefaults.themes || []);
  }, [game, form]);

  const handleAddItem = (
    itemInput: string,
    setItemInput: React.Dispatch<React.SetStateAction<string>>,
    currentItems: string[],
    setCurrentItems: React.Dispatch<React.SetStateAction<string[]>>,
    fieldName: keyof Pick<GameFormData, 'features' | 'tags' | 'themes'>
  ) => {
    if (itemInput.trim() && !currentItems.includes(itemInput.trim())) {
      const updatedItems = [...currentItems, itemInput.trim()];
      setCurrentItems(updatedItems);
      form.setValue(fieldName, updatedItems as any); // Type assertion needed due to generic fieldName
      setItemInput('');
    }
  };

  const handleRemoveItem = (
    itemToRemove: string,
    currentItems: string[],
    setCurrentItems: React.Dispatch<React.SetStateAction<string[]>>,
    fieldName: keyof Pick<GameFormData, 'features' | 'tags' | 'themes'>
  ) => {
    const updatedItems = currentItems.filter(item => item !== itemToRemove);
    setCurrentItems(updatedItems);
    form.setValue(fieldName, updatedItems as any); // Type assertion
  };


  const onSubmit: SubmitHandler<GameFormData> = async (data) => {
    // Map form data to DbGame structure before submitting
    const dbGameData: Partial<DbGame> = {
        id: game?.id ? String(game.id) : undefined, // Include ID if editing
        game_id: data.game_id || null,
        title: data.title,
        game_name: data.title, // Ensure game_name is also populated
        slug: data.slug,
        provider_slug: data.provider_slug,
        provider_id: data.provider_id || providers.find(p => p.slug === data.provider_slug)?.id as string || null,
        category_slugs: data.category_slugs,
        rtp: data.rtp,
        image_url: data.image || null, // map image to image_url
        cover: data.image || null, // also map to cover
        banner_url: data.bannerUrl || null,
        description: data.description || null,
        status: data.status,
        volatility: data.volatility,
        lines: data.lines,
        min_bet: data.min_bet,
        max_bet: data.max_bet,
        features: data.features || [],
        tags: data.tags || [],
        themes: data.themes || [],
        is_popular: data.is_popular,
        is_new: data.is_new,
        is_featured: data.is_featured,
        show_home: data.show_home,
        release_date: data.release_date ? new Date(data.release_date).toISOString() : null,
        has_freespins: data.has_freespins,
        // 'has_jackpot' is not in DbGame, so we omit it or handle it based on actual schema
        game_code: data.game_code || null,
        only_demo: data.only_demo,
        only_real: data.only_real,
        is_mobile: data.mobile_friendly, // Map mobile_friendly to is_mobile for DbGame
        distribution: data.provider_slug, // Ensure distribution is set
    };

    // Remove undefined properties before submitting
    Object.keys(dbGameData).forEach(key => {
        const k = key as keyof DbGame;
        if (dbGameData[k] === undefined) {
        delete dbGameData[k];
        }
    });
    
    handleFormSubmit(dbGameData);
  };
// ... keep existing code (JSX for the form)
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="Game Title" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl><Input placeholder="game-slug" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="game_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External Game ID (Optional)</FormLabel>
                    <FormControl><Input placeholder="Provider's Game ID" {...field} value={field.value || ''} /></FormControl>
                    <FormDescription>ID from the game provider, if any.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="game_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Game Code (Optional)</FormLabel>
                    <FormControl><Input placeholder="Internal unique code" {...field} value={field.value || ''} /></FormControl>
                     <FormDescription>Alternative unique identifier if needed.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Provider & Category */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Provider & Category</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="provider_slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedProvider = providers.find(p => p.slug === value);
                        form.setValue('provider_id', selectedProvider?.id ? String(selectedProvider.id) : null);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {providers.map(p => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="provider_id"
                render={({ field }) => (
                  <FormItem className="hidden"> {/* Hidden field, managed by provider_slug selection */}
                    <FormControl><Input {...field} value={field.value || ''} readOnly /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category_slugs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <Controller
                        control={form.control}
                        name="category_slugs"
                        render={({ field: controllerField }) => (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                            {categories.map(cat => (
                                <FormItem key={cat.slug} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                    checked={controllerField.value?.includes(cat.slug)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? controllerField.onChange([...(controllerField.value || []), cat.slug])
                                        : controllerField.onChange(
                                            (controllerField.value || []).filter(
                                            (value) => value !== cat.slug
                                            )
                                        );
                                    }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">{cat.name}</FormLabel>
                                </FormItem>
                            ))}
                            </div>
                        )}
                        />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Status & Details */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Status & Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {AllGameStatuses.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="release_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Date (Optional)</FormLabel>
                    <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Game description..." {...field} value={field.value || ''} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Visuals */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Visuals</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://example.com/image.png" {...field} value={field.value || ''} /></FormControl>
                    {field.value && <img src={field.value} alt="Cover preview" className="mt-2 h-24 w-auto object-contain rounded"/>}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bannerUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image URL (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://example.com/banner.png" {...field} value={field.value || ''} /></FormControl>
                    {field.value && <img src={field.value} alt="Banner preview" className="mt-2 h-24 w-auto object-contain rounded"/>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Gameplay Attributes */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Gameplay Attributes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <FormField
                control={form.control}
                name="rtp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RTP (%) (Optional)</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="96.5" {...field} 
                    onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}  value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="volatility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volatility (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined} defaultValue={field.value || undefined}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select volatility" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">Clear selection</SelectItem>
                        {AllGameVolatilities.map(v => <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lines"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paylines (Optional)</FormLabel>
                    <FormControl><Input type="number" placeholder="20" {...field} 
                    onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))} value={field.value ?? ''}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="min_bet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Bet (Optional)</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="0.10" {...field} 
                    onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_bet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Bet (Optional)</FormLabel>
                    <FormControl><Input type="number" step="1" placeholder="100" {...field} 
                    onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Features, Tags, Themes */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Features, Tags & Themes</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <FormItem>
                <FormLabel>Features (Optional)</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add feature (e.g., Free Spins)"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem(featureInput, setFeatureInput, currentFeatures, setCurrentFeatures, 'features');}}}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => handleAddItem(featureInput, setFeatureInput, currentFeatures, setCurrentFeatures, 'features')}><PlusCircleIcon className="h-4 w-4"/></Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {currentFeatures.map(feature => (
                    <Badge key={feature} variant="secondary" className="flex items-center">
                      {feature}
                      <Button type="button" variant="ghost" size="icon" className="ml-1 h-4 w-4" onClick={() => handleRemoveItem(feature, currentFeatures, setCurrentFeatures, 'features')}>
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <FormMessage>{form.formState.errors.features?.message}</FormMessage>
              </FormItem>

              {/* Tags */}
              <FormItem>
                <FormLabel>Tags (Optional)</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag (e.g., Popular)"
                     onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem(tagInput, setTagInput, currentTags, setCurrentTags, 'tags');}}}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => handleAddItem(tagInput, setTagInput, currentTags, setCurrentTags, 'tags')}><PlusCircleIcon className="h-4 w-4"/></Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {currentTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center">
                      {tag}
                       <Button type="button" variant="ghost" size="icon" className="ml-1 h-4 w-4" onClick={() => handleRemoveItem(tag, currentTags, setCurrentTags, 'tags')}>
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                 <FormMessage>{form.formState.errors.tags?.message}</FormMessage>
              </FormItem>

              {/* Themes */}
              <FormItem>
                <FormLabel>Themes (Optional)</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={themeInput}
                    onChange={(e) => setThemeInput(e.target.value)}
                    placeholder="Add theme (e.g., Adventure)"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem(themeInput, setThemeInput, currentThemes, setCurrentThemes, 'themes');}}}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => handleAddItem(themeInput, setThemeInput, currentThemes, setCurrentThemes, 'themes')}><PlusCircleIcon className="h-4 w-4"/></Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {currentThemes.map(theme => (
                    <Badge key={theme} variant="secondary" className="flex items-center">
                      {theme}
                      <Button type="button" variant="ghost" size="icon" className="ml-1 h-4 w-4" onClick={() => handleRemoveItem(theme, currentThemes, setCurrentThemes, 'themes')}>
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <FormMessage>{form.formState.errors.themes?.message}</FormMessage>
              </FormItem>
            </CardContent>
          </Card>
          
          {/* Boolean Flags */}
          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>Flags & Visibility</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { name: "is_popular", label: "Popular" },
                { name: "is_new", label: "New" },
                { name: "is_featured", label: "Featured" },
                { name: "show_home", label: "Show on Home Page" },
                { name: "has_freespins", label: "Has Freespins" },
                { name: "has_jackpot", label: "Has Jackpot" },
                { name: "only_demo", label: "Demo Only" },
                { name: "only_real", label: "Real Play Only" },
                { name: "mobile_friendly", label: "Mobile Friendly" },
              ].map(flag => (
                <FormField
                  key={flag.name}
                  control={form.control}
                  name={flag.name as keyof GameFormData}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean | undefined}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{flag.label}</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" disabled={isLoading || (form.formState.isSubmitted && !form.formState.isValid)}>
            {isLoading ? (game?.id ? 'Updating...' : 'Creating...') : (game?.id ? 'Save Changes' : 'Create Game')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GameForm;

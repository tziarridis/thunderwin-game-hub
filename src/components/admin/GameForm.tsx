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
import { Game, DbGame, GameStatusEnum, GameVolatilityEnum, AllGameStatuses, AllGameVolatilities, GameStatus, GameVolatility, GameTag } from '@/types/game';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon, PlusCircleIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Zod schema for form validation
const gameFormSchema = z.object({
  game_id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  provider_slug: z.string().min(1, "Provider slug is required"),
  category_slugs: z.array(z.string()).min(1, "At least one category is required"),
  rtp: z.number().min(0).max(100).optional().nullable(),
  image: z.string().url("Must be a valid URL").optional().nullable(),
  bannerUrl: z.string().url("Must be a valid URL").optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(AllGameStatuses as [string, ...string[]]).default(GameStatusEnum.DRAFT),
  volatility: z.enum(AllGameVolatilities as [string, ...string[]]).optional().nullable(),
  lines: z.number().int().positive().optional().nullable(),
  min_bet: z.number().positive().optional().nullable(),
  max_bet: z.number().positive().optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  themes: z.array(z.string()).optional().nullable(),
  is_popular: z.boolean().default(false).optional(),
  is_new: z.boolean().default(false).optional(),
  is_featured: z.boolean().default(false).optional(),
  show_home: z.boolean().default(false).optional(),
  release_date: z.string().optional().nullable(),
  has_freespins: z.boolean().default(false).optional(),
  has_jackpot: z.boolean().default(false).optional(),
  game_code: z.string().optional().nullable(),
});

type GameFormData = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  game?: DbGame | Game | null;
  onSubmitSuccess?: (savedGame: DbGame) => void;
  onCancel?: () => void;
  providers: { slug: string; name: string }[];
  categories: { slug: string; name: string }[];
}

const mapStringToGameStatusEnum = (statusStr?: GameStatus | string | null): GameStatusEnum => {
  if (statusStr && Object.values(GameStatusEnum).includes(statusStr as GameStatusEnum)) {
    return statusStr as GameStatusEnum;
  }
  return GameStatusEnum.DRAFT;
};

const mapStringToGameVolatilityEnum = (volatilityStr?: GameVolatility | string | null): GameVolatilityEnum | null => {
  if (volatilityStr && Object.values(GameVolatilityEnum).includes(volatilityStr as GameVolatilityEnum)) {
    return volatilityStr as GameVolatilityEnum;
  }
  return null;
};

const mapTagsToStringArray = (tags?: string[] | GameTag[] | null): string[] => {
  if (!tags) return [];
  return tags.map(tag => (typeof tag === 'string' ? tag : tag.name));
};

const GameForm: React.FC<GameFormProps> = ({ game, onSubmitSuccess, onCancel, providers, categories }) => {
  const queryClient = useQueryClient();
  
  const initialFeatures = game?.features ? mapTagsToStringArray(game.features) : [];
  const initialTags = game?.tags ? mapTagsToStringArray(game.tags) : [];
  const initialThemes = game?.themes ? mapTagsToStringArray(game.themes) : [];

  const [currentFeatures, setCurrentFeatures] = useState<string[]>(initialFeatures);
  const [featureInput, setFeatureInput] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [currentThemes, setCurrentThemes] = useState<string[]>(initialThemes);
  const [themeInput, setThemeInput] = useState('');

  const form = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      game_id: game?.game_id || '',
      title: game?.title || game?.game_name || '',
      slug: game?.slug || '',
      provider_slug: game?.provider_slug || (game as DbGame)?.providers?.slug || '',
      category_slugs: game?.category_slugs || [],
      rtp: typeof game?.rtp === 'string' ? parseFloat(game.rtp) : (typeof game?.rtp === 'number' ? game.rtp : undefined),
      image: game?.cover || game?.image_url || '',
      bannerUrl: game?.banner || game?.banner_url || '',
      description: game?.description || '',
      status: game ? mapStringToGameStatusEnum(game.status) : GameStatusEnum.DRAFT,
      volatility: game ? mapStringToGameVolatilityEnum(game.volatility) : null,
      lines: typeof game?.lines === 'number' ? game.lines : undefined,
      min_bet: typeof game?.min_bet === 'number' ? game.min_bet : undefined,
      max_bet: typeof game?.max_bet === 'number' ? game.max_bet : undefined,
      features: initialFeatures,
      tags: initialTags,
      themes: initialThemes,
      is_popular: game?.is_popular || false,
      is_new: game?.is_new || false,
      is_featured: game?.is_featured || false,
      show_home: game?.show_home || false,
      release_date: game?.release_date ? new Date(game.release_date).toISOString().split('T')[0] : '',
      has_freespins: game?.has_freespins || false,
      has_jackpot: (game as Game)?.has_jackpot || false,
      game_code: game?.game_code || '',
    },
  });

  useEffect(() => {
    if (game) {
      const gameFeatures = game.features ? mapTagsToStringArray(game.features) : [];
      const gameTags = game.tags ? mapTagsToStringArray(game.tags) : [];
      const gameThemes = game.themes ? mapTagsToStringArray(game.themes) : [];
      
      form.reset({
        game_id: game.game_id || '',
        title: game.title || game.game_name || '',
        slug: game.slug || '',
        provider_slug: game.provider_slug || (game as DbGame).providers?.slug || '',
        category_slugs: game.category_slugs || [],
        rtp: typeof game.rtp === 'string' ? parseFloat(game.rtp) : (typeof game.rtp === 'number' ? game.rtp : undefined),
        image: game.cover || game.image_url || '',
        bannerUrl: game.banner || game.banner_url || '',
        description: game.description || '',
        status: mapStringToGameStatusEnum(game.status),
        volatility: mapStringToGameVolatilityEnum(game.volatility),
        lines: typeof game.lines === 'number' ? game.lines : undefined,
        min_bet: typeof game.min_bet === 'number' ? game.min_bet : undefined,
        max_bet: typeof game.max_bet === 'number' ? game.max_bet : undefined,
        features: gameFeatures,
        tags: gameTags,
        themes: gameThemes,
        is_popular: game.is_popular || false,
        is_new: game.is_new || false,
        is_featured: game.is_featured || false,
        show_home: game.show_home || false,
        release_date: game.release_date ? new Date(game.release_date).toISOString().split('T')[0] : '',
        has_freespins: game.has_freespins || false,
        has_jackpot: (game as Game).has_jackpot || false, // Safely access
        game_code: game.game_code || '',
      });
      setCurrentFeatures(gameFeatures);
      setCurrentTags(gameTags);
      setCurrentThemes(gameThemes);
    }
  }, [game, form]);

  const handleAddItem = (
    itemInput: string,
    setItemInput: React.Dispatch<React.SetStateAction<string>>,
    currentItems: string[],
    setCurrentItems: React.Dispatch<React.SetStateAction<string[]>>,
    fieldName: keyof GameFormData // This should be 'features', 'tags', or 'themes' which are string[]
  ) => {
    if (itemInput.trim() && !currentItems.includes(itemInput.trim())) {
      const updatedItems = [...currentItems, itemInput.trim()];
      setCurrentItems(updatedItems);
      form.setValue(fieldName, updatedItems);
      setItemInput('');
    }
  };

  const handleRemoveItem = (
    itemToRemove: string,
    currentItems: string[],
    setCurrentItems: React.Dispatch<React.SetStateAction<string[]>>,
    fieldName: keyof GameFormData // This should be 'features', 'tags', or 'themes' which are string[]
  ) => {
    const updatedItems = currentItems.filter(item => item !== itemToRemove);
    setCurrentItems(updatedItems);
    form.setValue(fieldName, updatedItems);
  };


  const onSubmit: SubmitHandler<GameFormData> = async (data) => {
    try {
      // We need to ensure types are correct for the database
      const gameDataToSave: any = {
        // id: game?.id, // ID is used for update condition, not in data object itself for insert/update typically unless part of the type
        game_id: data.game_id || null,
        game_name: data.title, 
        title: data.title,
        slug: data.slug,
        provider_slug: data.provider_slug,
        category_slugs: data.category_slugs,
        rtp: data.rtp !== null ? data.rtp : null, // Ensure numeric type
        cover: data.image || null,
        image_url: data.image || null,
        banner: data.bannerUrl || null,
        banner_url: data.bannerUrl || null,
        description: data.description || null,
        status: data.status as string,
        volatility: data.volatility as string || null,
        lines: data.lines !== null ? data.lines : null,
        min_bet: data.min_bet !== null ? data.min_bet : null,
        max_bet: data.max_bet !== null ? data.max_bet : null,
        features: data.features || [],
        tags: data.tags || [],
        themes: data.themes || [],
        is_popular: data.is_popular || false,
        is_new: data.is_new || false,
        is_featured: data.is_featured || false,
        show_home: data.show_home || false,
        release_date: data.release_date ? new Date(data.release_date).toISOString() : null,
        has_freespins: data.has_freespins || false,
        game_code: data.game_code || null,
        distribution: game?.distribution || 'internal', // Provide a default value
      };

      let savedGame: DbGame;
      if (game?.id) {
        const { data: updatedGame, error } = await supabase.from('games').update(gameDataToSave).eq('id', game.id as string).select().single();
        if (error) throw error;
        savedGame = updatedGame as DbGame;
        toast.success('Game updated successfully!');
      } else {
        const { data: newGame, error } = await supabase.from('games').insert(gameDataToSave).select().single();
        if (error) throw error;
        savedGame = newGame as DbGame;
        toast.success('Game created successfully!');
      }
      
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      queryClient.invalidateQueries({ queryKey: ['allGames'] }); // Ensure this key is used elsewhere
      if (onSubmitSuccess) {
        onSubmitSuccess(savedGame);
      }
      form.reset(); 
      setCurrentFeatures([]);
      setCurrentTags([]);
      setCurrentThemes([]);

    } catch (error: any) {
      console.error("Error saving game:", error);
      toast.error(`Failed to save game: ${error.message || 'Unknown error'}`);
    }
  };

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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                name="category_slugs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <Controller
                        control={form.control}
                        name="category_slugs"
                        render={({ field: controllerField }) => (
                            <div className="space-y-2">
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
                    <FormControl><Textarea placeholder="Game description..." {...field} value={field.value || ''} /></FormControl>
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
                <div className="mt-2 flex flex-wrap gap-2">
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
                <div className="mt-2 flex flex-wrap gap-2">
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
                <div className="mt-2 flex flex-wrap gap-2">
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
                { name: "has_jackpot", label: "Has Jackpot" }, // Still in form for UI if Game type is used
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
          <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid && form.formState.isSubmitted}>
            {form.formState.isSubmitting ? (game?.id ? 'Updating...' : 'Creating...') : (game?.id ? 'Save Changes' : 'Create Game')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GameForm;

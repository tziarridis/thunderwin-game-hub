import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Game, GameCategory, GameProvider, GameStatusEnum, GameVolatilityEnum, AllGameStatuses, AllGameVolatilities, DbGame } from '@/types/game';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { mapDbGameToGameAdapter, mapGameToDbGameAdapter } from './GameAdapter';

// Define the schema outside the component to avoid regeneration
const gameFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  slug: z.string().optional().refine(val => !val || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val), {
    message: "Slug must be lowercase alphanumeric with hyphens.",
  }),
  game_id: z.string().optional(),
  provider_slug: z.string().min(1, "Provider is required."),
  category_slugs: z.array(z.string()).min(1, "At least one category is required."),
  description: z.string().optional(),
  rtp: z.coerce.number().min(0).max(100).optional().nullable(),
  volatility: z.enum(AllGameVolatilities).optional().nullable(), // Use z.enum with the array
  status: z.enum(AllGameStatuses).default(GameStatusEnum.ACTIVE), // Use z.enum with the array
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
  features: z.string().optional().transform(val => val ? val.split(',').map(feat => feat.trim()).filter(feat => feat) : []),
  themes: z.string().optional().transform(val => val ? val.split(',').map(theme => theme.trim()).filter(theme => theme) : []),
  image_url: z.string().url("Must be a valid URL.").optional().nullable(),
  cover: z.string().url("Must be a valid URL.").optional().nullable(),
  banner_url: z.string().url("Must be a valid URL.").optional().nullable(),
  is_featured: z.boolean().default(false),
  is_popular: z.boolean().default(false),
  is_new: z.boolean().default(false),
  show_home: z.boolean().default(false),
  only_demo: z.boolean().default(false),
  only_real: z.boolean().default(false),
  release_date: z.string().optional().nullable(), // Consider z.date() if using a date picker
  // Meta fields for demo/real URLs
  meta_demo_url: z.string().url("Must be a valid URL for demo.").optional().nullable(),
  meta_real_url: z.string().url("Must be a valid URL for real play.").optional().nullable(),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  game?: Game | DbGame; // Accept either full Game or DbGame for editing
  onSave: (game: DbGame) => void;
  onCancel: () => void;
}

const GameForm: React.FC<GameFormProps> = ({ game: initialGameData, onSave, onCancel }) => {
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      // Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('game_categories')
        .select('id, name, slug')
        .eq('status', 'active');
      if (catError) toast.error("Failed to load categories: " + catError.message);
      else setCategories(catData || []);

      try {
        // Fetch providers - use explicit type casting to fix the column issue
        const { data: provData, error: provError } = await supabase
          .from('providers')
          .select('id, name')
          .eq('status', 'active');
        
        if (provError) {
          toast.error("Failed to load providers: " + provError.message);
        } else {
          // Convert to GameProvider[]
          const mappedProviders = (provData || []).map(p => ({
            id: p.id,
            name: p.name,
            slug: p.name.toLowerCase().replace(/\s+/g, '-'), // Generate slug from name
          }));
          setProviders(mappedProviders);
        }
      } catch (err) {
        console.error("Error fetching providers:", err);
        toast.error("Failed to load providers data");
      }
    };
    fetchDropdownData();
  }, []);

  // Convert initialGameData (Game or DbGame) to GameFormValues
  const defaultValues = React.useMemo<GameFormValues>(() => {
    if (!initialGameData) {
      return {
        title: '',
        slug: '',
        game_id: '',
        provider_slug: '',
        category_slugs: [],
        description: '',
        rtp: undefined,
        volatility: undefined,
        status: GameStatusEnum.ACTIVE,
        tags: '',
        features: '',
        themes: '',
        image_url: '',
        cover: '',
        banner_url: '',
        is_featured: false,
        is_popular: false,
        is_new: false,
        show_home: false,
        only_demo: false,
        only_real: false,
        release_date: '',
        meta_demo_url: '',
        meta_real_url: '',
      };
    }

    // If initialGameData is Game, convert to DbGame-like structure for form
    // Or, if it's already DbGame, use it.
    // The key is to map to GameFormValues
    const gameForForm = 'providerName' in initialGameData ? mapGameToDbGameAdapter(initialGameData as Game) : initialGameData as DbGame;

    return {
      title: gameForForm.title || '',
      slug: gameForForm.slug || '',
      game_id: gameForForm.game_id || '',
      provider_slug: gameForForm.provider_slug || (gameForForm.game_providers as any)?.slug || '',
      category_slugs: gameForForm.category_slugs || [],
      description: gameForForm.description || '',
      rtp: gameForForm.rtp ?? undefined,
      volatility: gameForForm.volatility as GameVolatilityEnum || undefined,
      status: gameForForm.status || GameStatusEnum.ACTIVE,
      tags: Array.isArray(gameForForm.tags) ? gameForForm.tags.join(', ') : (gameForForm.tags || ''),
      features: Array.isArray(gameForForm.features) ? gameForForm.features.join(', ') : (gameForForm.features || ''),
      themes: Array.isArray(gameForForm.themes) ? gameForForm.themes.join(', ') : (gameForForm.themes || ''),
      image_url: gameForForm.image_url || '',
      cover: gameForForm.cover || '',
      banner_url: gameForForm.banner_url || '',
      is_featured: gameForForm.is_featured || false,
      is_popular: gameForForm.is_popular || false,
      is_new: gameForForm.is_new || false,
      show_home: gameForForm.show_home || false,
      only_demo: gameForForm.only_demo || false,
      only_real: gameForForm.only_real || false,
      release_date: gameForForm.release_date || '',
      // Assuming meta URLs are stored in a way that can be retrieved for the form
      // This part needs to align with how 'meta' is structured if initialGameData is Game
      meta_demo_url: (initialGameData as Game).meta?.find(m => m.key === 'demo_url')?.value || (gameForForm as any).meta_demo_url || '',
      meta_real_url: (initialGameData as Game).meta?.find(m => m.key === 'real_url')?.value || (gameForForm as any).meta_real_url || '',
    };
  }, [initialGameData]);

  const form = useForm<z.infer<typeof gameFormSchema>>({
    resolver: zodResolver(gameFormSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues); // Reset form when initialGameData changes
  }, [defaultValues, form]);

  const onSubmit = (data: GameFormValues) => {
    console.log("Form data submitted:", data);
    
    // Construct DbGame object from form data
    const dbGameData: Partial<DbGame> = {
      ...data,
      rtp: data.rtp ?? null, // Ensure null if undefined
      volatility: data.volatility ?? null,
      // Convert comma-separated strings back to arrays for these fields if your DB expects arrays
      // The Zod transform already does this: data.tags, data.features, data.themes are string[]
      tags: data.tags as string[], 
      features: data.features as string[],
      themes: data.themes as string[],
      // If your DB stores meta as JSON or separate columns, adjust here
      // For now, assuming direct mapping for other fields.
      // Need to handle meta_demo_url and meta_real_url to store them appropriately in DbGame
      // e.g., if DbGame has meta property as JSON
    };
    
    // Add meta properties if they exist and need to be stored in a specific way
    // This is a placeholder, actual storage of meta_demo_url and meta_real_url depends on DbGame structure.
    // if (data.meta_demo_url || data.meta_real_url) {
    //   (dbGameData as any).meta_properties = { // Or however you store this
    //     demo_url: data.meta_demo_url,
    //     real_url: data.meta_real_url,
    //   };
    // }


    if (initialGameData?.id) {
      dbGameData.id = initialGameData.id;
    }

    onSave(dbGameData as DbGame);
  };

  // ... keep existing code (JSX for the form)
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter game title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="auto-generated or enter custom slug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Provider and Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="provider_slug"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Provider</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {providers.map(p => (
                        <SelectItem key={p.id?.toString() || p.slug} value={p.slug}>{p.name}</SelectItem>
                    ))}
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
                                <Select
                                    onValueChange={(value) => controllerField.onChange([value])} // Simplified: sets as array with one item
                                    defaultValue={controllerField.value?.[0]} // Simplified: takes first item
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select categories" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map(c => (
                                            <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <FormDescription>Select one or more categories (Multi-select UI needed for better UX)</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>


        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Game description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="rtp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RTP (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 96.5" {...field} onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="volatility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volatility</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select volatility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Not Specified</SelectItem>
                    {AllGameVolatilities.map(vol => (
                      <SelectItem key={vol} value={vol}>{vol.charAt(0).toUpperCase() + vol.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AllGameStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image URLs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cover"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/cover.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="banner_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/banner.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tags, Features, Themes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., popular, new, exclusive" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Features (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., wilds, bonus rounds, free spins" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="themes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Themes (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., adventure, fantasy, sports" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormLabel className="font-normal">Featured</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_popular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormLabel className="font-normal">Popular</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_new"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormLabel className="font-normal">New</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="show_home"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormLabel className="font-normal">Show Home</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="only_demo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormLabel className="font-normal">Demo Only</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="only_real"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormLabel className="font-normal">Real Only</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Game Launch URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="meta_demo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Demo Launch URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/demo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meta_real_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Real Money Launch URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/real" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Release Date */}
        <FormField
          control={form.control}
          name="release_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Release Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit & Cancel Buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialGameData ? 'Update Game' : 'Add Game'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GameForm;

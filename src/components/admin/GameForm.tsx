
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label'; // Label is part of FormLabel
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { Game, DbGame } from '@/types'; // Ensure correct types are imported

interface GameFormProps {
  game?: Game | DbGame | null; // Allow for new or existing game
  onSubmit: (data: Partial<Game> | Partial<DbGame>) => void; // Use Partial for broader compatibility
  onCancel: () => void;
  isLoading?: boolean;
}

// Define a schema that can accommodate both Game and DbGame, making fields optional
const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  provider_slug: z.string().min(1, { message: "Provider slug is required." }), // Assuming provider_slug is preferred
  category_slugs: z.string().optional(), // Comma-separated string
  image_url: z.string().url({ message: "Invalid URL." }).optional().or(z.literal('')),
  cover: z.string().url({ message: "Invalid URL." }).optional().or(z.literal('')),
  banner: z.string().url({ message: "Invalid URL." }).optional().or(z.literal('')),
  description: z.string().optional(),
  rtp: z.string().regex(/^(\d*(\.\d*)?)$/, { message: "Invalid RTP. Must be a number." }).optional().or(z.literal('')),
  volatility: z.string().optional(),
  min_bet: z.string().regex(/^(\d*(\.\d*)?)$/, { message: "Invalid Min Bet. Must be a number." }).optional().or(z.literal('')),
  max_bet: z.string().regex(/^(\d*(\.\d*)?)$/, { message: "Invalid Max Bet. Must be a number." }).optional().or(z.literal('')),
  lines: z.string().regex(/^(\d*)$/, { message: "Invalid Lines. Must be an integer." }).optional().or(z.literal('')),
  features: z.string().optional(), // Comma-separated string
  themes: z.string().optional(), // Comma-separated string
  tags: z.string().optional(), // Comma-separated string
  status: z.string().optional(),
  slug: z.string().optional(),
  game_id: z.string().optional(), // External game ID
  game_code: z.string().optional(), // External game code
  provider_id: z.string().optional(), // Internal provider ID (UUID)
  is_new: z.boolean().optional(),
  is_popular: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  show_home: z.boolean().optional(),
  release_date: z.string().optional(), // Consider date validation if needed
});

type GameFormData = z.infer<typeof formSchema>;

const GameForm: React.FC<GameFormProps> = ({ game, onSubmit, onCancel, isLoading }) => {
  const form = useForm<GameFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      provider_slug: "",
      category_slugs: "",
      image_url: "",
      cover: "",
      banner: "",
      description: "",
      rtp: "",
      volatility: "",
      min_bet: "",
      max_bet: "",
      lines: "",
      features: "",
      themes: "",
      tags: "",
      status: "active",
      slug: "",
      game_id: "",
      game_code: "",
      provider_id: "",
      is_new: false,
      is_popular: false,
      is_featured: false,
      show_home: false,
      release_date: "",
    },
  });

  const { reset, setValue, watch } = form; // Destructure methods from form

  useEffect(() => {
    if (game) {
      // Helper to safely get values, preferring Game type properties
      const getGameValue = (key: keyof Game, dbKey?: keyof DbGame, defaultValue: any = '') => {
        if (key in game) return (game as any)[key] ?? defaultValue;
        if (dbKey && dbKey in game) return (game as any)[dbKey] ?? defaultValue;
        return defaultValue;
      };
      
      const categorySlugs = getGameValue('category_slugs', 'category_slugs', []);
      const features = getGameValue('features', 'features', []);
      const themes = getGameValue('themes', 'themes', []); // themes might only be on Game
      const tags = getGameValue('tags', 'tags', []);

      reset({
        title: getGameValue('title', 'title'),
        provider_slug: getGameValue('provider_slug', 'provider_slug') || getGameValue('providerName', undefined) || getGameValue('provider', 'provider_slug'),
        category_slugs: Array.isArray(categorySlugs) ? categorySlugs.join(', ') : categorySlugs || getGameValue('categoryName', undefined) || '',
        image_url: getGameValue('image', 'image_url') || getGameValue('image_url', 'image_url'),
        cover: getGameValue('cover', 'cover'),
        banner: getGameValue('banner', 'banner'),
        description: getGameValue('description', 'description'),
        rtp: String(getGameValue('rtp', 'rtp', '')),
        volatility: getGameValue('volatility', 'volatility'),
        min_bet: String(getGameValue('minBet', 'min_bet', '')),
        max_bet: String(getGameValue('maxBet', 'max_bet', '')),
        lines: String(getGameValue('lines', 'lines', '')),
        features: Array.isArray(features) ? features.join(', ') : features,
        themes: Array.isArray(themes) ? themes.join(', ') : themes,
        tags: Array.isArray(tags) ? tags.join(', ') : tags,
        status: getGameValue('status', 'status', 'active'),
        slug: getGameValue('slug', 'slug'),
        game_id: getGameValue('game_id', 'game_id'),
        game_code: getGameValue('game_code', 'game_code'),
        provider_id: getGameValue('provider_id', 'provider_id'),
        is_new: !!getGameValue('isNew', 'is_new', false),
        is_popular: !!getGameValue('isPopular', 'is_popular', false),
        is_featured: !!getGameValue('is_featured', 'is_featured', false),
        show_home: !!getGameValue('show_home', 'show_home', false),
        release_date: getGameValue('release_date', 'release_date', '')?.split('T')[0] || '', // Format for date input
      });
    } else {
      reset(); // Reset to default values if no game is provided
    }
  }, [game, reset]);


  const handleFormSubmit = (data: GameFormData) => {
    const processedData: Partial<Game> | Partial<DbGame> = {
      ...data,
      rtp: data.rtp ? parseFloat(data.rtp) : undefined,
      min_bet: data.min_bet ? parseFloat(data.min_bet) : undefined,
      max_bet: data.max_bet ? parseFloat(data.max_bet) : undefined,
      lines: data.lines ? parseInt(data.lines) : undefined,
      features: data.features ? data.features.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      themes: data.themes ? data.themes.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      tags: data.tags ? data.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      category_slugs: data.category_slugs ? data.category_slugs.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    };
    // Remove empty strings which might cause issues with type conversion for numbers/urls
    Object.keys(processedData).forEach(key => {
        if ((processedData as any)[key] === '') {
            (processedData as any)[key] = undefined;
        }
    });
    onSubmit(processedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Game Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Provider Slug */}
           <FormField
            control={form.control}
            name="provider_slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Slug</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., pragmatic-play" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Category Slugs */}
          <FormField
            control={form.control}
            name="category_slugs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Slugs (comma-separated)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., slots,new" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Image URL */}
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Cover URL */}
          <FormField
            control={form.control}
            name="cover"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/cover.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Banner URL */}
          <FormField
            control={form.control}
            name="banner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/banner.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Game description..." {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* RTP */}
          <FormField
            control={form.control}
            name="rtp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RTP (%)</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="e.g., 96.5" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Volatility */}
          <FormField
            control={form.control}
            name="volatility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volatility</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select volatility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not Set</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="low-medium">Low-Medium</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="medium-high">Medium-High</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Min Bet */}
          <FormField
            control={form.control}
            name="min_bet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Bet</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="e.g., 0.10" {...field} value={field.value || ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Max Bet */}
          <FormField
            control={form.control}
            name="max_bet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Bet</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="e.g., 100" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Lines */}
          <FormField
            control={form.control}
            name="lines"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lines</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="e.g., 20" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           {/* Features (comma-separated) */}
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Features (comma-separated)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., free_spins,bonus_game" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Themes (comma-separated) */}
          <FormField
            control={form.control}
            name="themes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Themes (comma-separated)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., egypt,fantasy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Tags (comma-separated) */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (comma-separated)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., popular,new_release" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                   <Select onValueChange={field.onChange} value={field.value || 'active'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="demo_only">Demo Only</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="game-title-slug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Game ID (External) */}
          <FormField
            control={form.control}
            name="game_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External Game ID</FormLabel>
                <FormControl>
                  <Input placeholder="Provider's game ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Game Code (External) */}
          <FormField
            control={form.control}
            name="game_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External Game Code</FormLabel>
                <FormControl>
                  <Input placeholder="Provider's game code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Provider ID (Internal) */}
          <FormField
            control={form.control}
            name="provider_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Internal Provider ID (UUID)</FormLabel>
                <FormControl>
                  <Input placeholder="UUID of the provider in your DB" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Release Date */}
          <FormField
            control={form.control}
            name="release_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Release Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Boolean Flags */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <FormField
            control={form.control}
            name="is_new"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-1">
                <div className="space-y-0.5">
                  <FormLabel>Is New?</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_popular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-1">
                <div className="space-y-0.5">
                  <FormLabel>Is Popular?</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-1">
                <div className="space-y-0.5">
                  <FormLabel>Is Featured?</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="show_home"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-1">
                <div className="space-y-0.5">
                  <FormLabel>Show on Homepage?</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !form.formState.isValid}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {game ? 'Update Game' : 'Create Game'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GameForm;

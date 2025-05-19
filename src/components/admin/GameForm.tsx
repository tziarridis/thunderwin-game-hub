import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Game, DbGame, GameProvider, GameCategory } from '@/types'; // Ensure DbGame is imported
import { useGames } from '@/hooks/useGames'; // Assuming useGames has addGame/updateGame
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Define Zod schema for form validation
// Ensure this matches the DbGame structure for fields being edited
const gameFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  game_id: z.string().min(1, "Game ID (external) is required"),
  game_code: z.string().min(1, "Game Code (internal) is required"),
  provider_id: z.string().uuid("Select a valid provider"), // Assuming provider_id is UUID
  provider_slug: z.string().min(1, "Provider slug is required"), // Or fetch this based on provider_id
  category_slugs: z.array(z.string()).min(1, "Select at least one category"), // Array of category slugs
  
  description: z.string().optional(),
  rtp: z.coerce.number().min(0).max(100).optional(),
  volatility: z.enum(["low", "medium", "high", ""]).optional(),
  status: z.enum(["active", "inactive", "maintenance"]).default("active"),
  
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(tag => tag) : []), // Converts comma-separated string to array
  features: z.string().optional().transform(val => val ? val.split(',').map(feat => feat.trim()).filter(feat => feat) : []),

  cover: z.string().url("Enter a valid image URL for cover").optional(),
  banner: z.string().url("Enter a valid image URL for banner").optional(),
  image_url: z.string().url("Enter a valid image URL").optional(),

  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_popular: z.boolean().default(false),
  show_home: z.boolean().default(false),

  // Technical details - might not be user-editable or simplified
  // game_server_url: z.string().url().optional(),
  // technology: z.string().optional(),
  // has_lobby: z.boolean().default(false),
  // is_mobile: z.boolean().default(true),
  // has_freespins: z.boolean().default(false),
  // has_tables: z.boolean().default(false),
  // only_demo: z.boolean().default(false),
  // distribution: z.string().optional(), // e.g. 'direct', 'aggregator'

  // For UI mapping if necessary
  // name: z.string().optional(), // if 'name' is different from 'title'
  // minBet: z.coerce.number().optional(),
  // maxBet: z.coerce.number().optional(),
  // release_date: z.string().optional(), // Consider using a date picker
});

type GameFormData = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  game?: DbGame | Game | null; // Game to edit, or null/undefined for new game
  onSuccess?: (game: DbGame) => void;
}

const GameForm: React.FC<GameFormProps> = ({ game, onSuccess }) => {
  const { providers, categories, addGame, updateGame: updateGameContext } = useGames();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: Partial<GameFormData> = {
    title: game?.title || '',
    game_id: game?.game_id || '',
    game_code: game?.game_code || '',
    provider_id: game?.provider_id?.toString() || '',
    provider_slug: game?.provider_slug || '',
    category_slugs: Array.isArray(game?.category_slugs) ? game.category_slugs : (game?.category_slugs ? [game.category_slugs] : []),
    description: game?.description || '',
    rtp: game?.rtp || undefined,
    volatility: game?.volatility || "",
    status: game?.status || 'active',
    tags: game?.tags?.join(', ') || '',
    features: game?.features?.join(', ') || '',
    cover: game?.cover || '',
    banner: game?.banner || '',
    image_url: game?.image_url || game?.image || '', // if 'image' is used in Game type
    is_featured: game?.is_featured || false,
    is_new: game?.is_new || false,
    is_popular: game?.is_popular || false,
    show_home: game?.show_home || false,
  };
  
  const form = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    defaultValues,
  });

  useEffect(() => {
    // Reset form if 'game' prop changes (e.g., selecting a different game to edit)
    form.reset(defaultValues);
  }, [game, form.reset]);

  const onSubmit = async (data: GameFormData) => {
    setIsLoading(true);
    try {
      // Find provider name and category names based on slugs/IDs for the DbGame object
      const selectedProvider = providers.find(p => p.id.toString() === data.provider_id || p.slug === data.provider_slug);
      const selectedCategories = categories.filter(c => data.category_slugs.includes(c.slug));
      
      const dbGameData: Partial<DbGame> = {
        ...data,
        provider_name: selectedProvider?.name, // Add provider_name
        category_names: selectedCategories.map(c => c.name), // Add category_names
        // Ensure all fields expected by DbGame are present or explicitly undefined
        // If your DB schema uses numbers for RTP, ensure it's converted
        rtp: data.rtp ? parseFloat(data.rtp.toString()) : undefined,
        // Map other fields as needed from GameFormData to DbGame
      };
      
      let result: DbGame | null = null;
      if (game && game.id) { // Editing existing game
        result = await updateGameContext(game.id.toString(), dbGameData);
        if (result) toast.success("Game updated successfully!");
      } else { // Creating new game
        result = await addGame(dbGameData);
        if (result) toast.success("Game created successfully!");
      }

      if (result && onSuccess) {
        onSuccess(result);
        form.reset(); // Optionally reset form on success
      } else if (!result) {
        toast.error("Failed to save game. Please check console for details.");
      }
    } catch (error: any) {
      console.error("Error saving game:", error);
      toast.error(`Error: ${error.message || "Could not save game."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 bg-card rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...form.register("title")} />
          {form.formState.errors.title && <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>}
        </div>

        {/* Game ID (External) */}
        <div>
          <Label htmlFor="game_id">Game ID (External/API)</Label>
          <Input id="game_id" {...form.register("game_id")} />
          {form.formState.errors.game_id && <p className="text-red-500 text-sm">{form.formState.errors.game_id.message}</p>}
        </div>

        {/* Game Code (Internal) */}
        <div>
          <Label htmlFor="game_code">Game Code (Internal Slug)</Label>
          <Input id="game_code" {...form.register("game_code")} />
          {form.formState.errors.game_code && <p className="text-red-500 text-sm">{form.formState.errors.game_code.message}</p>}
        </div>

        {/* Provider */}
        <div>
          <Label htmlFor="provider_id">Provider</Label>
          <Controller
            name="provider_id"
            control={form.control}
            render={({ field }) => (
              <Select 
                onValueChange={(value) => {
                    field.onChange(value);
                    const selectedProv = providers.find(p => p.id.toString() === value);
                    if (selectedProv) form.setValue('provider_slug', selectedProv.slug);
                }} 
                value={field.value}
              >
                <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>
                  {providers.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.provider_id && <p className="text-red-500 text-sm">{form.formState.errors.provider_id.message}</p>}
        </div>
        {/* Provider Slug (read-only or hidden, auto-filled) */}
         <div>
          <Label htmlFor="provider_slug">Provider Slug (auto-filled)</Label>
          <Input id="provider_slug" {...form.register("provider_slug")} readOnly className="bg-muted/50" />
        </div>


        {/* Categories */}
        <div>
          <Label>Categories</Label>
          <Controller
            name="category_slugs"
            control={form.control}
            render={({ field }) => (
                <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                    {categories.map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`category-${category.slug}`}
                                checked={field.value?.includes(category.slug)}
                                onCheckedChange={(checked) => {
                                    const currentSlugs = field.value || [];
                                    if (checked) {
                                        field.onChange([...currentSlugs, category.slug]);
                                    } else {
                                        field.onChange(currentSlugs.filter(slug => slug !== category.slug));
                                    }
                                }}
                            />
                            <Label htmlFor={`category-${category.slug}`}>{category.name}</Label>
                        </div>
                    ))}
                </div>
            )}
            />
          {form.formState.errors.category_slugs && <p className="text-red-500 text-sm">{form.formState.errors.category_slugs.message}</p>}
        </div>


        {/* Description */}
        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...form.register("description")} />
          {form.formState.errors.description && <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>}
        </div>

        {/* RTP */}
        <div>
          <Label htmlFor="rtp">RTP (%)</Label>
          <Input id="rtp" type="number" step="0.01" {...form.register("rtp")} />
          {form.formState.errors.rtp && <p className="text-red-500 text-sm">{form.formState.errors.rtp.message}</p>}
        </div>
        
        {/* Volatility */}
        <div>
          <Label htmlFor="volatility">Volatility</Label>
          <Controller
            name="volatility"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger><SelectValue placeholder="Select volatility" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">N/A</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.volatility && <p className="text-red-500 text-sm">{form.formState.errors.volatility.message}</p>}
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">Status</Label>
           <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.status && <p className="text-red-500 text-sm">{form.formState.errors.status.message}</p>}
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" {...form.register("tags")} />
          {form.formState.errors.tags && <p className="text-red-500 text-sm">{form.formState.errors.tags.message}</p>}
        </div>
        
        {/* Features */}
        <div>
          <Label htmlFor="features">Features (comma-separated)</Label>
          <Input id="features" {...form.register("features")} />
          {form.formState.errors.features && <p className="text-red-500 text-sm">{form.formState.errors.features.message}</p>}
        </div>

        {/* Image URLs */}
        <div>
          <Label htmlFor="image_url">Main Image URL</Label>
          <Input id="image_url" {...form.register("image_url")} />
          {form.formState.errors.image_url && <p className="text-red-500 text-sm">{form.formState.errors.image_url.message}</p>}
        </div>
        <div>
          <Label htmlFor="cover">Cover Image URL</Label>
          <Input id="cover" {...form.register("cover")} />
          {form.formState.errors.cover && <p className="text-red-500 text-sm">{form.formState.errors.cover.message}</p>}
        </div>
        <div>
          <Label htmlFor="banner">Banner Image URL</Label>
          <Input id="banner" {...form.register("banner")} />
          {form.formState.errors.banner && <p className="text-red-500 text-sm">{form.formState.errors.banner.message}</p>}
        </div>
      </div>

      {/* Boolean Flags */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <Controller name="is_featured" control={form.control} render={({ field }) => <Checkbox id="is_featured" checked={field.value} onCheckedChange={field.onChange} />} />
          <Label htmlFor="is_featured">Featured</Label>
        </div>
        <div className="flex items-center space-x-2">
           <Controller name="is_new" control={form.control} render={({ field }) => <Checkbox id="is_new" checked={field.value} onCheckedChange={field.onChange} />} />
          <Label htmlFor="is_new">New</Label>
        </div>
        <div className="flex items-center space-x-2">
           <Controller name="is_popular" control={form.control} render={({ field }) => <Checkbox id="is_popular" checked={field.value} onCheckedChange={field.onChange} />} />
          <Label htmlFor="is_popular">Popular</Label>
        </div>
        <div className="flex items-center space-x-2">
           <Controller name="show_home" control={form.control} render={({ field }) => <Checkbox id="show_home" checked={field.value} onCheckedChange={field.onChange} />} />
          <Label htmlFor="show_home">Show on Homepage</Label>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {game?.id ? 'Update Game' : 'Create Game'}
      </Button>
    </form>
  );
};

export default GameForm;

import React, { useState, useEffect } from 'react';
import { Game, DbGame, GameProvider } from '@/types'; // GameProvider for provider list
import { gameService } from '@/services/gameService';
// import { providerService } from '@/services/providerService'; // Assuming a providerService exists
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Corrected import for FormField and others
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const gameFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  slug: z.string().optional(),
  provider_slug: z.string().optional(),
  categoryName: z.string().optional(),
  category_slugs: z.string().optional(),
  image: z.string().url({ message: "Invalid URL format." }).optional().or(z.literal('')),
  banner: z.string().url({ message: "Invalid URL format." }).optional().or(z.literal('')),
  description: z.string().optional(),
  rtp: z.number().min(0).max(100).optional(),
  isPopular: z.boolean().default(false).optional(),
  isNew: z.boolean().default(false).optional(),
  is_featured: z.boolean().default(false).optional(),
  show_home: z.boolean().default(false).optional(),
  volatility: z.enum(['low', 'medium', 'high', 'low-medium', 'medium-high']).optional(),
  lines: z.number().optional(),
  minBet: z.number().optional(),
  maxBet: z.number().optional(),
  features: z.string().optional(),
  tags: z.string().optional(),
  themes: z.string().optional(),
  releaseDate: z.string().optional(),
  game_id: z.string().optional(),
  game_code: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance', 'pending_review', 'draft', 'archived']).default('draft').optional(),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  providers?: GameProvider[];
}

const GameForm: React.FC<GameFormProps> = ({ providers }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      provider_slug: '',
      categoryName: '',
      category_slugs: '',
      image: '',
      banner: '',
      description: '',
      rtp: 0,
      isPopular: false,
      isNew: false,
      is_featured: false,
      show_home: false,
      volatility: undefined,
      lines: 0,
      minBet: 0,
      maxBet: 0,
      features: '',
      tags: '',
      themes: '',
      releaseDate: '',
      game_id: '',
      game_code: '',
      status: 'draft',
    },
  });

  useEffect(() => {
    if (gameId) {
      setIsEditing(true);
      const fetchGame = async () => {
        try {
          const game = await gameService.getGameById(gameId);
          if (game) {
            form.reset({
              title: game.title || '',
              slug: game.slug || '',
              provider_slug: game.provider_slug || '',
              categoryName: game.categoryName || '',
              category_slugs: Array.isArray(game.category_slugs) ? game.category_slugs.join(',') : game.category_slugs || '',
              image: game.image || '',
              banner: game.banner || '',
              description: game.description || '',
              rtp: game.rtp || 0,
              isPopular: game.isPopular || false,
              isNew: game.isNew || false,
              is_featured: game.is_featured || false,
              show_home: game.show_home || false,
              volatility: game.volatility || undefined,
              lines: game.lines || 0,
              minBet: game.minBet || 0,
              maxBet: game.maxBet || 0,
              features: game.features ? game.features.join(',') : '',
              tags: game.tags ? game.tags.join(',') : '',
              themes: game.themes ? game.themes.join(',') : '',
              releaseDate: game.releaseDate || '',
              game_id: game.game_id || '',
              game_code: game.game_code || '',
              status: game.status || 'draft',
            });
          } else {
            toast.error('Game not found');
            navigate('/admin/games');
          }
        } catch (error) {
          console.error('Error fetching game:', error);
          toast.error('Failed to load game');
          navigate('/admin/games');
        }
      };
      fetchGame();
    }
  }, [gameId, navigate, form]);

  const onSubmit = async (values: GameFormValues) => {
    try {
      const payload: Partial<Game> = {
        title: values.title,
        slug: values.slug,
        provider_slug: values.provider_slug,
        categoryName: values.categoryName,
        category_slugs: values.category_slugs ? values.category_slugs.split(',').map(s => s.trim()) : [],
        image: values.image,
        banner: values.banner,
        description: values.description,
        rtp: values.rtp,
        isPopular: values.isPopular,
        isNew: values.isNew,
        is_featured: values.is_featured,
        show_home: values.show_home,
        volatility: values.volatility,
        lines: values.lines,
        minBet: values.minBet,
        maxBet: values.maxBet,
        features: values.features ? values.features.split(',').map(s => s.trim()) : [],
        tags: values.tags ? values.tags.split(',').map(s => s.trim()) : [],
        themes: values.themes ? values.themes.split(',').map(s => s.trim()) : [],
        releaseDate: values.releaseDate,
        game_id: values.game_id,
        game_code: values.game_code,
        status: values.status,
      };

      if (isEditing && gameId) {
        await gameService.updateGame(gameId, payload);
        toast.success('Game updated successfully');
      } else {
        await gameService.createGame(payload);
        toast.success('Game created successfully');
      }
      navigate('/admin/games');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save game');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Game Title" {...field} />
                </FormControl>
                <FormDescription>
                  This is the display name of the game.
                </FormDescription>
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
                <FormControl>
                  <Input placeholder="game-slug" {...field} />
                </FormControl>
                <FormDescription>
                  A unique identifier, used in the URL.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="provider_slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Slug</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers?.map((provider) => (
                        <SelectItem key={provider.slug} value={provider.slug}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  The slug of the game provider.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="Slots" {...field} />
                </FormControl>
                <FormDescription>
                  The category of the game.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category_slugs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Slugs (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="slots, top, new" {...field} />
                </FormControl>
                <FormDescription>
                  Comma separated slugs for categories.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormDescription>
                  URL for the game's cover image.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="banner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/banner.jpg" {...field} />
                </FormControl>
                <FormDescription>
                  URL for the game's banner image.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rtp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RTP (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="96.5" {...field} />
                </FormControl>
                <FormDescription>
                  Return to Player percentage.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minBet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Bet</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.10" {...field} />
                </FormControl>
                <FormDescription>
                  Minimum bet amount.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="maxBet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Bet</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormDescription>
                  Maximum bet amount.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="game_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Game ID</FormLabel>
                <FormControl>
                  <Input placeholder="External Game ID" {...field} />
                </FormControl>
                <FormDescription>
                  External game identifier from the provider.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="game_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Game Code</FormLabel>
                <FormControl>
                  <Input placeholder="External Game Code" {...field} />
                </FormControl>
                <FormDescription>
                  External game code from the provider.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Features (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="feature1, feature2" {...field} />
                </FormControl>
                <FormDescription>
                  Comma separated list of game features.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="tag1, tag2" {...field} />
                </FormControl>
                <FormDescription>
                  Comma separated list of game tags.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="themes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Themes (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="theme1, theme2" {...field} />
                </FormControl>
                <FormDescription>
                  Comma separated list of game themes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="releaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Release Date</FormLabel>
                <FormControl>
                  <Input placeholder="YYYY-MM-DD" {...field} />
                </FormControl>
                <FormDescription>
                  Release date of the game.
                </FormDescription>
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
                <Textarea placeholder="Game description" className="resize-none" {...field} />
              </FormControl>
              <FormDescription>
                Description of the game.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="isPopular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-1 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-semibold">Popular</FormLabel>
                  <FormDescription>
                    Mark this game as popular.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isNew"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-1 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-semibold">New</FormLabel>
                  <FormDescription>
                    Mark this game as new.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-1 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-semibold">Featured</FormLabel>
                  <FormDescription>
                    Mark this game as featured.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="show_home"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-1 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-semibold">Show Home</FormLabel>
                  <FormDescription>
                    Show this game on home page.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The status of the game.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            'Saving...'
          ) : (
            isEditing ? 'Update Game' : 'Create Game'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default GameForm;

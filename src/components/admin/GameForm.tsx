import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Game, DbGame, GameStatusEnum, GameVolatilityEnum, AllGameStatuses, AllGameVolatilities, GameProvider, GameCategory } from '@/types/game'; // Use Game/DbGame, enums, GameProvider, GameCategory
import { mapGameToDbGameAdapter, mapDbGameToGameAdapter } from './GameAdapter'; // Use this component's adapter
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { slugify } from "@/lib/utils"; // Assuming slugify is available

const gameFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  slug: z.string().optional(),
  game_id: z.string().optional(), // External Game ID from provider
  provider_slug: z.string().min(1, "Provider is required."),
  category_slugs: z.array(z.string()).min(1, "At least one category is required."),
  
  status: z.nativeEnum(GameStatusEnum).default(GameStatusEnum.PENDING),
  volatility: z.nativeEnum(GameVolatilityEnum).optional(),
  rtp: z.coerce.number().min(0).max(100).optional(),
  
  description: z.string().optional(),
  image_url: z.string().url("Invalid URL format for image.").optional().or(z.literal('')),
  cover: z.string().url("Invalid URL format for cover.").optional().or(z.literal('')),
  banner_url: z.string().url("Invalid URL format for banner.").optional().or(z.literal('')),
  
  tags: z.array(z.string()).optional(), // Store as string array, UI can handle object conversion if needed
  features: z.array(z.string()).optional(),
  themes: z.array(z.string()).optional(),
  
  releaseDate: z.string().optional(), // Consider using a date picker and coercing to ISO string

  is_popular: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  show_home: z.boolean().default(false),
  mobile_friendly: z.boolean().default(true), // is_mobile in DB
  
  lines: z.coerce.number().int().positive().optional(),
  min_bet: z.coerce.number().positive().optional(),
  max_bet: z.coerce.number().positive().optional(),

  only_demo: z.boolean().default(false),
  only_real: z.boolean().default(false),
  has_freespins: z.boolean().default(false),
  game_code: z.string().optional(),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  game?: DbGame | null; // Expect DbGame for editing, will be mapped to Game for form
  providers: { slug: string; name: string }[]; // Simplified provider type for form
  categories: { slug: string; name: string }[]; // Simplified category type for form
  onSubmitSuccess: () => void;
  onCancel?: () => void;
}

const GameForm: React.FC<GameFormProps> = ({ game: dbGameForEdit, providers, categories, onSubmitSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  // Map DbGame to Game for form initialization
  const gameForForm = dbGameForEdit ? mapDbGameToGameAdapter(dbGameForEdit) : null;

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: gameForForm?.title || "",
      slug: gameForForm?.slug || "",
      game_id: gameForForm?.game_id || "",
      provider_slug: gameForForm?.provider_slug || "",
      category_slugs: gameForForm?.category_slugs || [],
      status: gameForForm?.status || GameStatusEnum.DRAFT,
      volatility: gameForForm?.volatility || undefined,
      rtp: gameForForm?.rtp || undefined,
      description: gameForForm?.description || "",
      image_url: gameForForm?.image_url || "",
      cover: gameForForm?.cover || "",
      banner_url: gameForForm?.bannerUrl || "",
      // Ensure tags are string array for the form field
      tags: Array.isArray(gameForForm?.tags) ? gameForForm.tags.map(t => typeof t === 'string' ? t : t.name) : [],
      features: gameForForm?.features || [],
      themes: gameForForm?.themes || [],
      releaseDate: gameForForm?.releaseDate ? new Date(gameForForm.releaseDate).toISOString().split('T')[0] : "", // Corrected: use releaseDate
      is_popular: gameForForm?.is_popular || false,
      is_new: gameForForm?.is_new || false,
      is_featured: gameForForm?.is_featured || false,
      show_home: gameForForm?.show_home || false,
      mobile_friendly: gameForForm?.mobile_friendly === undefined ? true : gameForForm.mobile_friendly,
      lines: gameForForm?.lines || undefined,
      min_bet: gameForForm?.min_bet || undefined,
      max_bet: gameForForm?.max_bet || undefined,
      only_demo: gameForForm?.only_demo || false,
      only_real: gameForForm?.only_real || false,
      has_freespins: gameForForm?.has_freespins || false,
      game_code: gameForForm?.game_code || "",
    },
  });
  
  const watchedTitle = form.watch("title");
  useEffect(() => {
    if (watchedTitle && !form.getValues("slug") && !gameForForm?.slug) { // Only auto-slug if slug is empty and not editing existing slug
      form.setValue("slug", slugify(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, form, gameForForm?.slug]);


  const mutation = useMutation<DbGame, Error, Partial<DbGame>>({
    mutationFn: async (gameData: Partial<DbGame>) => {
      let response;
      if (dbGameForEdit?.id) { // Editing existing game
        response = await supabase.from("games").update(gameData).eq("id", dbGameForEdit.id).select().single();
      } else { // Creating new game
        response = await supabase.from("games").insert(gameData).select().single();
      }
      if (response.error) throw response.error;
      return response.data as DbGame;
    },
    onSuccess: (data) => {
      toast.success(dbGameForEdit ? "Game updated successfully!" : "Game created successfully!");
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      queryClient.invalidateQueries({ queryKey: ['allGames'] }); // Also invalidate public games list
      onSubmitSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const processSubmit = async (values: GameFormValues) => {
    // Map GameFormValues (which is close to Game type) to DbGame for saving
    const gameToSave: Partial<Game> = {
        ...values,
        // releaseDate might need conversion if it's stored differently in DB
        // For tags, if GameFormValues.tags is string[], and DbGame expects string[], it's fine.
        // If DbGame expects GameTag[], GameFormValues.tags needs conversion.
        // The adapter mapGameToDbGameAdapter expects Partial<Game>
    };
    const dbGamePayload = mapGameToDbGameAdapter(gameToSave);
    
    // Ensure essential fields like provider_slug are present from values before sending.
    // The adapter should handle undefined values properly.
    if (dbGameForEdit?.id) {
        dbGamePayload.id = dbGameForEdit.id; // ensure id is passed for updates
    }

    await mutation.mutateAsync(dbGamePayload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-6 p-1">
        <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="Sweet Bonanza" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl><Input placeholder="sweet-bonanza" {...field} /></FormControl>
                <FormDescription>URL-friendly version of the title (auto-generated if empty).</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="game_id"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Provider Game ID (Optional)</FormLabel>
                <FormControl><Input placeholder="vs20fruitsw" {...field} /></FormControl>
                <FormDescription>Original game ID from the provider.</FormDescription>
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
                     {/* This needs a multi-select component. For now, using comma-separated input as placeholder */}
                    <Input 
                        placeholder="slots,new-games (comma-separated)" 
                        value={field.value.join(',')} 
                        onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    />
                    <FormDescription>Select one or more categories. (Improved multi-select pending)</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                name="volatility"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Volatility (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select volatility" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="">Not Set</SelectItem>
                        {AllGameVolatilities.map(v => <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="rtp"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>RTP (%) (Optional)</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="96.50" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
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
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl><Textarea placeholder="A brief description of the game." {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="image_url" render={({ field }) => ( <FormItem> <FormLabel>Image URL (Optional)</FormLabel> <FormControl><Input placeholder="https://example.com/image.png" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="cover" render={({ field }) => ( <FormItem> <FormLabel>Cover URL (Optional)</FormLabel> <FormControl><Input placeholder="https://example.com/cover.png" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="banner_url" render={({ field }) => ( <FormItem> <FormLabel>Banner URL (Optional)</FormLabel> <FormControl><Input placeholder="https://example.com/banner.png" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )}/>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tags (comma-separated, optional)</FormLabel>
                    <FormControl>
                        <Input 
                        placeholder="popular,new,jackpot" 
                        {...field} 
                        value={Array.isArray(field.value) ? field.value.join(',') : ''} 
                        onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField control={form.control} name="features" render={({ field }) => ( <FormItem><FormLabel>Features (comma-separated, optional)</FormLabel><FormControl><Input placeholder="bonus-buy,megaways" {...field} value={Array.isArray(field.value) ? field.value.join(',') : ''} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="themes" render={({ field }) => ( <FormItem><FormLabel>Themes (comma-separated, optional)</FormLabel><FormControl><Input placeholder="egyptian,adventure" {...field} value={Array.isArray(field.value) ? field.value.join(',') : ''} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></FormControl><FormMessage /></FormItem> )}/>
        </div>
        
        <FormField
            control={form.control}
            name="releaseDate"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Release Date (Optional)</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <FormField control={form.control} name="is_popular" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Popular</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem> )}/>
            <FormField control={form.control} name="is_new" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>New</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem> )}/>
            <FormField control={form.control} name="is_featured" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Featured</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem> )}/>
            <FormField control={form.control} name="show_home" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Show on Home</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem> )}/>
        </div>
        
        <FormField control={form.control} name="mobile_friendly" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-1 md:col-span-2"><div className="space-y-0.5"><FormLabel>Mobile Friendly</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem> )}/>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="lines" render={({ field }) => ( <FormItem><FormLabel>Lines (Optional)</FormLabel><FormControl><Input type="number" placeholder="20" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="min_bet" render={({ field }) => ( <FormItem><FormLabel>Min Bet (Optional)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.10" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="max_bet" render={({ field }) => ( <FormItem><FormLabel>Max Bet (Optional)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="100" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )}/>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="only_demo" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Demo Only</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem> )}/>
            <FormField control={form.control} name="only_real" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Real Only</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem> )}/>
            <FormField control={form.control} name="has_freespins" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Has Freespins</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem> )}/>
        </div>

        <FormField
            control={form.control}
            name="game_code"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Internal Game Code (Optional)</FormLabel>
                <FormControl><Input placeholder="PRG-SWBON" {...field} /></FormControl>
                <FormDescription>Unique internal code for this game if applicable.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="flex justify-end space-x-4 pt-6">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (dbGameForEdit ? "Updating..." : "Creating...") : (dbGameForEdit ? "Update Game" : "Create Game")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GameForm;

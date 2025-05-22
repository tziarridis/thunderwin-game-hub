import React, { useEffect } from 'react'; // Added useEffect import
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
import { Game, DbGame, GameStatusEnum, GameVolatilityEnum, AllGameStatuses, AllGameVolatilities, GameProvider, GameCategory, GameStatus, GameVolatility } from '@/types/game';
import { mapGameToDbGameAdapter, mapDbGameToGameAdapter } from './GameAdapter';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { slugify } from "@/utils/gameTypeAdapter"; // Corrected import path

const gameFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  slug: z.string().optional(),
  game_id: z.string().optional(),
  provider_slug: z.string().min(1, "Provider is required."),
  category_slugs: z.array(z.string()).min(1, "At least one category is required."),
  
  status: z.enum(AllGameStatuses as [string, ...string[]]).default(GameStatusEnum.DRAFT),
  volatility: z.enum(AllGameVolatilities as [string, ...string[]]).optional(),
  rtp: z.coerce.number().min(0).max(100).optional(),
  
  description: z.string().optional(),
  image_url: z.string().url("Invalid URL format for image.").optional().or(z.literal('')),
  cover: z.string().url("Invalid URL format for cover.").optional().or(z.literal('')),
  banner_url: z.string().url("Invalid URL format for banner.").optional().or(z.literal('')),
  
  tags: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  themes: z.array(z.string()).optional(),
  
  releaseDate: z.string().optional(),

  is_popular: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  show_home: z.boolean().default(false),
  mobile_friendly: z.boolean().default(true),
  
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
  game?: DbGame | null;
  providers: { slug: string; name: string }[];
  categories: { slug: string; name: string }[];
  onSubmitSuccess: () => void;
  onCancel?: () => void;
  isLoading?: boolean; // Added isLoading to GameFormProps
}

const GameForm: React.FC<GameFormProps> = ({ game: dbGameForEdit, providers, categories, onSubmitSuccess, onCancel, isLoading }) => {
  const queryClient = useQueryClient();
  const gameForForm = dbGameForEdit ? mapDbGameToGameAdapter(dbGameForEdit) : null;

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: gameForForm?.title || "",
      slug: gameForForm?.slug || "",
      game_id: gameForForm?.game_id || "",
      provider_slug: gameForForm?.provider_slug || "",
      category_slugs: gameForForm?.category_slugs || [],
      status: gameForForm?.status || GameStatusEnum.DRAFT, // GameStatusEnum.DRAFT is "draft"
      volatility: gameForForm?.volatility || undefined, // e.g. "low"
      rtp: gameForForm?.rtp || undefined,
      description: gameForForm?.description || "",
      image_url: gameForForm?.image_url || "",
      cover: gameForForm?.cover || "",
      banner_url: gameForForm?.bannerUrl || "",
      tags: Array.isArray(gameForForm?.tags) ? gameForForm.tags.map(t => typeof t === 'string' ? t : t.name) : [],
      features: gameForForm?.features || [],
      themes: gameForForm?.themes || [],
      releaseDate: gameForForm?.releaseDate ? new Date(gameForForm.releaseDate).toISOString().split('T')[0] : "",
      is_popular: gameForForm?.is_popular || false,
      is_new: gameForForm?.is_new || false, // Corrected: use is_new
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
    if (watchedTitle && !form.getValues("slug") && !gameForForm?.slug) {
      form.setValue("slug", slugify(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, form, gameForForm?.slug]);


  const mutation = useMutation<DbGame, Error, Partial<DbGame>>({
    mutationFn: async (gameData: Partial<DbGame>) => {
      let response;
      if (dbGameForEdit?.id) {
        // Ensure 'id' is not in gameData for updates, use .eq("id", dbGameForEdit.id)
        const { id, ...updateData } = gameData;
        response = await supabase.from("games").update(updateData).eq("id", dbGameForEdit.id).select().single();
      } else {
        // For insert, Supabase client might require certain fields not marked as optional in its internal types
        // Casting to `any` bypasses TS check, assuming `mapGameToDbGameAdapter` prepares all required fields.
        response = await supabase.from("games").insert(gameData as any).select().single();
      }
      if (response.error) throw response.error;
      return response.data as DbGame;
    },
    onSuccess: (data) => {
      toast.success(dbGameForEdit ? "Game updated successfully!" : "Game created successfully!");
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      queryClient.invalidateQueries({ queryKey: ['allGames'] });
      onSubmitSuccess();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const processSubmit = async (values: GameFormValues) => {
    const gameToSave: Partial<Game> = {
        ...values,
        // releaseDate might need conversion to ISO string if not already
        releaseDate: values.releaseDate ? new Date(values.releaseDate).toISOString() : undefined,
    };
    const dbGamePayload = mapGameToDbGameAdapter(gameToSave); // This is from ./GameAdapter
    
    if (dbGameForEdit?.id) {
        dbGamePayload.id = dbGameForEdit.id;
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
                <FormControl><Input placeholder="sweet-bonanza" {...field} value={field.value ?? ""} /></FormControl>
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
                <FormControl><Input placeholder="vs20fruitsw" {...field} value={field.value ?? ""} /></FormControl>
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
                    <Input 
                        placeholder="slots,new-games (comma-separated)" 
                        value={Array.isArray(field.value) ? field.value.join(',') : ''} 
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
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select volatility" /></SelectTrigger></FormControl>
                    <SelectContent>
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
                    <FormControl><Input type="number" step="0.01" placeholder="96.5" {...field} value={field.value ?? ""} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
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
              <FormControl><Textarea placeholder="Describe the game..." {...field} value={field.value ?? ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://example.com/image.png" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="cover"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Cover URL (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://example.com/cover.png" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="banner_url"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Banner URL (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://example.com/banner.png" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
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
                                placeholder="popular,new,slots" 
                                value={Array.isArray(field.value) ? field.value.join(',') : ''}
                                onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                            />
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
                        <FormLabel>Features (comma-separated, optional)</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="bonus-buy,megaways" 
                                value={Array.isArray(field.value) ? field.value.join(',') : ''}
                                onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                            />
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
                        <FormLabel>Themes (comma-separated, optional)</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="egypt,adventure" 
                                value={Array.isArray(field.value) ? field.value.join(',') : ''}
                                onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField
                control={form.control}
                name="releaseDate"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Release Date (Optional)</FormLabel>
                    <FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="lines"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Lines (Optional)</FormLabel>
                    <FormControl><Input type="number" placeholder="20" {...field} value={field.value ?? ""} onChange={e => field.onChange(parseInt(e.target.value,10))} /></FormControl>
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
                    <FormControl><Input type="number" step="0.01" placeholder="0.10" {...field} value={field.value ?? ""} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
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
                    <FormControl><Input type="number" step="1" placeholder="100" {...field} value={field.value ?? ""} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <FormField
            control={form.control}
            name="game_code"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Internal Game Code (Optional)</FormLabel>
                <FormControl><Input placeholder="internal-code-001" {...field} value={field.value ?? ""} /></FormControl>
                <FormDescription>Alternative internal game identifier.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <FormField control={form.control} name="is_popular"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Popular</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="is_new"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>New</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="is_featured"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Featured</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="show_home"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Show on Home</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
                 <FormField control={form.control} name="mobile_friendly"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Mobile Friendly</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="only_demo"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Demo Only</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="only_real"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Real Money Only</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="has_freespins"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Has Freespins</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending || isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={mutation.isPending || isLoading}>
            {mutation.isPending || isLoading ? (dbGameForEdit ? "Updating..." : "Creating...") : (dbGameForEdit ? "Update Game" : "Create Game")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GameForm;

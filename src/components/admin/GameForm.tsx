import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Game, GameProvider, GameCategory, DbGame } from '@/types';
import { gameProviderService } from '@/services/gameProviderService';
import { gameCategoryService } from '@/services/gameCategoryService';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { ImageIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

interface GameFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  initialValues?: Partial<DbGame>;
  providers: GameProvider[];
  categories: GameCategory[];
  loading?: boolean;
}

const formSchema = z.object({
  game_name: z.string().min(2, {
    message: "Game name must be at least 2 characters.",
  }),
  game_code: z.string().optional(),
  provider_slug: z.string().min(2, {
    message: "Provider is required",
  }),
  category_slugs: z.array(z.string()).optional(),
  image_url: z.string().optional(),
  cover: z.string().optional(),
  description: z.string().optional(),
  rtp: z.number().optional(),
  is_popular: z.boolean().default(false).optional(),
  is_new: z.boolean().default(false).optional(),
  is_featured: z.boolean().default(false).optional(),
  show_home: z.boolean().default(false).optional(),
  status: z.enum(['active', 'inactive']).default('active').optional(),
  // Add other fields as necessary, marking them as optional if they can be empty
  // For example:
  // min_bet: z.number().optional(),
  // max_bet: z.number().optional(),
  // jackpot: z.boolean().optional(),
  // Add more fields as needed
  launch_url: z.string().optional(),
  // created_at: z.date().optional(),
  // updated_at: z.date().optional(),
});

const GameForm: React.FC<GameFormProps> = ({ onSubmit, initialValues, providers, categories, loading }) => {
  const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      game_name: initialValues?.game_name || '',
      game_code: initialValues?.game_code || '',
      provider_slug: initialValues?.provider_slug || '',
      category_slugs: initialValues?.category_slugs || [],
      image_url: initialValues?.image_url || '',
      cover: initialValues?.cover || '',
      description: initialValues?.description || '',
      rtp: initialValues?.rtp || 0,
      is_popular: initialValues?.is_popular || false,
      is_new: initialValues?.is_new || false,
      is_featured: initialValues?.is_featured || false,
      show_home: initialValues?.show_home || false,
      status: initialValues?.status || 'active',
      launch_url: initialValues?.launch_url || '',
      // created_at: initialValues?.created_at ? new Date(initialValues.created_at) : undefined,
      // updated_at: initialValues?.updated_at ? new Date(initialValues.updated_at) : undefined,
    },
    mode: "onChange",
  });
  
  const { watch, setValue } = form;
  const providerInputValue = watch('provider_slug') || '';
  const gameCodeInputValue = watch('game_code') || '';

  useEffect(() => {
    if (initialValues) {
      // Manually set values for fields that might need transformation
      form.reset({
        game_name: initialValues?.game_name || '',
        game_code: initialValues?.game_code || '',
        provider_slug: initialValues?.provider_slug || '',
        category_slugs: initialValues?.category_slugs || [],
        image_url: initialValues?.image_url || '',
        cover: initialValues?.cover || '',
        description: initialValues?.description || '',
        rtp: initialValues?.rtp || 0,
        is_popular: initialValues?.is_popular || false,
        is_new: initialValues?.is_new || false,
        is_featured: initialValues?.is_featured || false,
        show_home: initialValues?.show_home || false,
        status: initialValues?.status || 'active',
        launch_url: initialValues?.launch_url || '',
        // created_at: initialValues?.created_at ? new Date(initialValues.created_at) : undefined,
        // updated_at: initialValues?.updated_at ? new Date(initialValues.updated_at) : undefined,
      });
    }
  }, [initialValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="game_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter game name" {...field} />
              </FormControl>
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
                <Input
                  placeholder="Unique game code"
                  value={gameCodeInputValue}
                  onChange={(e) => setValue('game_code', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.slug}>
                      {provider.name}
                    </SelectItem>
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
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.slug}
                      checked={field.value?.includes(category.slug)}
                      onCheckedChange={(checked) => {
                        const currentValues = field.value || [];
                        if (checked) {
                          field.onChange([...currentValues, category.slug]);
                        } else {
                          field.onChange(currentValues.filter((value) => value !== category.slug));
                        }
                      }}
                    />
                    <Label htmlFor={category.slug} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter image URL" {...field} />
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
                <Input placeholder="Enter cover image URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Game description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
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
                <Input
                  type="number"
                  placeholder="Enter RTP percentage"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="is_popular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-muted p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Popular</FormLabel>
                  {/* <FormDescription>
                    Make this game appear as popular.
                  </FormDescription> */}
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_new"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-muted p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">New</FormLabel>
                  {/* <FormDescription>
                    Make this game appear as new.
                  </FormDescription> */}
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-muted p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Featured</FormLabel>
                  {/* <FormDescription>
                    Make this game appear as new.
                  </FormDescription> */}
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="show_home"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-muted p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show on Home</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="launch_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Launch URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter launch URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
          control={form.control}
          name="created_at"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Created At</FormLabel>
              <Popover open={isImagePopoverOpen} onOpenChange={setIsImagePopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default GameForm;

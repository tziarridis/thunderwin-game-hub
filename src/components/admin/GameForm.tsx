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
// import { gameProviderService } from '@/services/gameProviderService'; // Not used directly
// import { gameCategoryService } from '@/services/gameCategoryService'; // Not used directly
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox"
// import { cn } from "@/lib/utils" // Not used
// import { ImageIcon } from 'lucide-react'; // Not used
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover" // Not used
// import { Calendar } from "@/components/ui/calendar" // Not used
// import { format } from "date-fns" // Not used

interface GameFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  initialValues?: Partial<DbGame>;
  providers: GameProvider[];
  categories: GameCategory[];
  loading?: boolean;
}

const formSchema = z.object({
  title: z.string().min(2, { // Changed from game_name to title
    message: "Game title must be at least 2 characters.",
  }),
  game_code: z.string().optional(),
  provider_slug: z.string().min(1, { // Allow empty if not required, or min(2) if it is
    message: "Provider is required",
  }),
  category_slugs: z.array(z.string()).optional().default([]), // Ensure it's an array
  image_url: z.string().optional(),
  cover: z.string().optional(),
  description: z.string().optional(),
  rtp: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().optional()
  ),
  is_popular: z.boolean().default(false).optional(),
  is_new: z.boolean().default(false).optional(),
  is_featured: z.boolean().default(false).optional(),
  show_home: z.boolean().default(false).optional(),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active').optional(), // Added 'maintenance'
  launch_url: z.string().optional(), // Added launch_url
});

const GameForm: React.FC<GameFormProps> = ({ onSubmit, initialValues, providers, categories, loading }) => {
  // const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false); // Not used
  // const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // Not used

  const transformInitialValues = (values?: Partial<DbGame>): z.infer<typeof formSchema> => {
    let categorySlugsArray: string[] = [];
    if (values?.category_slugs) {
        if (typeof values.category_slugs === 'string') {
            categorySlugsArray = values.category_slugs.split(',').map(s => s.trim()).filter(Boolean);
        } else if (Array.isArray(values.category_slugs)) {
            categorySlugsArray = values.category_slugs.filter(s => typeof s === 'string');
        }
    }

    return {
      title: values?.title || '',
      game_code: values?.game_code || '',
      provider_slug: values?.provider_slug || '',
      category_slugs: categorySlugsArray,
      image_url: values?.image_url || '',
      cover: values?.cover || '',
      description: values?.description || '',
      rtp: values?.rtp || undefined, // Ensure it's number or undefined
      is_popular: values?.is_popular || false,
      is_new: values?.is_new || false,
      is_featured: values?.is_featured || false,
      show_home: values?.show_home || false,
      status: values?.status || 'active',
      launch_url: values?.launch_url || '',
    };
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: transformInitialValues(initialValues),
    mode: "onChange",
  });
  
  // const { watch, setValue } = form; // watch and setValue not directly used here, but kept if needed later
  // const providerInputValue = watch('provider_slug') || '';
  // const gameCodeInputValue = watch('game_code') || '';

  useEffect(() => {
    if (initialValues) {
      form.reset(transformInitialValues(initialValues));
    }
  }, [initialValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title" // Changed from game_name
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter game title" {...field} />
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
                  placeholder="Unique game code (e.g. from provider)"
                  {...field}
                  // Example of transforming value if needed:
                  // value={field.value || ''} 
                  // onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
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
              <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value || ''}>
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
                      id={`category-${category.slug}`} // Ensure unique ID
                      checked={field.value?.includes(category.slug)}
                      onCheckedChange={(checked) => {
                        const currentValues = Array.isArray(field.value) ? field.value : [];
                        if (checked) {
                          field.onChange([...currentValues, category.slug]);
                        } else {
                          field.onChange(currentValues.filter((value) => value !== category.slug));
                        }
                      }}
                    />
                    <Label htmlFor={`category-${category.slug}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                <Input placeholder="Enter image URL" {...field} value={field.value || ''} />
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
                <Input placeholder="Enter cover image URL" {...field} value={field.value || ''} />
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
                  value={field.value || ''}
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
                  value={field.value === undefined ? '' : field.value}
                  onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="is_popular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-muted p-3 shadow-sm">
                <FormLabel className="text-sm mr-2">Popular</FormLabel>
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
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-muted p-3 shadow-sm">
                <FormLabel className="text-sm mr-2">New</FormLabel>
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
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-muted p-3 shadow-sm">
                <FormLabel className="text-sm mr-2">Featured</FormLabel>
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
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-muted p-3 shadow-sm">
                <FormLabel className="text-sm mr-2">Show on Home</FormLabel>
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
              <Select onValueChange={field.onChange} value={field.value || 'active'} defaultValue={field.value || 'active'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
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
                <Input placeholder="Enter direct launch URL (if any)" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default GameForm;

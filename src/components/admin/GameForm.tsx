import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GameProvider, GameCategory, DbGame } from '@/types';
import { toast } from 'sonner';

const gameFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  provider_slug: z.string().min(1, 'Provider is required'),
  category_slugs: z.array(z.string()).min(1, 'At least one category is required'),
  rtp: z.coerce.number().min(0).max(100).optional().nullable(),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
  description: z.string().optional().nullable(),
  cover: z.string().url('Must be a valid URL').optional().nullable(),
  banner: z.string().url('Must be a valid URL').optional().nullable(),
  is_popular: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  show_home: z.boolean().default(false),
  tags: z.string().optional().nullable().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(Boolean) : []),
  features: z.string().optional().nullable().transform(val => val ? val.split(',').map(feat => feat.trim()).filter(Boolean) : []),
  themes: z.string().optional().nullable().transform(val => val ? val.split(',').map(theme => theme.trim()).filter(Boolean) : []),
  volatility: z.enum(['low', 'medium', 'high', '']).optional().nullable(),
  lines: z.coerce.number().int().positive().optional().nullable(),
  min_bet: z.coerce.number().positive().optional().nullable(),
  max_bet: z.coerce.number().positive().optional().nullable(),
  release_date: z.string().optional().nullable().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  game_id: z.string().optional().nullable(), // External game ID from provider
  game_code: z.string().optional().nullable(), // Specific game code
});

type GameFormValues = z.infer<typeof gameFormSchema>;

export interface GameFormProps {
  onSubmit: (data: GameFormValues) => Promise<void>;
  initialGameData?: Partial<DbGame> | null;
  providers: GameProvider[];
  categories: GameCategory[];
  onCancel: () => void; // Added onCancel
}

const GameForm: React.FC<GameFormProps> = ({ onSubmit, initialGameData, providers, categories, onCancel }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialGameData?.category_slugs || []);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: initialGameData?.title || '',
      slug: initialGameData?.slug || '',
      provider_slug: initialGameData?.provider_slug || '',
      category_slugs: Array.isArray(initialGameData?.category_slugs) ? initialGameData.category_slugs : (typeof initialGameData?.category_slugs === 'string' ? [initialGameData.category_slugs] : []),
      rtp: initialGameData?.rtp || undefined,
      status: initialGameData?.status || 'active',
      description: initialGameData?.description || '',
      cover: initialGameData?.cover || '',
      banner: initialGameData?.banner || '',
      is_popular: initialGameData?.is_popular || false,
      is_new: initialGameData?.is_new || false,
      is_featured: initialGameData?.is_featured || false,
      show_home: initialGameData?.show_home || false,
      tags: initialGameData?.tags?.join(', ') || '',
      features: initialGameData?.features?.join(', ') || '',
      themes: initialGameData?.themes?.join(', ') || '',
      volatility: initialGameData?.volatility || '',
      lines: initialGameData?.lines || undefined,
      min_bet: initialGameData?.min_bet || undefined,
      max_bet: initialGameData?.max_bet || undefined,
      release_date: initialGameData?.release_date || '',
      game_id: initialGameData?.game_id || '',
      game_code: initialGameData?.game_code || '',
    },
  });

  useEffect(() => {
    if (initialGameData) {
      const categorySlugs = Array.isArray(initialGameData.category_slugs) 
        ? initialGameData.category_slugs 
        : typeof initialGameData.category_slugs === 'string' 
        ? [initialGameData.category_slugs] 
        : [];
      reset({
        ...initialGameData,
        rtp: initialGameData.rtp ?? undefined,
        status: initialGameData.status ?? 'active',
        tags: initialGameData.tags?.join(', ') || '',
        features: initialGameData.features?.join(', ') || '',
        themes: initialGameData.themes?.join(', ') || '',
        category_slugs: categorySlugs,
        volatility: initialGameData.volatility ?? '',
        lines: initialGameData.lines ?? undefined,
        min_bet: initialGameData.min_bet ?? undefined,
        max_bet: initialGameData.max_bet ?? undefined,
        release_date: initialGameData.release_date ?? '',
      });
      setSelectedCategories(categorySlugs);
    } else {
      reset(gameFormSchema.parse({})); // Reset to default empty/valid state
      setSelectedCategories([]);
    }
  }, [initialGameData, reset]);
  
  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategories(prev =>
      prev.includes(categorySlug)
        ? prev.filter(slug => slug !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  useEffect(() => {
    // Update react-hook-form's value for category_slugs when selectedCategories changes
    // This might not be directly needed if Controller handles it, but good for explicit sync
    control.setValue('category_slugs', selectedCategories, { shouldValidate: true });
  }, [selectedCategories, control]);


  const processSubmit = async (data: GameFormValues) => {
    try {
      // Ensure category_slugs is an array for submission
      const dataToSubmit = {
        ...data,
        category_slugs: selectedCategories,
      };
      await onSubmit(dataToSubmit);
    } catch (error) {
      toast.error('Submission failed. Please check the form.');
      console.error('Form submission error:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title Field */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Controller name="title" control={control} render={({ field }) => <Input id="title" {...field} />} />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        {/* Slug Field */}
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Controller name="slug" control={control} render={({ field }) => <Input id="slug" {...field} />} />
          {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
        </div>

        {/* Provider Select */}
        <div>
          <Label htmlFor="provider_slug">Provider</Label>
          <Controller
            name="provider_slug"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="provider_slug"><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>
                  {providers.map(p => <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {errors.provider_slug && <p className="text-red-500 text-sm">{errors.provider_slug.message}</p>}
        </div>

        {/* Status Select */}
        <div>
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
        </div>
      </div>

      {/* Categories Checkboxes */}
      <div>
        <Label>Categories</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2 border rounded-md max-h-48 overflow-y-auto">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.slug}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => handleCategoryChange(category.slug)}
              />
              <Label htmlFor={`category-${category.slug}`} className="font-normal">{category.name}</Label>
            </div>
          ))}
        </div>
        {errors.category_slugs && <p className="text-red-500 text-sm">{errors.category_slugs.message}</p>}
      </div>
      
       {/* RTP */}
        <div>
          <Label htmlFor="rtp">RTP (%)</Label>
          <Controller name="rtp" control={control} render={({ field }) => <Input id="rtp" type="number" step="0.01" {...field} value={field.value ?? ''} />} />
          {errors.rtp && <p className="text-red-500 text-sm">{errors.rtp.message}</p>}
        </div>
        
        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Controller name="description" control={control} render={({ field }) => <Textarea id="description" {...field} value={field.value ?? ''} />} />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        {/* Cover Image URL */}
        <div>
          <Label htmlFor="cover">Cover Image URL</Label>
          <Controller name="cover" control={control} render={({ field }) => <Input id="cover" {...field} value={field.value ?? ''} />} />
          {errors.cover && <p className="text-red-500 text-sm">{errors.cover.message}</p>}
        </div>

        {/* Banner Image URL */}
        <div>
          <Label htmlFor="banner">Banner Image URL</Label>
          <Controller name="banner" control={control} render={({ field }) => <Input id="banner" {...field} value={field.value ?? ''} />} />
          {errors.banner && <p className="text-red-500 text-sm">{errors.banner.message}</p>}
        </div>
        
        {/* Tags */}
        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Controller name="tags" control={control} render={({ field }) => <Input id="tags" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value ?? ''} />} />
        </div>

        {/* Features */}
        <div>
          <Label htmlFor="features">Features (comma-separated)</Label>
          <Controller name="features" control={control} render={({ field }) => <Input id="features" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value ?? ''} />} />
        </div>

        {/* Themes */}
        <div>
          <Label htmlFor="themes">Themes (comma-separated)</Label>
          <Controller name="themes" control={control} render={({ field }) => <Input id="themes" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value ?? ''} />} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Volatility */}
            <div>
                <Label htmlFor="volatility">Volatility</Label>
                <Controller
                    name="volatility"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? ''}>
                            <SelectTrigger id="volatility"><SelectValue placeholder="Select volatility" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="">N/A</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
            {/* Lines */}
            <div>
                <Label htmlFor="lines">Lines</Label>
                <Controller name="lines" control={control} render={({ field }) => <Input id="lines" type="number" {...field} value={field.value ?? ''} />} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Min Bet */}
            <div>
                <Label htmlFor="min_bet">Min Bet</Label>
                <Controller name="min_bet" control={control} render={({ field }) => <Input id="min_bet" type="number" step="0.01" {...field} value={field.value ?? ''} />} />
            </div>
            {/* Max Bet */}
            <div>
                <Label htmlFor="max_bet">Max Bet</Label>
                <Controller name="max_bet" control={control} render={({ field }) => <Input id="max_bet" type="number" step="0.01" {...field} value={field.value ?? ''} />} />
            </div>
        </div>
        
        {/* Release Date */}
        <div>
            <Label htmlFor="release_date">Release Date (YYYY-MM-DD)</Label>
            <Controller name="release_date" control={control} render={({ field }) => <Input id="release_date" type="date" {...field} value={field.value ?? ''} />} />
            {errors.release_date && <p className="text-red-500 text-sm">{errors.release_date.message}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Game ID (External) */}
            <div>
                <Label htmlFor="game_id">Provider Game ID</Label>
                <Controller name="game_id" control={control} render={({ field }) => <Input id="game_id" {...field} value={field.value ?? ''} />} />
            </div>
            {/* Game Code */}
            <div>
                <Label htmlFor="game_code">Internal Game Code</Label>
                <Controller name="game_code" control={control} render={({ field }) => <Input id="game_code" {...field} value={field.value ?? ''} />} />
            </div>
        </div>


      {/* Boolean Flags */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Controller name="is_popular" control={control} render={({ field }) => <Checkbox id="is_popular" checked={field.value} onCheckedChange={field.onChange} />} />
          <Label htmlFor="is_popular">Popular</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Controller name="is_new" control={control} render={({ field }) => <Checkbox id="is_new" checked={field.value} onCheckedChange={field.onChange} />} />
          <Label htmlFor="is_new">New</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Controller name="is_featured" control={control} render={({ field }) => <Checkbox id="is_featured" checked={field.value} onCheckedChange={field.onChange} />} />
          <Label htmlFor="is_featured">Featured</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Controller name="show_home" control={control} render={({ field }) => <Checkbox id="show_home" checked={field.value} onCheckedChange={field.onChange} />} />
          <Label htmlFor="show_home">Show on Home</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (initialGameData ? 'Updating...' : 'Adding...') : (initialGameData ? 'Update Game' : 'Add Game')}
        </Button>
      </div>
    </form>
  );
};

export default GameForm;

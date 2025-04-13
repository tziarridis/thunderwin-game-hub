
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Game, GameProvider } from '@/types';
import { Loader2 } from 'lucide-react';

// Define schema for game form
const gameSchema = z.object({
  title: z.string().min(3, { message: 'Game title must be at least 3 characters' }),
  provider: z.string().min(1, { message: 'Provider is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  image: z.string().url({ message: 'Please enter a valid URL' }).optional(),
  description: z.string().optional(),
  rtp: z.coerce.number().min(80).max(100),
  volatility: z.string(),
  minBet: z.coerce.number().min(0.01),
  maxBet: z.coerce.number().min(1),
  isPopular: z.boolean().default(false),
  isNew: z.boolean().default(false),
  jackpot: z.boolean().default(false),
});

type GameFormValues = z.infer<typeof gameSchema>;

interface GameFormProps {
  onSubmit: (gameData: Game | Omit<Game, 'id'>) => void;
  initialData?: Game;
  providers?: GameProvider[];
}

const GameForm = ({ onSubmit, initialData, providers = [] }: GameFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Setup form with default values
  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      title: initialData?.title || '',
      provider: initialData?.provider && typeof initialData.provider === 'object' 
        ? initialData.provider.id : typeof initialData?.provider === 'string' 
        ? initialData.provider : '',
      category: initialData?.category || 'slots',
      image: initialData?.image || '',
      description: initialData?.description || '',
      rtp: initialData?.rtp || 96,
      volatility: initialData?.volatility || 'medium',
      minBet: initialData?.minBet || 0.1,
      maxBet: initialData?.maxBet || 100,
      isPopular: initialData?.isPopular || false,
      isNew: initialData?.isNew || false,
      jackpot: initialData?.jackpot || false,
    },
  });
  
  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || '',
        provider: initialData.provider && typeof initialData.provider === 'object' 
          ? initialData.provider.id : typeof initialData.provider === 'string' 
          ? initialData.provider : '',
        category: initialData.category || 'slots',
        image: initialData.image || '',
        description: initialData.description || '',
        rtp: initialData.rtp || 96,
        volatility: initialData.volatility || 'medium',
        minBet: initialData.minBet || 0.1,
        maxBet: initialData.maxBet || 100,
        isPopular: initialData.isPopular || false,
        isNew: initialData.isNew || false,
        jackpot: initialData.jackpot || false,
      });
    }
  }, [initialData, form]);
  
  const handleSubmit = async (values: GameFormValues) => {
    setIsSubmitting(true);
    try {
      const gameData: Omit<Game, 'id'> = {
        ...values,
        isFavorite: false,
        releaseDate: new Date().toISOString(),
        tags: []
      };
      
      if (initialData?.id) {
        onSubmit({
          ...gameData,
          id: initialData.id,
        });
      } else {
        onSubmit(gameData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const categories = [
    { id: 'slots', name: 'Slots' },
    { id: 'table', name: 'Table Games' },
    { id: 'live', name: 'Live Casino' },
    { id: 'crash', name: 'Crash Games' },
    { id: 'poker', name: 'Poker' },
    { id: 'scratch', name: 'Scratch Cards' },
  ];
  
  const volatilityOptions = [
    { id: 'low', name: 'Low' },
    { id: 'medium', name: 'Medium' },
    { id: 'high', name: 'High' },
  ];
  
  // Default providers if none are provided
  const defaultProviders = [
    { id: '1', name: 'Pragmatic Play' },
    { id: '2', name: 'Evolution Gaming' },
    { id: '3', name: 'NetEnt' },
    { id: '4', name: 'Microgaming' },
    { id: '5', name: 'Play\'n GO' },
  ];
  
  const availableProviders = providers.length > 0 
    ? providers 
    : defaultProviders;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableProviders.map((provider) => (
                      <SelectItem 
                        key={provider.id} 
                        value={provider.id.toString()}
                      >
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="image"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter game description" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="rtp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RTP (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="96" 
                    min="80" 
                    max="100" 
                    step="0.01" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="minBet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Bet</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.10" 
                    min="0.01" 
                    step="0.01" 
                    {...field} 
                  />
                </FormControl>
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
                  <Input 
                    type="number" 
                    placeholder="100" 
                    min="1" 
                    step="1" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="volatility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volatility</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select volatility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {volatilityOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="isPopular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer">Popular Game</FormLabel>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isNew"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer">New Game</FormLabel>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="jackpot"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer">Has Jackpot</FormLabel>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="submit" 
            className="bg-casino-thunder-green text-black" 
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update Game' : 'Add Game'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GameForm;

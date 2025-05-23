
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DbGame, GameProvider, GameCategory } from '@/types';

export interface GameFormProps {
  onCancel: () => void;
  onSave: (values: Partial<DbGame>) => void;
  initialData?: Partial<DbGame>;
  categories: GameCategory[];
  providers: GameProvider[];
  isLoading?: boolean;
}

const GameForm: React.FC<GameFormProps> = ({
  onCancel,
  onSave,
  initialData,
  categories,
  providers,
  isLoading = false
}) => {
  const form = useForm<Partial<DbGame>>({
    defaultValues: initialData || {
      game_name: '',
      game_code: '',
      provider_id: '',
      status: 'active',
      rtp: 96,
      is_featured: false,
      is_popular: false,
      show_home: false
    }
  });

  const onSubmit = (data: Partial<DbGame>) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="game_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="provider_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id.toString()}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Game'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GameForm;

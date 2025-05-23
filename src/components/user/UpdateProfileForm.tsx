
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  avatar_url: z.string().url('Invalid URL format').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const UpdateProfileForm: React.FC = () => {
  const { user, fetchAndUpdateUser } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      avatar_url: user?.avatar_url || '',
    },
  });

  React.useEffect(() => {
    if (user) {
      reset({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast.error('You must be logged in to update your profile.');
      return;
    }

    const updates: Partial<ProfileFormData> = {};
    if (data.username && data.username !== user.username) updates.username = data.username;
    if (data.first_name && data.first_name !== user.first_name) updates.first_name = data.first_name;
    if (data.last_name && data.last_name !== user.last_name) updates.last_name = data.last_name;
    if (data.avatar_url && data.avatar_url !== user.avatar_url) updates.avatar_url = data.avatar_url;

    if (Object.keys(updates).length === 0) {
      toast.info('No changes to save.');
      return;
    }
    
    // Here, 'users' is assumed to be your public table storing user profiles, linked by id to auth.users
    const { error } = await supabase
      .from('users') // Or 'profiles' if that's your table name
      .update(updates)
      .eq('id', user.id);

    if (error) {
      toast.error(`Failed to update profile: ${error.message}`);
    } else {
      toast.success('Profile updated successfully!');
      await fetchAndUpdateUser(); // Refresh user data in AuthContext
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register('username')} />
            {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input id="first_name" {...register('first_name')} />
            {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input id="last_name" {...register('last_name')} />
            {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input id="avatar_url" type="url" {...register('avatar_url')} />
            {errors.avatar_url && <p className="text-sm text-red-500">{errors.avatar_url.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UpdateProfileForm;

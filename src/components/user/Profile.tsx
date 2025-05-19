
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
// import { userService } from '@/services/userService'; // If you have a specific service for user updates

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional().or(z.literal('')),
  full_name: z.string().optional(),
  avatar_url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  // email: z.string().email(), // Email typically not changed here directly, or requires verification
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile: React.FC = () => {
  const { user, loading, updateUserMetadata } = useAuth(); // Assuming updateUserMetadata exists in AuthContext

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      full_name: '',
      avatar_url: '',
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.user_metadata?.username || '',
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast.error('User not authenticated.');
      return;
    }
    try {
      // Construct payload ensuring we don't send undefined if value is empty string converting to undefined for Supabase
      const metadataToUpdate = {
        username: data.username || undefined,
        full_name: data.full_name || undefined,
        avatar_url: data.avatar_url || undefined,
      };
      
      await updateUserMetadata(metadataToUpdate); // Call the method from AuthContext
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile.');
    }
  };

  if (loading) {
    return <p>Loading profile...</p>; // Replace with a skeleton loader
  }

  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-2xl">My Profile</CardTitle>
          <CardDescription>Update your personal information. Your email is {user.email}.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Controller
                name="username"
                control={control}
                render={({ field }) => <Input id="username" placeholder="Your cool username" {...field} />}
              />
              {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => <Input id="full_name" placeholder="Your full name" {...field} />}
              />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Controller
                name="avatar_url"
                control={control}
                render={({ field }) => <Input id="avatar_url" placeholder="https://example.com/avatar.png" {...field} />}
              />
              {errors.avatar_url && <p className="text-sm text-red-500">{errors.avatar_url.message}</p>}
            </div>
             {user.user_metadata.avatar_url && (
                <div className="flex items-center space-x-3">
                    <img src={user.user_metadata.avatar_url} alt="Current avatar" className="h-16 w-16 rounded-full object-cover" />
                    <p className="text-xs text-muted-foreground">Current avatar</p>
                </div>
            )}

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Profile;


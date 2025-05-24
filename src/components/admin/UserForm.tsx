
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';
import { toast } from 'sonner';

const userFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).optional(),
  full_name: z.string().optional(),
  avatar_url: z.string().url({ message: "Invalid URL." }).optional().or(z.literal('')),
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'banned']).default('active'),
  kyc_status: z.enum(['verified', 'pending', 'rejected', 'not_submitted']).default('not_submitted'),
  currency: z.string().optional(),
  language: z.string().optional(),
  vip_level: z.coerce.number().int().min(0).optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User | null;
  onSave: (data: UserFormValues, userId?: string) => Promise<void>;
  isEditing?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, isEditing = false }) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email || '',
      username: user?.user_metadata?.username || '',
      full_name: user?.user_metadata?.full_name || '',
      avatar_url: user?.user_metadata?.avatar_url || '',
      role: user?.role || 'user', // default to 'user'
      status: (user?.status as 'active' | 'inactive' | 'banned') || 'active',
      kyc_status: (user?.user_metadata?.kyc_status as 'verified' | 'pending' | 'rejected' | 'not_submitted') || 'not_submitted',
      currency: user?.user_metadata?.currency || 'USD',
      language: user?.user_metadata?.language || 'en',
      vip_level: user?.user_metadata?.vip_level || 0,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || '',
        username: user.user_metadata?.username || '',
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        role: user.role || 'user',
        status: (user.status as 'active' | 'inactive' | 'banned') || 'active',
        kyc_status: (user.user_metadata?.kyc_status as 'verified' | 'pending' | 'rejected' | 'not_submitted') || 'not_submitted',
        currency: user.user_metadata?.currency || 'USD',
        language: user.user_metadata?.language || 'en',
        vip_level: user.user_metadata?.vip_level || 0,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      await onSave(data, user?.id);
      toast.success(`User ${isEditing ? 'updated' : 'created'} successfully.`);
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} user.`);
      console.error(error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" {...form.register('email')} />
        {form.formState.errors.email && <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...form.register('username')} />
        {form.formState.errors.username && <p className="text-red-500 text-sm">{form.formState.errors.username.message}</p>}
      </div>
      <div>
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" {...form.register('full_name')} />
      </div>
      <div>
        <Label htmlFor="avatar_url">Avatar URL</Label>
        <Input id="avatar_url" {...form.register('avatar_url')} />
        {form.formState.errors.avatar_url && <p className="text-red-500 text-sm">{form.formState.errors.avatar_url.message}</p>}
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Input id="role" {...form.register('role')} />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select 
          onValueChange={(value) => form.setValue('status', value as 'active' | 'inactive' | 'banned')} 
          defaultValue={form.getValues('status')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="kyc_status">KYC Status</Label>
        <Select 
          onValueChange={(value) => form.setValue('kyc_status', value as 'verified' | 'pending' | 'rejected' | 'not_submitted')} 
          defaultValue={form.getValues('kyc_status')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select KYC status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_submitted">Not Submitted</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="currency">Currency</Label>
        <Input id="currency" {...form.register('currency')} />
      </div>
       <div>
        <Label htmlFor="language">Language</Label>
        <Input id="language" {...form.register('language')} />
      </div>
      <div>
        <Label htmlFor="vip_level">VIP Level</Label>
        <Input id="vip_level" type="number" {...form.register('vip_level')} />
        {form.formState.errors.vip_level && <p className="text-red-500 text-sm">{form.formState.errors.vip_level.message}</p>}
      </div>
      
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create User')}
      </Button>
    </form>
  );
};

export default UserForm;


import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types'; // Assuming User type is defined in types/index.d.ts
import { toast } from 'sonner';

// Define Zod schema based on User type properties
const userFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['user', 'admin', 'editor']).optional(),
  status: z.enum(['active', 'pending', 'suspended', 'banned']).optional(), // Added suspended
  vip_level: z.number().min(0).optional(),
  banned: z.boolean().optional(),
  
  // User Metadata fields - all optional
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(), // Making phone optional and part of metadata for form simplicity
  birthdate: z.string().optional(), // Expecting YYYY-MM-DD
  kyc_status: z.enum(['pending', 'approved', 'rejected', 'none']).optional(),
  two_factor_enabled: z.boolean().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: UserFormData, userId?: string) => Promise<void>;
  isEditing?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, isEditing = false }) => {
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      role: 'user',
      status: 'active',
      vip_level: 0,
      banned: false,
      first_name: '',
      last_name: '',
      country: '',
      city: '',
      address: '',
      phone: '',
      birthdate: '',
      kyc_status: 'none',
      two_factor_enabled: false,
      currency: 'USD',
      language: 'en',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'user',
        status: user.status || 'active',
        vip_level: user.vip_level || 0,
        banned: user.banned || false,
        // Access metadata safely
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        country: user.user_metadata?.country || '',
        city: user.user_metadata?.city || '',
        address: user.user_metadata?.address || '',
        phone: user.phone || user.user_metadata?.phone || '', // Prioritize top-level phone
        birthdate: user.user_metadata?.birthdate || '',
        kyc_status: user.user_metadata?.kyc_status || 'none',
        two_factor_enabled: user.user_metadata?.two_factor_enabled || false,
        currency: user.user_metadata?.currency || 'USD',
        language: user.user_metadata?.language || 'en',
      });
    }
  }, [user, reset]);

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data, user?.id);
      toast.success(isEditing ? 'User updated successfully!' : 'User created successfully!');
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Failed to save user.'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Fields */}
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" {...register('username')} />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
        </div>
        <div>
          <Label htmlFor="vip_level">VIP Level</Label>
          <Input id="vip_level" type="number" {...register('vip_level', { valueAsNumber: true })} />
          {errors.vip_level && <p className="text-red-500 text-sm mt-1">{errors.vip_level.message}</p>}
        </div>
        <div className="flex items-center space-x-2 pt-6">
            <Controller
                name="banned"
                control={control}
                render={({ field }) => (
                    <Switch id="banned" checked={field.value} onCheckedChange={field.onChange} />
                )}
            />
            <Label htmlFor="banned">Banned</Label>
            {errors.banned && <p className="text-red-500 text-sm mt-1">{errors.banned.message}</p>}
        </div>
      </div>

      <h3 className="text-lg font-medium border-t pt-6 mt-6">User Details (Optional)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" {...register('first_name')} />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" {...register('last_name')} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} />
        </div>
        <div>
          <Label htmlFor="birthdate">Birthdate (YYYY-MM-DD)</Label>
          <Input id="birthdate" type="date" {...register('birthdate')} />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register('country')} />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register('address')} />
        </div>
        <div>
          <Label htmlFor="currency">Preferred Currency</Label>
          <Input id="currency" {...register('currency')} />
        </div>
        <div>
          <Label htmlFor="language">Preferred Language</Label>
          <Input id="language" {...register('language')} />
        </div>
        <div>
          <Label htmlFor="kyc_status">KYC Status</Label>
           <Controller
            name="kyc_status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select KYC status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
         <div className="flex items-center space-x-2 pt-6">
            <Controller
                name="two_factor_enabled"
                control={control}
                render={({ field }) => (
                    <Switch id="two_factor_enabled" checked={field.value} onCheckedChange={field.onChange} />
                )}
            />
            <Label htmlFor="two_factor_enabled">2FA Enabled</Label>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create User')}
      </Button>
    </form>
  );
};

export default UserForm;


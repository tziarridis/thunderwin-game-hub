import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Checkbox not used, can remove
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User as GlobalUserType } from '@/types/user'; // Using global User type
import { toast } from 'sonner';

// This form schema defines the data structure for the form itself.
const userFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).optional(),
  firstName: z.string().optional(), // was full_name
  lastName: z.string().optional(), // new field
  avatarUrl: z.string().url({ message: "Invalid URL." }).optional().or(z.literal('')), // was avatar_url
  roles: z.array(z.string()).optional(), // Changed from role (string) to roles (string array)
  status: z.enum(['active', 'inactive', 'banned', 'pending']).default('active'), // Added pending
  // kyc_status: z.enum(['verified', 'pending', 'rejected', 'not_submitted']).default('not_submitted'), // Assuming this meta field is handled if needed
  currency: z.string().optional(), // Assuming this meta field is handled if needed
  language: z.string().optional(), // Assuming this meta field is handled if needed
  vipLevel: z.coerce.number().int().min(0).optional(), // was vip_level
  isActive: z.boolean().optional(), // for mapping to status
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: GlobalUserType | null; // Use the global User type
  onSave: (data: Partial<GlobalUserType>, userId?: string) => Promise<void>; // Submitting subset of GlobalUserType
  isEditing?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, isEditing = false }) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email || '',
      username: user?.username || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      avatarUrl: user?.avatarUrl || '',
      roles: user?.roles || ['user'], // Default to ['user']
      isActive: user?.isActive === undefined ? true : user.isActive, // Default to true if undefined
      // Map isActive to form 'status'
      status: user?.isActive === false ? 'inactive' : 'active', 
      // Fields like kyc_status, currency, language, vipLevel would be part of extended user profile/wallet
      // For now, focusing on core User model fields
      // kyc_status: user?.user_metadata?.kyc_status || 'not_submitted',
      // currency: user?.user_metadata?.currency || 'USD',
      // language: user?.user_metadata?.language || 'en',
      // vipLevel: user?.user_metadata?.vip_level || 0,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || '',
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        avatarUrl: user.avatarUrl || '',
        roles: user.roles || ['user'],
        isActive: user.isActive === undefined ? true : user.isActive,
        status: user.isActive === false ? 'inactive' : (user.isActive === true ? 'active' : 'pending'),
        // kyc_status: user.user_metadata?.kyc_status || 'not_submitted',
        // currency: user.user_metadata?.currency || 'USD',
        // language: user.user_metadata?.language || 'en',
        // vipLevel: user.user_metadata?.vip_level || 0,
      });
    } else {
        form.reset({ // Default for new user
            email: '',
            username: '',
            firstName: '',
            lastName: '',
            avatarUrl: '',
            roles: ['user'],
            isActive: true,
            status: 'pending',
        });
    }
  }, [user, form]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      // Map form values to GlobalUserType structure for saving
      const userPayload: Partial<GlobalUserType> = {
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
        roles: data.roles,
        isActive: data.status === 'active' || data.status === 'pending', // Map back
        // Other fields like phone, inviterCode etc. from GlobalUserType could be added here
      };
      // Fields like kyc_status, currency, language, vipLevel would need separate handling
      // if they are stored in a different table (e.g. user_profiles or wallets)

      await onSave(userPayload, user?.id);
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
        <Label htmlFor="firstName">First Name</Label>
        <Input id="firstName" {...form.register('firstName')} />
      </div>
      <div>
        <Label htmlFor="lastName">Last Name</Label>
        <Input id="lastName" {...form.register('lastName')} />
      </div>
      <div>
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input id="avatarUrl" {...form.register('avatarUrl')} />
        {form.formState.errors.avatarUrl && <p className="text-red-500 text-sm">{form.formState.errors.avatarUrl.message}</p>}
      </div>
      <div>
        <Label htmlFor="roles">Roles (comma separated, e.g., user,editor)</Label>
        <Input 
            id="roles" 
            {...form.register('roles', { 
                setValueAs: (value: string) => value ? value.split(',').map(s => s.trim()).filter(Boolean) : [],
                valueAsString: true, // To get string from array for display
            })} 
            defaultValue={user?.roles?.join(',')}
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select onValueChange={(value) => form.setValue('status', value as 'active' | 'inactive' | 'banned' | 'pending')} defaultValue={form.getValues('status')}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* KYC Status, Currency, Language, VIP Level are examples of extended profile data
          These would require their own form fields and data handling if they are part of this form.
          For now, they are commented out to focus on core User fields.
      <div>
        <Label htmlFor="kyc_status">KYC Status</Label>
        ...
      </div>
      <div>
        <Label htmlFor="currency">Currency</Label>
        ...
      </div>
       <div>
        <Label htmlFor="language">Language</Label>
        ...
      </div>
      <div>
        <Label htmlFor="vip_level">VIP Level</Label>
        ...
      </div> 
      */}
      
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create User')}
      </Button>
    </form>
  );
};

export default UserForm;

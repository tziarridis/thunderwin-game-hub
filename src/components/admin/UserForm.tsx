
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User } from '@/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

// Define Zod schema for user form validation
const userFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  status: z.string().optional(), // e.g., 'active', 'pending_verification', 'suspended'
  banned: z.boolean().optional(),
  role: z.string().optional(), // e.g., 'user', 'admin', 'moderator' (string role from User type)
  // role_id: z.number().optional(), // If using numeric role IDs
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  birthdate: z.string().optional(), // Could be z.date() if using a date picker
  kyc_status: z.string().optional(), // e.g., 'not_submitted', 'pending', 'approved', 'rejected'
  two_factor_enabled: z.boolean().optional(),
  vip_level: z.number().int().min(0).optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, isLoading }) => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email || '',
      username: user?.username || '',
      first_name: user?.user_metadata?.first_name || user?.first_name || '',
      last_name: user?.user_metadata?.last_name || user?.last_name ||  '',
      avatar_url: user?.user_metadata?.avatar_url || '',
      status: user?.status || 'active',
      banned: user?.banned || false,
      role: user?.role || 'user',
      // role_id: user?.role_id || undefined, // Map from string role if needed
      country: user?.country || '',
      city: user?.city || '',
      address: user?.address || '',
      phone: user?.phone || '',
      birthdate: user?.birthdate || '',
      kyc_status: user?.kyc_status || 'not_submitted',
      two_factor_enabled: user?.two_factor_enabled || false,
      vip_level: user?.vip_level || 0,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || '',
        username: user.username || '',
        first_name: user.user_metadata?.first_name || user.first_name || '',
        last_name: user.user_metadata?.last_name || user.last_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        status: user.status || 'active',
        banned: user.banned || false,
        role: user.role || 'user',
        country: user.country || '',
        city: user.city || '',
        address: user.address || '',
        phone: user.phone || '',
        birthdate: user.birthdate || '',
        kyc_status: user.kyc_status || 'not_submitted',
        two_factor_enabled: user.two_factor_enabled || false,
        vip_level: user.vip_level || 0,
      });
    }
  }, [user, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="avatar_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar URL</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthdate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birthdate</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    {/* Add other roles as needed */}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    <SelectItem value="pending_verification">Pending Verification</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kyc_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KYC Status</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select KYC status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="not_submitted">Not Submitted</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vip_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VIP Level</FormLabel>
                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
           <FormField
            control={form.control}
            name="banned"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Banned</FormLabel>
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
            name="two_factor_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>2FA Enabled</FormLabel>
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
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserForm;

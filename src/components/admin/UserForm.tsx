import React, { useState, useEffect } from 'react';
import { User } from '@/types'; // Assuming User type includes all necessary fields
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

// Define a more specific type for form data, using User properties
type UserFormData = Partial<Omit<User, 'id' | 'app_metadata' | 'user_metadata' | 'identities' | 'aud' | 'role' | 'email_confirmed_at' | 'phone' | 'confirmed_at' | 'last_sign_in_at'>> & {
  // Include fields that are directly editable and part of your custom User structure
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  status?: 'active' | 'inactive' | 'banned'; // Maps to User['status']
  vip_level?: number; // Maps to User['vip_level']
  // Add other fields as needed from your User type that are form-editable
  // For example, if these are stored in user_metadata or a linked profile:
  country?: string;
  city?: string;
  address?: string;
  birthdate?: string; // as string 'YYYY-MM-DD'
  kyc_status?: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  two_factor_enabled?: boolean;
  email_verified?: boolean; // Typically from Supabase auth user
  // Any other custom fields
  role_id?: number; // Custom role ID from your users table
  banned?: boolean; // Custom banned flag
};


interface UserFormProps {
  user?: User | null;
  onSubmit: (userData: UserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<UserFormData>({});

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        username: user.username || user.user_metadata?.username,
        first_name: user.first_name || user.user_metadata?.full_name?.split(' ')[0],
        last_name: user.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
        avatar_url: user.avatar_url || user.user_metadata?.avatar_url,
        status: user.status || 'active',
        banned: user.banned || false,
        vip_level: user.vip_level || 0,
        role_id: user.role_id || 3, // Default to a 'user' role_id if applicable
        // Map other User properties to form fields
        country: user.country, // Assuming these exist on User type
        city: user.city,
        address: user.address,
        birthdate: user.birthdate, // Expects YYYY-MM-DD string
        kyc_status: user.kyc_status,
        two_factor_enabled: user.two_factor_enabled,
        email_verified: user.user_metadata?.email_verified,
      });
    } else {
      // Reset form for new user
      setFormData({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        avatar_url: '',
        status: 'active',
        banned: false,
        vip_level: 0,
        role_id: 3, // Default role_id
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name: keyof UserFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
        toast.error("Email is required.");
        return;
    }
    try {
      await onSubmit(formData);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit user form.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" value={formData.username || ''} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" name="first_name" value={formData.first_name || ''} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" name="last_name" value={formData.last_name || ''} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="avatar_url">Avatar URL</Label>
          <Input id="avatar_url" name="avatar_url" value={formData.avatar_url || ''} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status || 'active'} onValueChange={(value) => handleSelectChange('status', value)}>
            <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="vip_level">VIP Level</Label>
          <Input id="vip_level" name="vip_level" type="number" value={formData.vip_level || 0} onChange={handleChange} />
        </div>
         <div>
          <Label htmlFor="role_id">Role ID (e.g. 1 Admin, 2 Mod, 3 User)</Label>
          <Input id="role_id" name="role_id" type="number" value={formData.role_id || 3} onChange={handleChange} />
        </div>
        {/* Add more fields as needed, e.g., country, city, etc. */}
         <div>
          <Label htmlFor="birthdate">Birthdate</Label>
          <Input id="birthdate" name="birthdate" type="date" value={formData.birthdate || ''} onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <div className="flex items-center space-x-2">
            <Checkbox id="banned" name="banned" checked={!!formData.banned} onCheckedChange={(checked) => setFormData(prev => ({...prev, banned: !!checked}))} />
            <Label htmlFor="banned">Is Banned</Label>
        </div>
         <div className="flex items-center space-x-2">
            <Checkbox id="two_factor_enabled" name="two_factor_enabled" checked={!!formData.two_factor_enabled} onCheckedChange={(checked) => setFormData(prev => ({...prev, two_factor_enabled: !!checked}))} />
            <Label htmlFor="two_factor_enabled">Two-Factor Auth Enabled</Label>
        </div>
         <div className="flex items-center space-x-2">
            <Checkbox id="email_verified" name="email_verified" checked={!!formData.email_verified} onCheckedChange={(checked) => setFormData(prev => ({...prev, email_verified: !!checked}))} />
            <Label htmlFor="email_verified">Email Verified</Label>
        </div>
      </div>
      

      <div className="flex justify-end space-x-3 pt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (user?.id ? 'Save Changes' : 'Create User')}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;

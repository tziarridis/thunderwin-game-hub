import React, { useState, useEffect } from 'react';
import { User } from '@/types'; // User type from main types
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface UserFormProps {
  initialValues?: User;
  onSubmit: (data: Partial<User>) => void;
}

// Define a type for the form data based on User, but allowing for partial updates
type UserFormData = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>>;


const UserForm = ({ initialValues, onSubmit }: UserFormProps) => {
  const [formData, setFormData] = useState<UserFormData>({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        username: initialValues.username || '',
        email: initialValues.email || '',
        firstName: initialValues.firstName || '',
        lastName: initialValues.lastName || '',
        displayName: initialValues.displayName || '',
        avatar: initialValues.avatar || '', // or avatar_url
        role: initialValues.role || 'user',
        isActive: initialValues.isActive !== undefined ? initialValues.isActive : true,
        balance: initialValues.balance || 0,
        currency: initialValues.currency || 'USD',
        vipLevel: initialValues.vipLevel || 0,
        country: initialValues.country || '',
        city: initialValues.city || '',
        address: initialValues.address || '',
        phone: initialValues.phone || '',
        birthdate: initialValues.birthdate || '', // Changed from birthDate
        kycStatus: initialValues.kycStatus || 'not_submitted',
        twoFactorEnabled: initialValues.twoFactorEnabled || false,
        emailVerified: initialValues.emailVerified || false,
      });
    } else {
      // Default for new user
      setFormData({
        username: '',
        email: '',
        role: 'user',
        isActive: true,
        kycStatus: 'not_submitted',
        emailVerified: false,
        twoFactorEnabled: false,
        vipLevel: 0,
        balance: 0,
        currency: 'USD'
        // ... other defaults
      });
    }
  }, [initialValues]);

  const handleChange = (field: keyof UserFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Construct the object with all known User fields, even if partial
    const submitData: Partial<User> = { ...formData };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username || ''}
            onChange={(e) => handleChange('username', e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="balance">Balance (Informational)</Label>
          <Input
            id="balance"
            type="number"
            step="0.01"
            value={formData.balance || 0}
            onChange={(e) => handleChange('balance', parseFloat(e.target.value))}
          />
        </div>
        
        <div>
          <Label htmlFor="vipLevel">VIP Level</Label>
          <Select
            value={String(formData.vipLevel || 0)}
            onValueChange={(value) => handleChange('vipLevel', parseInt(value))}
          >
            <SelectTrigger id="vipLevel">
              <SelectValue placeholder="Select VIP Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Level 0</SelectItem>
              <SelectItem value="1">Level 1</SelectItem>
              <SelectItem value="2">Level 2</SelectItem>
              <SelectItem value="3">Level 3</SelectItem>
              <SelectItem value="4">Level 4</SelectItem>
              <SelectItem value="5">Level 5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="isActive">Status (Is Active)</Label>
          <Switch
            id="isActive"
            checked={formData.isActive || false}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
          />
        </div>
        
        <div>
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role || 'user'}
            onValueChange={(value) => handleChange('role', value as User['role'])}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="kycStatus">KYC Status</Label>
           <Select
            value={formData.kycStatus || 'not_submitted'}
            onValueChange={(value) => handleChange('kycStatus', value as User['kycStatus'])}
          >
            <SelectTrigger id="kycStatus">
              <SelectValue placeholder="Select KYC Status" />
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
          <Label htmlFor="emailVerified">Email Verified</Label>
          <Switch
            id="emailVerified"
            checked={formData.emailVerified || false}
            onCheckedChange={(checked) => handleChange('emailVerified', checked)}
          />
        </div>

        <div>
          <Label htmlFor="twoFactorEnabled">2FA Enabled</Label>
          <Switch
            id="twoFactorEnabled"
            checked={formData.twoFactorEnabled || false}
            onCheckedChange={(checked) => handleChange('twoFactorEnabled', checked)}
          />
        </div>

        <div>
          <Label htmlFor="birthdate">Birth Date</Label>
          <Input
            id="birthdate"
            type="date"
            value={formData.birthdate ? formData.birthdate.toString().split('T')[0] : ''}
            onChange={(e) => handleChange('birthdate', e.target.value)}
          />
        </div>

      </div>
      
      <div className="flex justify-end">
        <Button type="submit">
          {initialValues?.id ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;

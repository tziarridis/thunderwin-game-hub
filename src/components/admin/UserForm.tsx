
import React, { useState } from 'react';
import { User } from '@/types';
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
  onSubmit: (data: any) => void;
}

const UserForm = ({ initialValues, onSubmit }: UserFormProps) => {
  const [formData, setFormData] = useState<Partial<User>>(
    initialValues || {
      name: '',
      username: '',
      email: '',
      balance: 0,
      isAdmin: false,
      vipLevel: 1,
      isVerified: false,
      status: 'Active' as const,
      joined: new Date().toISOString().split('T')[0],
      favoriteGames: [],
      role: 'user' as const,
    }
  );

  const handleChange = (field: keyof User, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        
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
          <Label htmlFor="balance">Balance</Label>
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
            value={String(formData.vipLevel || 1)}
            onValueChange={(value) => handleChange('vipLevel', parseInt(value))}
          >
            <SelectTrigger id="vipLevel">
              <SelectValue placeholder="Select VIP Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Level 1</SelectItem>
              <SelectItem value="2">Level 2</SelectItem>
              <SelectItem value="3">Level 3</SelectItem>
              <SelectItem value="4">Level 4</SelectItem>
              <SelectItem value="5">Level 5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status || 'Active'}
            onValueChange={(value) => handleChange('status', value as "Active" | "Pending" | "Inactive")}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role || 'user'}
            onValueChange={(value) => handleChange('role', value as "admin" | "user")}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <div className="flex items-center space-x-2 h-full">
            <Switch
              id="isAdmin"
              checked={formData.isAdmin || false}
              onCheckedChange={(checked) => handleChange('isAdmin', checked)}
            />
            <Label htmlFor="isAdmin">Administrator</Label>
          </div>
        </div>
        
        <div>
          <div className="flex items-center space-x-2 h-full">
            <Switch
              id="isVerified"
              checked={formData.isVerified || false}
              onCheckedChange={(checked) => handleChange('isVerified', checked)}
            />
            <Label htmlFor="isVerified">Verified</Label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit">
          {initialValues ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;

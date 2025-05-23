
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, UserRole } from '@/types';

// Mock user data
const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  username: 'testuser',
  role: UserRole.USER,
  status: 'active',
  created_at: new Date().toISOString(),
  balance: 1000, // Added balance property
};

const roleOptions = [
  { value: UserRole.USER, label: 'User' },
  { value: UserRole.ADMIN, label: 'Admin' },
  { value: UserRole.SUPPORT, label: 'Support' },
  { value: UserRole.MANAGER, label: 'Manager' },
  { value: UserRole.VIP_PLAYER, label: 'VIP Player' },
  { value: UserRole.AFFILIATE, label: 'Affiliate' }
];

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User>(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(mockUser);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData(user);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(user);
  };

  const handleSave = async () => {
    try {
      // Mock save operation
      setUser(formData);
      setIsEditing(false);
      toast.success('User profile updated successfully');
    } catch (error) {
      toast.error('Failed to update user profile');
    }
  };

  const handleInputChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              {isEditing ? (
                <Input
                  id="username"
                  value={formData.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                />
              ) : (
                <p className="mt-1">{user.username}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <p className="mt-1">{user.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              {isEditing ? (
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-1 capitalize">{user.role}</p>
              )}
            </div>

            <div>
              <Label htmlFor="balance">Balance</Label>
              {isEditing ? (
                <Input
                  id="balance"
                  type="number"
                  value={formData.balance || 0}
                  onChange={(e) => handleInputChange('balance', parseFloat(e.target.value))}
                />
              ) : (
                <p className="mt-1">${user.balance || 0}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;

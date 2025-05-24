
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UserForm from '@/components/admin/UserForm';
import { User, UserRole } from '@/types';
import { ArrowLeft, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock service
const mockUserService = {
  getUserById: async (userId: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: userId,
      email: 'user@example.com',
      username: 'testuser',
      role: UserRole.USER,
      status: 'active',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      balance: 1000,
      user_metadata: {
        username: 'testuser',
        full_name: 'Test User',
        avatar_url: '',
        kyc_status: 'pending',
        currency: 'USD',
        language: 'en',
        vip_level: 1,
      }
    };
  }
};

const AdminUserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);

  const { data: user, isLoading, error } = useQuery<User, Error>({
    queryKey: ['adminUser', userId],
    queryFn: () => mockUserService.getUserById(userId!),
    enabled: !!userId,
  });

  const handleSaveUser = async (formData: any, id?: string) => {
    console.log('Saving user:', formData, id);
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading user...</div>;
  }

  if (error || !user) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading user: {error?.message || 'User not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{user.username}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)}>
          <Edit className="mr-2 h-4 w-4" />
          {isEditing ? 'Cancel' : 'Edit User'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit User</CardTitle>
                <CardDescription>Update user information and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <UserForm 
                  user={user} 
                  onSave={handleSaveUser} 
                  isEditing={true} 
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                    <p className="text-sm">{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Balance</p>
                    <p className="text-sm">${user.balance?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">VIP Level</p>
                    <p className="text-sm">{user.user_metadata?.vip_level || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                View Transactions
              </Button>
              <Button variant="outline" className="w-full">
                Bonus History
              </Button>
              <Button variant="outline" className="w-full">
                Game Sessions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;

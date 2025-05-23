
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { User, UserRole, KycStatus as KycStatusEnum } from '@/types';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import UserInfoForm from '@/components/admin/UserInfoForm';
import KycStatusDisplay from '@/components/kyc/KycStatusDisplay';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

const availableRoles: UserRole[] = ['user', 'admin', 'support', 'manager', 'vip_player', 'affiliate'];
const availableStatuses: User['status'][] = ['active', 'inactive', 'pending_verification', 'banned', 'restricted'];

const AdminUserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  const { data: user, isLoading, error } = useQuery<User, Error>({
    queryKey: ['adminUser', userId],
    queryFn: () => userService.getUserById(userId!),
    enabled: !!userId,
  });

  const updateUserMutation = useMutation({
    mutationFn: (updatedData: Partial<User>) => userService.updateUser(userId!, updatedData),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['adminUser', userId], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User profile updated successfully!');
      setIsEditingInfo(false);
    },
    onError: (updateError: Error) => {
      toast.error(`Failed to update user: ${updateError.message}`);
    },
  });

  if (isLoading) return <AdminPageLayout title="User Profile"><div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AdminPageLayout>;
  if (error) return <AdminPageLayout title="User Profile"><div className="text-red-500 p-4">Error loading user: {error.message}</div></AdminPageLayout>;
  if (!user) return <AdminPageLayout title="User Profile"><div className="text-red-500 p-4">User not found.</div></AdminPageLayout>;

  const handleInfoSubmit = async (userData: User): Promise<void> => {
    updateUserMutation.mutate(userData);
  };

  const breadcrumbs = [
      { label: "Admin", href: "/admin" },
      { label: "Users", href: "/admin/users" },
      { label: user.username || user.email || userId! }
  ];

  const headerActions = (
    <div className="flex gap-2">
        <Button variant="outline" onClick={() => setIsEditingInfo(!isEditingInfo)} disabled={updateUserMutation.isPending}>
            <Edit className="mr-2 h-4 w-4" /> {isEditingInfo ? 'Cancel Edit' : 'Edit User Info'}
        </Button>
    </div>
  );

  return (
    <AdminPageLayout title={`User Profile: ${user.username || user.email}`} breadcrumbs={breadcrumbs} headerActions={headerActions}>
      <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users List
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>{user.username || 'N/A'}</span>
                <Badge variant={user.is_active ? 'default' : 'destructive'}>{user.is_active ? 'Active' : 'Inactive'}</Badge>
            </CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Role:</strong> <Badge variant="secondary">{user.role || 'N/A'}</Badge></p>
            <p><strong>Status:</strong> <Badge variant={user.status === 'active' ? 'default' : 'outline'}>{user.status || 'N/A'}</Badge></p>
            <p><strong>Joined:</strong> {format(new Date(user.created_at), 'PPpp')}</p>
            <p><strong>Last Login:</strong> {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'PPpp') : 'N/A'}</p>
            <p><strong>KYC Status:</strong> <KycStatusDisplay status={user.kyc_status as KycStatusEnum || 'not_started'} /></p>
            <p><strong>Balance:</strong> {user.balance?.toFixed(2) || '0.00'} {user.currency || 'N/A'}</p>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          {isEditingInfo ? (
            <Card>
              <CardHeader><CardTitle>Edit User Information</CardTitle></CardHeader>
              <CardContent>
                <UserInfoForm 
                    initialData={{
                        username: user.username || '',
                        email: user.email || '',
                        first_name: user.first_name || '',
                        last_name: user.last_name || '',
                        role: user.role,
                        status: user.status,
                        is_active: user.is_active,
                        is_banned: user.is_banned,
                        is_verified: user.is_verified,
                    }} 
                    onSubmit={handleInfoSubmit} 
                    isLoading={updateUserMutation.isPending}
                    availableRoles={availableRoles}
                    availableUserStatuses={availableStatuses}
                />
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
                <TabsTrigger value="settings">User Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <Card>
                  <CardHeader><CardTitle>Detailed Information</CardTitle></CardHeader>
                  <CardContent>
                    <p><strong>First Name:</strong> {user.first_name || 'N/A'}</p>
                    <p><strong>Last Name:</strong> {user.last_name || 'N/A'}</p>
                    <p><strong>Phone:</strong> {user.phone_number || 'N/A'}</p>
                    <p><strong>Date of Birth:</strong> {user.date_of_birth ? format(new Date(user.date_of_birth), 'PP') : 'N/A'}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="transactions" className="mt-4">
                <p>User transactions list placeholder.</p>
              </TabsContent>
              <TabsContent value="activity" className="mt-4">
                <p>User activity log placeholder.</p>
              </TabsContent>
              <TabsContent value="settings" className="mt-4">
                <p>User specific settings and controls placeholder (e.g., limits, 2FA status).</p>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default AdminUserProfilePage;

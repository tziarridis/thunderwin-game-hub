// src/pages/admin/UserProfile.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, UserRole, UserStatus } from '@/types';
import { KycStatus } from '@/types/kyc';
import UserInfoForm from '@/components/admin/UserInfoForm';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import KycStatusDisplay from '@/components/kyc/KycStatusDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserCog, Ban, AlertOctagon, MailCheck } from 'lucide-react';

const AdminUserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Simulated fetch, replace with actual useQuery and userService.getUserById(userId)
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    if (userId) {
      // Simulate fetching user data
      // const fetchedUser = await userService.getUserById(userId);
      // setUser(fetchedUser);
      const mockUserFromDb = { // This represents data coming from your DB for 'users' table
        id: userId,
        username: `user_${userId.substring(0,5)}`,
        email: `user_${userId.substring(0,5)}@example.com`,
        avatar_url: null,
        first_name: 'John',
        last_name: 'Doe',
        role: 'user' as UserRole, // Assuming 'user' is a valid UserRole
        status: 'active' as UserStatus,
        is_verified: true,
        is_banned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        // Other fields that might be in your 'users' table directly
        // Example: balance, currency might be on users table or wallet table
        balance: 100.00,
        currency: "USD",
        // Fields from AppUser/Supabase User that might not be on your 'users' table directly
        // but are needed for the full User type from user.d.ts
        // These would typically be merged or have defaults
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { custom_field: 'value' },
        isActive: true,
        // Additional fields from the extended User type in user.d.ts:
        name: `John Doe user_${userId.substring(0,5)}`, // Combined or from profile
        avatar: null, // Often same as avatar_url
        joined: new Date().toISOString(), // Often same as created_at
        phone: '123-456-7890',
        lastLogin: new Date().toISOString(), // Often same as last_sign_in_at
        favoriteGames: ['game1', 'game2'],
        profile: { bio: 'Loves playing slots.' }, // Could be a JSONB field
        isStaff: false,
        isAdmin: false, // Derived from role
        roles: ['user' as UserRole], // Array of roles
        kycStatus: 'approved' as KycStatus,
        referralCode: `REF-${userId.substring(0,5)}`,
        referralLink: `/ref/REF-${userId.substring(0,5)}`,
        // Ensure banned is also present if UserInfoForm expects it (it's in User type)
        banned: false,
      };
      setUser(mockUserFromDb as User); // Cast as User, ensure all fields are covered
      setIsLoading(false);
    } else {
      setError(new Error("User ID is missing."));
      setIsLoading(false);
    }
  }, [userId]);


  const userMutation = useMutation({
    mutationFn: async (updatedUserData: Partial<User>) => {
      if (!userId) throw new Error("User ID is missing");
      // await userService.updateUser(userId, updatedUserData);
      return Promise.resolve(); // Placeholder
    },
    onSuccess: () => {
      toast.success("User profile updated successfully.");
      // refetch(); // If using useQuery
      // For local state, you might update it or re-fetch
    },
    onError: (e: Error) => {
      toast.error(`Failed to update user: ${e.message}`);
    },
  });

  const handleUserInfoSubmit = (data: Partial<User>) => {
    userMutation.mutate(data);
  };

  // ... other handlers for banning, KYC, transactions, etc.

  if (isLoading) return <AdminPageLayout title="User Profile"><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div></AdminPageLayout>;
  if (error) return <AdminPageLayout title="User Profile"><div className="text-red-500 p-4">Error: {error.message}</div></AdminPageLayout>;
  if (!user) return <AdminPageLayout title="User Profile"><div className="text-muted-foreground p-4">User not found.</div></AdminPageLayout>;

  // Ensure the 'user' object passed to UserInfoForm matches the props UserInfoForm expects.
  // UserInfoForm is read-only, so we adapt 'user' to it.
  // The error TS2739 indicates 'user' is missing many properties.
  // The mockUserFromDb above now includes many of these.
  // The cast `as User` above needs to be valid.

  return (
    <AdminPageLayout title={`User Profile: ${user.username || user.email}`} breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users", href: "/admin/users" }, {label: "Profile"}]}>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview & Edit</TabsTrigger>
          <TabsTrigger value="wallet">Wallet & Balance</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="kyc">KYC Status</TabsTrigger>
          <TabsTrigger value="support">Support Tickets</TabsTrigger>
          <TabsTrigger value="actions">Admin Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>View and edit user details.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Ensure 'user' object here has all properties UserInfoForm expects (which is 'User' type) */}
              <UserInfoForm initialData={user} onSubmit={handleUserInfoSubmit} isLoading={userMutation.isPending} />
            </CardContent>
          </Card>
          {/* Other cards for stats, recent activity, etc. */}
        </TabsContent>

        <TabsContent value="wallet">
          {/* Wallet details, balance adjustments */}
          <Card><CardHeader><CardTitle>Wallet Management</CardTitle></CardHeader><CardContent><p>Wallet details coming soon...</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="transactions">
          {/* List of user's transactions */}
          <Card><CardHeader><CardTitle>User Transactions</CardTitle></CardHeader><CardContent><p>Transaction list coming soon...</p></CardContent></Card>
        </TabsContent>
        {/* ... other TabsContent ... */}
         <TabsContent value="activity">
          <Card><CardHeader><CardTitle>User Activity Log</CardTitle></CardHeader><CardContent><p>Activity log coming soon...</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="kyc">
           <Card>
            <CardHeader><CardTitle>KYC Information</CardTitle></CardHeader>
            <CardContent>
                <KycStatusDisplay status={user.kycStatus} />
                {/* Further KYC details and actions */}
                <p className="mt-2 text-sm text-muted-foreground">KYC management features coming soon.</p>
            </CardContent>
           </Card>
        </TabsContent>
         <TabsContent value="support">
          <Card><CardHeader><CardTitle>Support Tickets</CardTitle></CardHeader><CardContent><p>Support ticket history coming soon...</p></CardContent></Card>
        </TabsContent>
         <TabsContent value="actions">
          <Card>
            <CardHeader><CardTitle>Admin Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <Button variant="destructive" onClick={() => alert(`Confirm ban user ${user.id}? (not implemented)`)} disabled={user.is_banned}>
                    {user.is_banned ? <Ban className="mr-2 h-4 w-4" /> : <AlertOctagon className="mr-2 h-4 w-4" />}
                    {user.is_banned ? 'User is Banned' : 'Ban User'}
                </Button>
                 <Button variant="outline" onClick={() => alert(`Trigger email verification for ${user.email}? (not implemented)`)} disabled={user.is_verified}>
                    <MailCheck className="mr-2 h-4 w-4" />
                    {user.is_verified ? 'Email Verified' : 'Send Verification Email'}
                </Button>
                 {/* More actions like reset password, assign role etc. */}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </AdminPageLayout>
  );
};

export default AdminUserProfilePage;

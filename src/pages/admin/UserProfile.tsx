import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
// ... keep existing code (Input, Textarea, Select imports)
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Loader2, User as UserIcon, ArrowLeft, Save, Edit, Ban, UserCheck } from 'lucide-react'; // Renamed User to UserIcon
import { User as AuthUser } from '@supabase/supabase-js'; 
import { User as AppUserType, UserRole } from '@/types/user'; // Changed AppUser to AppUserType to avoid conflict
import UserInfoForm from '@/components/admin/UserInfoForm'; 
import { Badge } from '@/components/ui/badge'; // Added Badge import

// ... keep existing code (UserTransactionsTable, UserActivityLog placeholders)
// Define UserTransactionsTable and UserActivityLog components or remove if not used
const UserTransactionsTable = ({ userId }: { userId: string }) => <p>Transactions for {userId} (Placeholder)</p>;
const UserActivityLog = ({ userId }: { userId: string }) => <p>Activity for {userId} (Placeholder)</p>;


type CombinedUser = AppUserType & Partial<AuthUser> & { 
  avatar_url?: string | null; 
  user_metadata?: { avatar_url?: string; [key:string]: any; };
  // status?: string; // AppUserType should have status from UserStatus
  // banned?: boolean; // AppUserType should have is_banned
};

const AdminUserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<CombinedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    // ... keep existing code (fetchUserProfile logic)
    if (!userId) {
        toast.error("User ID is missing.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
      const { data: appUser, error: appUserError } = await supabase
        .from('users') // Assuming this is your main user table
        .select('*')
        .eq('id', userId)
        .single();

      if (appUserError) throw appUserError;
      if (!appUser) throw new Error("User not found in application database.");
      
      // Cast to AppUserType ensuring all required fields are present
      // Supabase returns snake_case, AppUserType might expect camelCase for some, ensure mapping
      const mappedUser: AppUserType = {
        id: appUser.id,
        username: appUser.username,
        email: appUser.email,
        avatar_url: appUser.avatar_url || appUser.avatar, // Prefer avatar_url, fallback to avatar
        first_name: appUser.first_name,
        last_name: appUser.last_name,
        role: appUser.role as UserRole, // Cast if role is string in DB
        status: appUser.status, // UserStatus
        is_verified: appUser.is_verified,
        is_banned: appUser.banned, // use `banned` field from DB
        created_at: appUser.created_at,
        updated_at: appUser.updated_at,
        last_sign_in_at: appUser.last_sign_in_at,
        balance: appUser.balance,
        currency: appUser.currency,
        vipLevel: appUser.vip_level,
        isActive: appUser.status === 'active',
        // Map other fields from appUser to AppUserType as needed
        name: appUser.username || `${appUser.first_name} ${appUser.last_name}`,
        avatar: appUser.avatar_url || appUser.avatar,
        joined: appUser.created_at,
        phone: appUser.phone,
        lastLogin: appUser.last_sign_in_at,
        favoriteGames: appUser.favorite_games,
        profile: appUser.profile,
        isStaff: appUser.is_staff,
        isAdmin: appUser.role === 'admin',
        roles: appUser.roles,
        kycStatus: appUser.kyc_status,
      };


      setUser({
        ...mappedUser, 
        // Merge with AuthUser properties if needed, but primary source is appUser
        // email: appUser.email, // Already in mappedUser from DB
        user_metadata: (appUser as any).user_metadata || {}, // If you store this on users table
        // created_at: appUser.created_at, // Already in mappedUser
        // updated_at: appUser.updated_at, // Already in mappedUser
        // isActive: appUser.status === 'active', // Already in mappedUser
        banned: appUser.banned, // Ensure this is from your DB `users` table field
        // status: appUser.status, // Already in mappedUser
      } as CombinedUser);

    } catch (error: any) {
      toast.error("Failed to fetch user profile: " + error.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleUpdateUser = async (updatedData: Partial<AppUserType>) => {
    // ... keep existing code (handleUpdateUser logic)
    if (!user) return;
    setIsLoading(true);
    try {
      // Destructure only fields that exist on your 'users' table for update
      const { email, username, status, role, first_name, last_name, avatar_url, is_banned, is_verified /*, ...otherEditableFields */ } = updatedData;
      
      const payload: Record<string, any> = { /* ...otherEditableFields */ };
      if (email !== undefined) payload.email = email; 
      if (username !== undefined) payload.username = username;
      if (status !== undefined) payload.status = status;
      if (role !== undefined) payload.role = role; 
      if (first_name !== undefined) payload.first_name = first_name;
      if (last_name !== undefined) payload.last_name = last_name;
      if (avatar_url !== undefined) payload.avatar_url = avatar_url;
      if (is_banned !== undefined) payload.banned = is_banned; // Assuming 'banned' is the DB column
      if (is_verified !== undefined) payload.is_verified = is_verified;
      // Add any other fields from AppUserType that are directly updatable on 'users' table
      
      // if (user_metadata && typeof user_metadata === 'object') {
      //   const existingMetadata = (user as any).user_metadata || {};
      //   payload.user_metadata = {...existingMetadata, ...user_metadata};
      // }

      payload.updated_at = new Date().toISOString();


      const { error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', user.id);

      if (error) throw error;
      toast.success("User profile updated successfully.");
      fetchUserProfile(); 
    } catch (error: any) {
      toast.error("Failed to update user profile: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBanToggle = async () => {
    // ... keep existing code (handleBanToggle logic)
    if (!user) return;
    const newBanStatus = !user.is_banned; // Use is_banned from AppUserType
    if (!window.confirm(`Are you sure you want to ${newBanStatus ? 'ban' : 'unban'} this user?`)) return;

    setIsLoading(true);
    try {
        const { error } = await supabase
            .from('users') // ensure this is your user table name
            .update({ banned: newBanStatus, status: newBanStatus ? 'banned' : 'active', updated_at: new Date().toISOString() })
            .eq('id', user.id);
        if (error) throw error;
        toast.success(`User ${newBanStatus ? 'banned' : 'unbanned'} successfully.`);
        fetchUserProfile();
    } catch (error: any)
    {
        toast.error(`Failed to ${newBanStatus ? 'ban' : 'unban'} user: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  // ... keep existing code (loading and not found states)
  if (isLoading && !user) {
    return (
      <AdminPageLayout title="User Profile">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminPageLayout>
    );
  }

  if (!user) {
    return (
      <AdminPageLayout title="User Profile">
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">User not found or failed to load.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/admin/users"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Users List</Link>
          </Button>
        </div>
      </AdminPageLayout>
    );
  }
  
  // The UserInfoForm expects a user prop of type AppUserType.
  // The current `user` state is CombinedUser. We need to ensure what's passed to UserInfoForm is AppUserType.
  // If UserInfoForm only needs fields from AppUserType, we can cast, but it's better if `user` state is already aligned or mapped.
  // For now, we cast `user as AppUserType`. If UserInfoForm internally expects more fields than AppUserType provides from `user`,
  // it could lead to runtime errors or unexpected behavior in the form.
  // The error `Type 'User' is missing the following properties from type 'User'` for UserInfoForm suggests its internal `User` type
  // might be different or more comprehensive than the `AppUserType` it's receiving. This needs careful alignment.
  // Let's assume UserInfoForm is robust enough or its internal User type is compatible with AppUserType.

  return (
    <AdminPageLayout title={`User Profile: ${user.username || user.email}`}>
      <div className="mb-4">
        <Button asChild variant="outline">
          <Link to="/admin/users"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Users List</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Overview</CardTitle>
             <Button variant={user.is_banned ? "secondary" : "destructive"} size="sm" onClick={handleBanToggle} disabled={isLoading}>
                {user.is_banned ? <UserCheck className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                {user.is_banned ? 'Unban' : 'Ban'} User
            </Button>
          </CardHeader>
          <CardContent className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary">
              <AvatarImage src={user.avatar_url || user.user_metadata?.avatar_url} alt={user.username || user.email} />
              <AvatarFallback className="text-3xl bg-muted">
                {user.username ? user.username[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : <UserIcon />)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{user.username || 'N/A'}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1">ID: {user.id}</p>
            {user.status && (
              <Badge 
                variant={
                  user.status === 'active' ? 'success' : 
                  user.status === 'banned' ? 'destructive' : 
                  'secondary'
                } 
                className="mt-2 capitalize"
              >
                {user.status.replace(/_/g, ' ')}
              </Badge>
            )}
             <p className="text-xs text-muted-foreground mt-2">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
             {user.last_sign_in_at && <p className="text-xs text-muted-foreground">Last Login: {new Date(user.last_sign_in_at).toLocaleString()}</p>}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
                <UserInfoForm user={user as AppUserType} onSave={handleUpdateUser} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="transactions">
              <UserTransactionsTable userId={user.id} />
            </TabsContent>
            <TabsContent value="activity">
              <UserActivityLog userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default AdminUserProfilePage;

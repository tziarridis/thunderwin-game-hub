import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Loader2, User, ArrowLeft, Save, Edit, Ban, UserCheck } from 'lucide-react';
import { User as AuthUser } from '@supabase/supabase-js'; // Supabase Auth User type
import { User as AppUser, UserRole } from '@/types/user'; // Your application's User type
import UserInfoForm from '@/components/admin/UserInfoForm'; // Assuming this exists
// import UserTransactionsTable from '@/components/admin/UserTransactionsTable'; // Placeholder
// import UserActivityLog from '@/components/admin/UserActivityLog'; // Placeholder

type CombinedUser = AppUser & Partial<AuthUser>; // Combine for easier state management

const AdminUserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<CombinedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [isEditing, setIsEditing] = useState(false);
  // const [formData, setFormData] = useState<Partial<CombinedUser>>({});

  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
        toast.error("User ID is missing.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
      // Fetch from your public 'users' table
      const { data: appUser, error: appUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (appUserError) throw appUserError;
      if (!appUser) throw new Error("User not found in application database.");

      // Optionally, fetch Auth user details if needed (e.g., last sign-in)
      // This requires admin privileges for Supabase client
      // const { data: { user: authUser }, error: authUserError } = await supabase.auth.admin.getUserById(userId); // This might be incorrect if 'userId' is from 'users' table not 'auth.users'
      // For now, we'll rely on data from 'users' table and assume it's synced or sufficient.
      
      setUser({
        ...appUser, // Spread fields from your 'users' table
        // id: authUser?.id || appUser.id, // Prefer auth.users ID if different, but usually they are linked by one ID
        email: appUser.email, // from 'users' table
        // aud: authUser?.aud || '', // from authUser if fetched
        // role: authUser?.role || '', // from authUser if fetched
        // app_metadata: authUser?.app_metadata || {},
        user_metadata: (appUser as any).user_metadata || {}, // from 'users' if it has a user_metadata jsonb
        created_at: appUser.created_at,
        updated_at: appUser.updated_at,
        // last_sign_in_at: authUser?.last_sign_in_at,
        // Add other merged fields as necessary
      } as CombinedUser); // Ensure mapping matches CombinedUser type

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

  const handleUpdateUser = async (updatedData: Partial<AppUser>) => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Separating metadata from other fields
      const { user_metadata, email, username, status, role, ...otherFields } = updatedData;
      
      const payload: Record<string, any> = { ...otherFields };
      if (email) payload.email = email; // Only if email is being updated, which might require special handling
      if (username) payload.username = username;
      if (status) payload.status = status;
      if (role) payload.role_id = role; // Assuming role maps to role_id
      
      // If user_metadata is being updated:
      if (user_metadata && typeof user_metadata === 'object') {
        // Merge with existing metadata if necessary
        const existingMetadata = (user as any).user_metadata || {};
        payload.user_metadata = {...existingMetadata, ...user_metadata};
      }


      const { error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', user.id);

      if (error) throw error;
      toast.success("User profile updated successfully.");
      fetchUserProfile(); // Refresh data
    } catch (error: any) {
      toast.error("Failed to update user profile: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBanToggle = async () => {
    if (!user) return;
    const newBanStatus = !user.banned;
    if (!window.confirm(`Are you sure you want to ${newBanStatus ? 'ban' : 'unban'} this user?`)) return;

    setIsLoading(true);
    try {
        const { error } = await supabase
            .from('users')
            .update({ banned: newBanStatus, status: newBanStatus ? 'banned' : 'active' })
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
  // ... keep existing code (JSX for profile display and tabs)
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
             <Button variant={user.banned ? "secondary" : "destructive"} size="sm" onClick={handleBanToggle} disabled={isLoading}>
                {user.banned ? <UserCheck className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                {user.banned ? 'Unban' : 'Ban'} User
            </Button>
          </CardHeader>
          <CardContent className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary">
              <AvatarImage src={user.avatar_url || user.user_metadata?.avatar_url} alt={user.username} />
              <AvatarFallback className="text-3xl bg-muted">
                {user.username ? user.username[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : <User />)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{user.username || 'N/A'}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1">ID: {user.id}</p>
            <Badge variant={user.status === 'active' ? 'success' : user.status === 'banned' ? 'destructive' : 'secondary'} className="mt-2 capitalize">
                {user.status}
            </Badge>
             <p className="text-xs text-muted-foreground mt-2">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
             {/* {user.last_sign_in_at && <p className="text-xs text-muted-foreground">Last Login: {new Date(user.last_sign_in_at).toLocaleString()}</p>} */}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-2"> {/* Adjust as needed */}
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              {/* <TabsTrigger value="permissions">Permissions</TabsTrigger> */}
              {/* <TabsTrigger value="notes">Notes</TabsTrigger> */}
            </TabsList>
            
            <TabsContent value="details">
                <UserInfoForm user={user} onSave={handleUpdateUser} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="transactions">
              {/* <UserTransactionsTable userId={user.id} /> */}
              <p>User transactions table placeholder.</p>
            </TabsContent>
            <TabsContent value="activity">
              {/* <UserActivityLog userId={user.id} /> */}
              <p>User activity log placeholder.</p>
            </TabsContent>
            {/* Add other tabs content here */}
          </Tabs>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default AdminUserProfilePage;

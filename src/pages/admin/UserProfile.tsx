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

type CombinedUser = AppUserType & Partial<AuthUser> & { 
  avatar_url?: string | null; 
  user_metadata?: { avatar_url?: string; [key:string]: any; };
  status?: string; // ensure status is part of CombinedUser
  banned?: boolean; // ensure banned is part of CombinedUser
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
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (appUserError) throw appUserError;
      if (!appUser) throw new Error("User not found in application database.");
      
      setUser({
        ...(appUser as AppUserType), // Spread fields from your 'users' table
        email: appUser.email!, 
        user_metadata: (appUser as any).user_metadata || {},
        created_at: appUser.created_at!,
        updated_at: appUser.updated_at!,
        // Ensure all required fields from AppUserType are present or optional
        isActive: appUser.status === 'active', // Example mapping for isActive
        banned: (appUser as any).banned || false,
        status: (appUser as any).status || 'unknown',
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
      const { user_metadata, email, username, status, role, ...otherFields } = updatedData;
      
      const payload: Record<string, any> = { ...otherFields };
      if (email) payload.email = email; 
      if (username) payload.username = username;
      if (status) payload.status = status;
      // Assuming role in updatedData is UserRole, and db expects role string or role_id
      if (role) payload.role = role; 
      
      if (user_metadata && typeof user_metadata === 'object') {
        const existingMetadata = (user as any).user_metadata || {};
        payload.user_metadata = {...existingMetadata, ...user_metadata};
      }

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
    const newBanStatus = !(user.banned || (user as any).is_banned); // Check both from CombinedUser and direct property
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
                {user.status}
              </Badge>
            )}
             <p className="text-xs text-muted-foreground mt-2">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
             {/* {user.last_sign_in_at && <p className="text-xs text-muted-foreground">Last Login: {new Date(user.last_sign_in_at).toLocaleString()}</p>} */}
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
              <p>User transactions table placeholder.</p>
            </TabsContent>
            <TabsContent value="activity">
              <p>User activity log placeholder.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default AdminUserProfilePage;

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client'; // If direct Supabase interaction is needed
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User, Edit3, ShieldCheck, ShieldAlert, Loader2, Eye, EyeOff, LogOut, KeyRound, UserCog } from 'lucide-react';
import { KycRequest, KycStatus } from '@/types/kyc'; // Assuming KycRequest and KycStatus types
import { kycService } from '@/services/kycService'; // Assuming kycService for fetching status
import KycStatusDisplay from '@/components/kyc/KycStatusDisplay'; // For displaying status
import KycForm from '@/components/kyc/KycForm'; // For KYC submission
import ChangePasswordForm from './ChangePasswordForm'; // Assuming this component exists
import UserSettings from './UserSettings'; // Assuming this component exists

const UserProfilePage = () => {
  const { user, loading: authLoading, updateUserPassword, signOut, refreshUser } = useAuth();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    email: '',
    username: '', // From public.users table
    firstName: '', // From public.profiles table
    lastName: '', // From public.profiles table
    avatarUrl: '', // From public.profiles table
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [kycRequest, setKycRequest] = useState<KycRequest | null>(null);
  const [kycLoading, setKycLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setProfileLoading(true);
        try {
          // Fetch from public.users for username
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('username')
            .eq('email', user.email) // Or use user.id if public.users.id === auth.users.id
            .single();

          if (usersError && usersError.code !== 'PGRST116') { // PGRST116: 0 rows, not an error if profile not created yet
             throw usersError;
          }
          
          // Fetch from public.profiles for first_name, last_name, avatar_url
          // Assuming user.id from AuthContext is the foreign key 'id' in profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('id', user.id) // This 'id' column in profiles table must match auth.users.id
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          setUserData({
            email: user.email || '',
            username: usersData?.username || user.user_metadata?.username || '',
            firstName: profileData?.first_name || user.user_metadata?.first_name || '',
            lastName: profileData?.last_name || user.user_metadata?.last_name || '',
            avatarUrl: profileData?.avatar_url || user.user_metadata?.avatar_url || '',
          });
        } catch (error: any) {
          toast.error(`Failed to fetch profile: ${error.message}`);
        } finally {
          setProfileLoading(false);
        }
      } else if (!authLoading) {
        setProfileLoading(false); // Not logged in, not loading profile
      }
    };

    const fetchKycStatus = async () => {
      if (user?.id) {
        setKycLoading(true);
        try {
          const requests = await kycService.getUserKycRequests(user.id);
          // Find the most recent or active request. For simplicity, taking the first one.
          if (requests && requests.length > 0) {
            setKycRequest(requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]);
          } else {
            setKycRequest(null);
          }
        } catch (error: any) {
          toast.error(`Failed to fetch KYC status: ${error.message}`);
          setKycRequest(null);
        } finally {
          setKycLoading(false);
        }
      } else if (!authLoading) {
        setKycLoading(false);
      }
    };

    fetchUserProfile();
    fetchKycStatus();
  }, [user, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveField = async (field: string) => {
    if (!user) return;
    setProfileLoading(true); // Indicate loading for this specific save
    try {
      let updatePayloadUsers: Partial<typeof userData> = {};
      let updatePayloadProfiles: Partial<typeof userData> = {};

      if (field === 'username' && userData.username !== (user.user_metadata?.username || '')) {
        // Update public.users table
        updatePayloadUsers = { username: userData.username };
        const { error } = await supabase.from('users').update({ username: userData.username }).eq('id', user.id); // Assuming user.id corresponds to public.users.id
        if (error) throw error;

      } else if ((field === 'firstName' && userData.firstName !== (user.user_metadata?.first_name || '')) ||
                 (field === 'lastName' && userData.lastName !== (user.user_metadata?.last_name || ''))) {
        // Update public.profiles table
        updatePayloadProfiles = {
            first_name: userData.firstName,
            last_name: userData.lastName,
        };
        // user.id from AuthContext IS the profiles.id (PK, FK to auth.users.id)
        const { error } = await supabase.from('profiles').update(updatePayloadProfiles).eq('id', user.id);
        if (error) throw error;
      }
      // Note: Email updates are more complex (verification) and usually handled separately or via updateUser from AuthContext
      // Avatar URL updates would involve file uploads, also more complex.

      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully.`);
      await refreshUser(); // Refresh user data in AuthContext
    } catch (error: any) {
      toast.error(`Failed to update ${field}: ${error.message}`);
    } finally {
      setEditingField(null);
      setProfileLoading(false);
    }
  };

  const handleKycSubmitted = async (requestId: string) => {
    // Refetch KYC status after submission
    if (user?.id) {
      setKycLoading(true);
      try {
        const updatedRequest = await kycService.getKycRequestById(requestId);
        setKycRequest(updatedRequest);
      } catch (error: any) {
        toast.error(`Failed to update KYC status: ${error.message}`);
      } finally {
        setKycLoading(false);
      }
    }
  };
  
  if (authLoading || profileLoading) {
    return <div className="container mx-auto p-4 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /> <p>Loading profile...</p></div>;
  }

  if (!user) {
    return <div className="container mx-auto p-4 text-center">Please log in to view your profile.</div>;
  }

  // Determine if KYC form should be shown
  const showKycForm = !kycRequest || kycRequest.status === 'rejected' || kycRequest.status === 'resubmit_required' || kycRequest.status === 'cancelled';
  // KycStatus type now includes 'resubmit_required'

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <Card className="mb-8 shadow-xl">
        <CardHeader className="flex flex-row items-center space-x-4">
          <img
            src={userData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.email}`}
            alt="User Avatar"
            className="w-20 h-20 rounded-full border-2 border-primary"
          />
          <div>
            <CardTitle className="text-2xl">{userData.firstName || userData.username || 'User Profile'}</CardTitle>
            <CardDescription>{userData.email}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4 inline-block" />Profile Details</TabsTrigger>
          <TabsTrigger value="security"><KeyRound className="mr-2 h-4 w-4 inline-block" />Security</TabsTrigger>
          <TabsTrigger value="kyc"><ShieldCheck className="mr-2 h-4 w-4 inline-block" />KYC Verification</TabsTrigger>
          <TabsTrigger value="settings"><UserCog className="mr-2 h-4 w-4 inline-block" />Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Username */}
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                {editingField === 'username' ? (
                  <div className="flex items-center gap-2">
                    <Input id="username" name="username" value={userData.username} onChange={handleInputChange} />
                    <Button onClick={() => handleSaveField('username')} size="sm">Save</Button>
                    <Button onClick={() => setEditingField(null)} variant="outline" size="sm">Cancel</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">{userData.username || 'Not set'}</p>
                    <Button onClick={() => setEditingField('username')} variant="ghost" size="sm"><Edit3 className="mr-2 h-4 w-4" />Edit</Button>
                  </div>
                )}
              </div>
              {/* First Name */}
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name</Label>
                {editingField === 'firstName' ? (
                   <div className="flex items-center gap-2">
                    <Input id="firstName" name="firstName" value={userData.firstName} onChange={handleInputChange} />
                    <Button onClick={() => handleSaveField('firstName')} size="sm">Save</Button>
                    <Button onClick={() => setEditingField(null)} variant="outline" size="sm">Cancel</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">{userData.firstName || 'Not set'}</p>
                    <Button onClick={() => setEditingField('firstName')} variant="ghost" size="sm"><Edit3 className="mr-2 h-4 w-4" />Edit</Button>
                  </div>
                )}
              </div>
              {/* Last Name */}
              <div className="space-y-1">
                <Label htmlFor="lastName">Last Name</Label>
                {editingField === 'lastName' ? (
                  <div className="flex items-center gap-2">
                    <Input id="lastName" name="lastName" value={userData.lastName} onChange={handleInputChange} />
                    <Button onClick={() => handleSaveField('lastName')} size="sm">Save</Button>
                    <Button onClick={() => setEditingField(null)} variant="outline" size="sm">Cancel</Button>
                  </div>
                ) : (
                   <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">{userData.lastName || 'Not set'}</p>
                    <Button onClick={() => setEditingField('lastName')} variant="ghost" size="sm"><Edit3 className="mr-2 h-4 w-4" />Edit</Button>
                  </div>
                )}
              </div>
              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <p className="text-muted-foreground">{userData.email}</p>
                <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact support if needed.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <ChangePasswordForm />
        </TabsContent>

        <TabsContent value="kyc">
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification</CardTitle>
              <CardDescription>Verify your identity to access all platform features.</CardDescription>
            </CardHeader>
            <CardContent>
              {kycLoading ? (
                <div className="text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /> <p>Loading KYC status...</p></div>
              ) : (
                <>
                  <KycStatusDisplay kycRequest={kycRequest} />
                  {showKycForm && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-lg font-semibold mb-4">
                        {kycRequest?.status === 'rejected' || kycRequest?.status === 'resubmit_required' ? 'Resubmit Documents' : 'Submit KYC Documents'}
                      </h3>
                      <KycForm onKycSubmitted={handleKycSubmitted} />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
            <UserSettings />
        </TabsContent>
      </Tabs>

      <div className="mt-12 text-center">
        <Button variant="destructive" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Log Out
        </Button>
      </div>
    </div>
  );
};

export default UserProfilePage;


import React, { useState, useEffect } from 'react';
import { useAuth, AppUser } from '@/contexts/AuthContext';
import UserLayout from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import KycStatusDisplay from '@/components/kyc/KycStatusDisplay'; // Placeholder import
import KycForm from '@/components/kyc/KycForm';
import ChangePasswordForm from '@/components/user/ChangePasswordForm'; // Placeholder import
import { KycRequest } from '@/types/kyc';
import { Loader2 } from 'lucide-react';

// Define types for profile data to be updated
interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string; // Corresponds to avatar_url in profiles table
  // email is handled by Supabase auth
}

interface UserSettingsProps {
  userId: string; // Add userId prop
}
// Placeholder UserSettings - can be expanded or moved to its own file
const UserSettings: React.FC<UserSettingsProps> = ({ userId }) => {
  // Fetch user settings based on userId if needed
  return (
    <div className="mt-8 p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Account Settings</h2>
      <ChangePasswordForm />
      {/* Add other settings like email preferences, 2FA setup etc. */}
      <p className="mt-4 text-sm text-muted-foreground">User ID: {userId}</p>
    </div>
  );
};


const UserProfilePageContent = () => {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileUpdateData>({
    firstName: '',
    lastName: '',
    username: '',
    avatarUrl: '',
  });
  const [kycRequest, setKycRequest] = useState<KycRequest | null>(null);
  const [showKycForm, setShowKycForm] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingKyc, setLoadingKyc] = useState(true);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || user.email?.split('@')[0] || '', // Fallback username
        avatarUrl: user.avatarUrl || '',
      });
      fetchKycStatus(user.id);
      setLoadingProfile(false);
    } else {
      setLoadingProfile(false); // Not logged in, nothing to load
      setLoadingKyc(false);
    }
  }, [user]);

  const fetchKycStatus = async (userId: string) => {
    setLoadingKyc(true);
    try {
      const { data, error } = await supabase
        .from('kyc_requests') // Assuming this is your KYC requests table
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
        toast.error(`Error fetching KYC status: ${error.message}`);
      } else {
        setKycRequest(data as KycRequest | null);
        // If no KYC request, or if it's rejected/resubmit, consider showing form
        if (!data || data.status === 'rejected' || data.status === 'resubmit_required') {
          // setShowKycForm(true); // Decide if form should auto-show
        } else {
          setShowKycForm(false);
        }
      }
    } catch (err: any) {
      toast.error(`An unexpected error occurred while fetching KYC status: ${err.message}`);
    } finally {
      setLoadingKyc(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoadingProfile(true);

    const updatePayload: { first_name?: string; last_name?: string; avatar_url?: string; /* Add username to public.users if exists */ } = {};
    if (profileData.firstName) updatePayload.first_name = profileData.firstName;
    if (profileData.lastName) updatePayload.last_name = profileData.lastName;
    if (profileData.avatarUrl) updatePayload.avatar_url = profileData.avatarUrl;
    // username update would target 'users' table typically

    try {
      // Update public.profiles table
      if (Object.keys(updatePayload).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', user.id); // Assuming user.id (auth.users.id) is PK for profiles

        if (profileError) throw profileError;
      }
      
      // Update username in public.users table if it exists there and is different
      if (user.username !== profileData.username && profileData.username) {
        const { error: userTableError } = await supabase
          .from('users') // Your public users table
          .update({ username: profileData.username })
          .eq('id', user.id); // Assuming user.id from auth is FK to your public.users.id or profiles.user_id links them

        if (userTableError) {
          // Handle username update error (e.g., if username is unique and taken)
          console.error("Error updating username in public.users:", userTableError);
          // Potentially revert profile update or notify user
        }
      }


      toast.success('Profile updated successfully!');
      await refreshUser(); // Refresh user data in AuthContext
    } catch (error: any) {
      toast.error(`Profile update failed: ${error.message}`);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleKycSubmitted = (requestId: string) => {
    if (user) fetchKycStatus(user.id); // Re-fetch KYC status
    setShowKycForm(false); // Hide form after submission
  };


  if (authLoading || (user && (loadingProfile || loadingKyc))) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  if (!user) {
    return (
      <UserLayout>
        <p className="text-center text-lg">Please log in to view your profile.</p>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-8">
        {/* Profile Details Form */}
        <form onSubmit={handleProfileUpdate} className="p-6 bg-card rounded-lg shadow-md space-y-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Profile Details</h2>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileData.avatarUrl || `https://avatar.vercel.sh/${user.email}.png`} alt={profileData.username} />
              <AvatarFallback>{profileData.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                type="url"
                value={profileData.avatarUrl}
                onChange={handleProfileChange}
                placeholder="https://example.com/avatar.png"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email (cannot be changed here)</Label>
              <Input id="email" type="email" value={user.email || ''} disabled className="bg-muted/50" />
            </div>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
              />
            </div>
          </div>
          <Button type="submit" disabled={loadingProfile} className="w-full sm:w-auto">
            {loadingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
            Update Profile
          </Button>
        </form>

        {/* KYC Section */}
        <div className="p-6 bg-card rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">KYC Verification</h2>
          {loadingKyc ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : kycRequest && !showKycForm ? (
            <>
              <KycStatusDisplay 
                kycStatus={kycRequest.status} 
                kycRequest={kycRequest} 
                onResubmit={() => setShowKycForm(true)} 
              />
              {(kycRequest.status === 'rejected' || kycRequest.status === 'resubmit_required') && !showKycForm && (
                 <Button onClick={() => setShowKycForm(true)} className="mt-4">
                    Submit New Documents
                 </Button>
              )}
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                {kycRequest ? "Please resubmit your documents." : "You have not submitted KYC documents yet. Please upload them for full account access."}
              </p>
              <KycForm onKycSubmitted={handleKycSubmitted} />
            </>
          )}
           {!kycRequest && !showKycForm && !loadingKyc && (
             <Button onClick={() => setShowKycForm(true)} className="mt-4">
                Start KYC Verification
             </Button>
           )}
        </div>
        
        {/* User Settings Section (e.g., Change Password) */}
        <UserSettings userId={user.id} />
      </div>
    </UserLayout>
  );
};

export default UserProfilePageContent;


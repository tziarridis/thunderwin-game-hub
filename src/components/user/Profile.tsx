
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, User, Edit3, Save, Camera } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChangePasswordForm from './ChangePasswordForm';
import UserActivity from './UserActivity';
import UserPreferences from './UserPreferences';
import KycStatusDisplay from '../kyc/KycStatusDisplay'; // Check if this path is correct for KycStatusDisplay
import UserSettings from '@/pages/user/Settings'; // Assuming UserSettings is a page component
import { KycRequest, KycStatus } from '@/types/kyc'; // Make sure KycStatus is defined
import TwoFactorAuthSettings from './TwoFactorAuthSettings';
import ProfileProgress from './ProfileProgress';

interface UserProfileData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  // Add other fields as necessary
}

const UserProfilePage = () => {
  const { user, updateUserMetadata, loading: authLoading, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newValues, setNewValues] = useState<Partial<UserProfileData>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [kycRequest, setKycRequest] = useState<KycRequest | null>(null); // State for KYC request details
  const [userKycStatus, setUserKycStatus] = useState<KycStatus | undefined>(undefined); // State for KYC status


  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email,
        username: user.user_metadata?.username || '',
        firstName: user.user_metadata?.firstName || user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.lastName || user.user_metadata?.last_name || '',
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.avatarUrl || '',
      });
      setAvatarPreview(user.user_metadata?.avatar_url || user.user_metadata?.avatarUrl || null);

      // Fetch KYC status and request details
      const fetchKycData = async () => {
        try {
          // Assuming KYC status is stored in user_metadata or a separate table
          setUserKycStatus(user.user_metadata?.kyc_status as KycStatus || 'not_submitted');
          
          // Fetch detailed KYC request if one exists (example, adjust to your schema)
          if (user.user_metadata?.kyc_request_id) {
            const { data: kycReqData, error: kycReqError } = await supabase
              .from('kyc_requests') // Replace with your actual KYC requests table name
              .select('*')
              .eq('id', user.user_metadata.kyc_request_id)
              .single();
            if (kycReqError) console.error("Error fetching KYC request:", kycReqError);
            else setKycRequest(kycReqData as KycRequest);
          }
        } catch (e) {
          console.error("Error fetching KYC data:", e);
        }
      };
      fetchKycData();
    }
  }, [user]);

  const handleEdit = (field: string) => {
    setEditingField(field);
    setNewValues({ ...newValues, [field]: profileData[field as keyof UserProfileData] || '' });
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setNewValues({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewValues({ ...newValues, [e.target.name]: e.target.value });
  };

  const handleSave = async (field: string) => {
    if (!user) return;
    setIsLoading(true);
    const valueToSave = newValues[field as keyof UserProfileData];

    try {
      // Map to Supabase user_metadata structure if different
      const metadataUpdate: Record<string, any> = {};
      if (field === 'username') metadataUpdate.username = valueToSave;
      if (field === 'firstName') metadataUpdate.first_name = valueToSave; // Use snake_case for Supabase
      if (field === 'lastName') metadataUpdate.last_name = valueToSave; // Use snake_case for Supabase
      
      // If other fields are directly on user object (e.g. email), handle separately
      // For now, assuming all editable fields are in user_metadata

      await updateUserMetadata(metadataUpdate);
      
      setProfileData(prev => ({ ...prev, [field]: valueToSave }));
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully.`);
      setEditingField(null);
      setNewValues({});
      refreshUser(); // Refresh user data from AuthContext
    } catch (error: any) {
      toast.error(`Failed to update ${field}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;
    setIsLoading(true);
    const fileName = `${user.id}/${Date.now()}_${avatarFile.name}`;
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars') // Make sure this bucket exists and has correct policies
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: true, // Overwrite if file with same name exists
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);
      
      const publicUrl = urlData.publicUrl;

      await updateUserMetadata({ avatar_url: publicUrl }); // Use snake_case for Supabase
      setProfileData(prev => ({ ...prev, avatarUrl: publicUrl }));
      setAvatarPreview(publicUrl);
      toast.success('Avatar updated successfully.');
      setAvatarFile(null);
      refreshUser();
    } catch (error: any) {
      toast.error(`Failed to upload avatar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Dummy onResubmit for KycStatusDisplay
  const handleKycResubmit = () => {
    toast.info("KYC resubmission process would start here.");
    // navigate('/kyc/submit'); // Example navigation
  };

  if (authLoading && !user) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return <div className="text-center py-10">Please log in to view your profile.</div>;
  }

  const renderEditableField = (field: keyof UserProfileData, label: string, type: string = "text") => {
    const isEmail = field === 'email';
    return (
      <div className="space-y-1">
        <Label htmlFor={field} className="text-sm font-medium">{label}</Label>
        {editingField === field && !isEmail ? (
          <div className="flex items-center gap-2">
            <Input
              id={field}
              name={field}
              type={type}
              value={newValues[field] || ''}
              onChange={handleInputChange}
              className="bg-input border-border"
              disabled={isLoading}
            />
            <Button onClick={() => handleSave(field)} size="sm" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
            <Button onClick={handleCancelEdit} size="sm" variant="outline" disabled={isLoading}>Cancel</Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 bg-muted rounded-md min-h-[40px]">
            <span className="text-sm">{profileData[field] || (isEmail ? user.email : 'Not set')}</span>
            {!isEmail && (
                <Button onClick={() => handleEdit(field)} size="sm" variant="ghost">
                <Edit3 className="h-4 w-4" />
                </Button>
            )}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Manage your account details and preferences.</p>
      </header>
      
      <ProfileProgress user={user} kycStatus={userKycStatus} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="p-6 bg-card shadow-lg rounded-lg text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 group">
                <Avatar className="w-32 h-32 border-4 border-primary">
                  <AvatarImage src={avatarPreview || undefined} alt={profileData.username || user.email} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-4xl">
                    {profileData.firstName ? profileData.firstName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : <User />)}
                    {profileData.lastName ? profileData.lastName[0].toUpperCase() : ''}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatarUpload" className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </label>
                <Input id="avatarUpload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              {avatarFile && (
                <Button onClick={handleAvatarUpload} size="sm" className="mb-2" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Avatar
                </Button>
              )}
              <h2 className="text-xl font-semibold">{profileData.firstName || profileData.lastName ? `${profileData.firstName} ${profileData.lastName}`.trim() : (profileData.username || 'User')}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            
            <div className="p-6 bg-card shadow-lg rounded-lg">
              <h3 className="text-lg font-semibold mb-3">KYC Status</h3>
              {userKycStatus && kycRequest !== undefined && (
                 <KycStatusDisplay 
                    kycStatus={userKycStatus} 
                    kycRequest={kycRequest} 
                    onResubmit={handleKycResubmit} 
                />
              )}
               {!userKycStatus && <p className="text-sm text-muted-foreground">KYC status not available.</p>}
              {/* Add a button to start KYC if not submitted */}
              {userKycStatus === 'not_submitted' && (
                <Button onClick={() => {/* navigate to KYC form */ toast.info("Navigate to KYC form here") }} className="w-full mt-4">
                  Complete KYC Verification
                </Button>
              )}
            </div>
          </div>

          <div className="md:col-span-2 p-6 bg-card shadow-lg rounded-lg space-y-4">
            {renderEditableField('username', 'Username')}
            {renderEditableField('firstName', 'First Name')}
            {renderEditableField('lastName', 'Last Name')}
            {renderEditableField('email', 'Email (Cannot be changed)')}
            {/* Add more fields as needed */}
          </div>
        </TabsContent>

        <TabsContent value="security" className="p-6 bg-card shadow-lg rounded-lg space-y-6">
           <ChangePasswordForm />
           <TwoFactorAuthSettings />
        </TabsContent>

        <TabsContent value="activity" className="p-6 bg-card shadow-lg rounded-lg">
           <UserActivity userId={user.id} />
        </TabsContent>

        <TabsContent value="preferences" className="p-6 bg-card shadow-lg rounded-lg">
           <UserPreferences userId={user.id} />
        </TabsContent>
        
        <TabsContent value="settings" className="p-6 bg-card shadow-lg rounded-lg">
           <UserSettings userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfilePage;

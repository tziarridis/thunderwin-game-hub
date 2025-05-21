
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import KycForm from '@/components/kyc/KycForm'; // Assuming KYC form is here
import { User } from '@/types/user'; // Your custom User type

const ProfilePage: React.FC = () => {
  const { user, profile, updateUserMetadata, isLoading: authLoading, fetchUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    avatar_url: '',
    // Add other fields from user_metadata or profile you want to edit
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.user_metadata?.full_name || profile?.full_name || '',
        username: user.user_metadata?.username || profile?.username || '', // Assuming username is on profile or user_metadata
        avatar_url: user.user_metadata?.avatar_url || profile?.avatar_url || '',
      });
    }
  }, [user, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    // Construct the metadata to update
    // Only include fields that are part of user.user_metadata
    const metadataToUpdate: Partial<User['user_metadata']> = {};
    if (formData.full_name !== (user.user_metadata?.full_name || '')) {
        metadataToUpdate.full_name = formData.full_name;
    }
    if (formData.username !== (user.user_metadata?.username || '')) {
        // If username is critical or unique, ensure backend handles this.
        // Supabase auth.updateUser doesn't typically handle unique username checks across users.
        metadataToUpdate.username = formData.username;
    }
    if (formData.avatar_url !== (user.user_metadata?.avatar_url || '')) {
        metadataToUpdate.avatar_url = formData.avatar_url;
    }
    
    // TODO: If some fields are in the public.profiles table, you'd need a separate update mechanism for that.
    // For now, this focuses on user_metadata managed by Supabase Auth.

    if (Object.keys(metadataToUpdate).length > 0) {
        await updateUserMetadata(metadataToUpdate);
    } else {
        toast.info("No changes to save.");
    }
    
    setIsSubmitting(false);
    setIsEditing(false);
    if (user?.id) fetchUserProfile(user.id); // Re-fetch to ensure UI consistency if needed
  };
  
  const handleKycSuccess = () => {
    toast.success("KYC Submitted! Refreshing profile...");
    if (user?.id) fetchUserProfile(user.id); // Re-fetch user data which might include updated kyc_status
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return <div className="text-center py-10">Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 max-w-2xl">
      <Card className="mb-8">
        <CardHeader className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={formData.avatar_url || user.user_metadata?.avatar_url || profile?.avatar_url} alt={formData.username || user.user_metadata?.username || 'User'} />
            <AvatarFallback>{(formData.full_name || user.user_metadata?.full_name || 'U')?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{formData.full_name || user.user_metadata?.full_name || 'User Name'}</CardTitle>
          <CardDescription>@{formData.username || user.user_metadata?.username || 'username'} | {user.email}</CardDescription>
          <CardDescription>KYC Status: <span className={`font-semibold ${user.user_metadata?.kyc_status === 'verified' ? 'text-green-500' : 'text-yellow-500'}`}>{user.user_metadata?.kyc_status || 'Not Submitted'}</span></CardDescription>

        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input id="avatar_url" name="avatar_url" value={formData.avatar_url} onChange={handleInputChange} />
              </div>
              {/* Add other editable fields here */}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* KYC Section */}
      {user.user_metadata?.kyc_status !== 'verified' && (
         <Card>
            <CardHeader>
                <CardTitle>KYC Verification</CardTitle>
                <CardDescription>
                {user.user_metadata?.kyc_status === 'pending' && "Your documents are under review."}
                {user.user_metadata?.kyc_status === 'rejected' && `Your KYC was rejected. Reason: ${user.user_metadata?.kyc_rejection_reason || 'Please check your email or resubmit.'}.`}
                {(user.user_metadata?.kyc_status === 'not_submitted' || user.user_metadata?.kyc_status === 'resubmit_required' || !user.user_metadata?.kyc_status) && "Please submit your documents for verification."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {(user.user_metadata?.kyc_status === 'not_submitted' || user.user_metadata?.kyc_status === 'resubmit_required' || !user.user_metadata?.kyc_status || user.user_metadata?.kyc_status === 'rejected' ) && (
                    <KycForm onSuccess={handleKycSuccess} />
                )}
            </CardContent>
         </Card>
      )}
    </div>
  );
};

export default ProfilePage;

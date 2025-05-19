
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { userService } from '@/services/userService'; // If direct profile updates are needed
// import { User } from '@/types'; // If using a more specific User type for form

const ProfileDetails: React.FC = () => {
  const { user, signOut, refreshUser } = useAuth(); // signOut and refreshUser from context
  const [formData, setFormData] = useState({
    email: '',
    fullName: '', // Example: map to user_metadata.full_name
    username: '', // Example: map to custom 'username' field in your profile
    // Add other fields as necessary
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
        username: user.username || user.email?.split('@')[0] || '', // Using app User type field
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      // Example: Update user metadata via Supabase auth or custom profile table
      // const { data, error } = await supabase.auth.updateUser({
      //   data: { full_name: formData.fullName, /* other metadata */ }
      // });
      // Or use userService to update your 'profiles' table
      // await userService.updateUserProfile(user.id, { username: formData.username, full_name: formData.fullName });
      
      // For this example, let's assume a placeholder success
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Profile updated successfully!');
      if (refreshUser) await refreshUser(); // Refresh user data in context
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const userDisplayName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const userAvatar = user?.user_metadata?.avatar_url;

  if (!user) {
    return <p>Loading user profile...</p>; // Or redirect to login
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardHeader className="items-center text-center">
            <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={userAvatar} alt={userDisplayName} />
                <AvatarFallback className="text-3xl">{userDisplayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{userDisplayName}</CardTitle>
            <CardDescription>Manage your profile information and settings.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" value={formData.username} onChange={handleChange} />
            </div>
            {/* Add more fields like phone, address etc. as needed */}
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
          <CardHeader>
              <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
              <Button variant="destructive" onClick={signOut} className="w-full sm:w-auto">
                Sign Out
              </Button>
              {/* Add other actions like Change Password, Delete Account if needed */}
          </CardContent>
      </Card>
    </div>
  );
};

export default ProfileDetails;

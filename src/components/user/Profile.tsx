import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserCircle, Mail, Edit3 } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, isAuthenticated, updateUser, isLoading: authLoading } = useAuth(); // Use 'updateUser' and 'isLoading'
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    // Add other editable fields here, e.g., full_name, avatar_url
    full_name: '', 
    avatar_url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.user_metadata?.username || user.email?.split('@')[0] || '',
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      });
    }
  }, [user]);

  if (authLoading && !user) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAuthenticated || !user) {
    return <p className="text-center text-muted-foreground">Please log in to view your profile.</p>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!updateUser) {
        toast.error("Profile update service is not available.");
        return;
    }
    setIsSubmitting(true);
    try {
      // Construct the metadata object carefully
      const metadataToUpdate: Record<string, any> = {};
      if (formData.username && formData.username !== (user.user_metadata?.username || user.email?.split('@')[0])) {
        metadataToUpdate.username = formData.username;
      }
      if (formData.full_name && formData.full_name !== user.user_metadata?.full_name) {
        metadataToUpdate.full_name = formData.full_name;
      }
       if (formData.avatar_url && formData.avatar_url !== user.user_metadata?.avatar_url) {
        metadataToUpdate.avatar_url = formData.avatar_url;
      }
      // Email updates are typically handled differently (e.g., require verification)
      // For now, we are not updating email via this form to avoid complexity.

      if (Object.keys(metadataToUpdate).length > 0) {
        await updateUser({ data: metadataToUpdate }); // updateUser expects { data: metadata }
        toast.success('Profile updated successfully!');
      } else {
        toast.info("No changes to update.");
      }
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getInitials = (name?: string) => {
    if (!name) return user?.email?.[0]?.toUpperCase() || 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2);
  };


  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={formData.avatar_url || user.user_metadata?.avatar_url} alt={formData.username || user.user_metadata?.username || 'User'} />
            <AvatarFallback className="text-3xl bg-muted">
                {getInitials(formData.full_name || user.user_metadata?.full_name || formData.username)}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-2xl">User Profile</CardTitle>
        <CardDescription>Manage your personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="flex items-center"><UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />Username</Label>
              <Input id="username" name="username" value={formData.username} onChange={handleChange} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="full_name" className="flex items-center"><UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />Full Name</Label>
              <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Your full name" className="mt-1" />
            </div>
             <div>
              <Label htmlFor="avatar_url" className="flex items-center"><UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />Avatar URL</Label>
              <Input id="avatar_url" name="avatar_url" value={formData.avatar_url} onChange={handleChange} placeholder="http://example.com/avatar.png" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email" className="flex items-center"><Mail className="h-4 w-4 mr-2 text-muted-foreground" />Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} disabled className="mt-1 bg-muted/50" />
              <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed here.</p>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              <UserCircle className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{formData.username || 'Not set'}</p>
              </div>
            </div>
             <div className="flex items-center">
              <UserCircle className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{formData.full_name || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{formData.email}</p>
              </div>
            </div>
            {/* Display other profile information here */}
          </div>
        )}
      </CardContent>
      {!isEditing && (
        <CardFooter className="flex justify-end">
          <Button onClick={() => setIsEditing(true)}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default UserProfile;

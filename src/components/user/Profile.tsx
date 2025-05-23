
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ChangePasswordForm from '@/components/user/ChangePasswordForm';
import UpdateProfileForm from '@/components/user/UpdateProfileForm';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react'; 
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, signOut, isLoading: authLoading, error: authError } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully.");
      navigate('/'); // navigate to home after logout
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout error:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }
  
  if (authError) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-red-500">Error loading profile: {authError.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  if (!user) {
     return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Please log in to view your profile.</p>
        <Button onClick={() => navigate('/login')} className="mt-4">Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button variant="outline" onClick={handleLogout} disabled={authLoading}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Information Card */}
        <div className="md:col-span-1 space-y-4 bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">Account Details</h2>
          <div className="flex items-center space-x-4 mb-4">
            <img 
              src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random`} 
              alt="User Avatar" 
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <p className="text-lg font-medium">{user.first_name || ''} {user.last_name || ''}</p>
              <p className="text-sm text-muted-foreground">{user.username || user.email}</p>
            </div>
          </div>
          <p><strong>Email:</strong> {user.email || 'N/A'}</p>
          <p><strong>User ID:</strong> <span className="text-xs">{user.id}</span></p>
          <p><strong>Role:</strong> <span className="capitalize">{user.role || 'user'}</span></p>
          <p><strong>Status:</strong> <span className="capitalize">{user.status || (user.is_active ? 'Active' : 'Inactive')}</span></p>
          <p><strong>Joined:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Last Login:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
        </div>

        {/* Forms Card */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Update Profile</h2>
            <UpdateProfileForm />
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Change Password</h2>
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

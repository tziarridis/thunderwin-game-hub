import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ChangePasswordForm from '@/components/user/ChangePasswordForm';
import UpdateProfileForm from '@/components/user/UpdateProfileForm';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react'; // Assuming LogOut icon is used

const Profile: React.FC = () => {
  const { user, logout, loading: authLoading, error: authError } = useAuth(); // Changed signOut to logout

  const handleLogout = async () => {
    await logout();
    // navigate to login or home
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Account Details</h2>
            <p><strong>Username:</strong> {user.username || 'N/A'}</p>
            <p><strong>Email:</strong> {user.email || 'N/A'}</p>
            <p><strong>First Name:</strong> {user.first_name || 'N/A'}</p>
            <p><strong>Last Name:</strong> {user.last_name || 'N/A'}</p>
            {/* Add more user details here */}
          </div>

          {/* Update Profile Form */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>
            <UpdateProfileForm />
          </div>

          {/* Change Password Form */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
            <ChangePasswordForm />
          </div>
        </div>
      )}

      {/* Logout Button */}
      <Button variant="outline" onClick={handleLogout} disabled={authLoading}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

export default Profile;

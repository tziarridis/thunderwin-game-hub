
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ChangePasswordForm from '@/components/user/ChangePasswordForm';
import UpdateProfileForm from '@/components/user/UpdateProfileForm'; // Corrected: This file will be created
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react'; 

const Profile: React.FC = () => {
  const { user, logout, loading: authLoading, error: authError } = useAuth(); 

  const handleLogout = async () => {
    await logout();
    // navigate to login or home
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {authError && <p className="text-red-500">Error loading profile: {authError}</p>}
      {authLoading && <p>Loading profile...</p>}

      {user && !authLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Information */}
          <div className="space-y-4 bg-card p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold border-b pb-2">Account Details</h2>
            <p><strong>Username:</strong> {user.username || 'N/A'}</p>
            <p><strong>Email:</strong> {user.email || 'N/A'}</p>
            <p><strong>First Name:</strong> {user.first_name || 'N/A'}</p>
            <p><strong>Last Name:</strong> {user.last_name || 'N/A'}</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Role:</strong> {user.role || 'user'}</p>
            <p><strong>Status:</strong> {user.status || (user.is_active ? 'Active' : 'Inactive')}</p>
            <p><strong>Joined:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>

          {/* Update Profile Form */}
          <div>
            <UpdateProfileForm />
          </div>

          {/* Change Password Form */}
          <div>
            <ChangePasswordForm />
          </div>
          
          {/* Logout Button - Moved to a more logical place or can be part of a user menu */}
          <div className="md:col-span-2 mt-6">
             <Button variant="outline" onClick={handleLogout} disabled={authLoading} className="w-full md:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
          </div>
        </div>
      )}

      {!user && !authLoading && !authError && (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
};

export default Profile;

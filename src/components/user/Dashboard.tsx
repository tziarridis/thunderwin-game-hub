
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Corrected import
import UserStats from '@/components/user/UserStats';
import UserActivity from '@/components/user/UserActivity';
import VipProgress from '@/components/user/VipProgress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import UserPageLoadingSkeleton from '@/components/user/UserPageLoadingSkeleton'; // Corrected import
import { toast } from 'sonner';
import { AppUser } from '@/contexts/AuthContext'; // Or import User from '@/types' if AppUser is not needed directly

const UserDashboard: React.FC = () => {
  const { user, loading, error, fetchAndUpdateUser } = useAuth(); // Corrected usage of useAuth
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast.error(`Error loading user data: ${error}`);
    }
  }, [error]);
  
  // Optionally, refresh user data on mount or under certain conditions
  // useEffect(() => {
  //   fetchAndUpdateUser();
  // }, [fetchAndUpdateUser]);

  if (loading) {
    return <UserPageLoadingSkeleton />; // Corrected component name
  }

  if (!user) {
    // This case should ideally be handled by a protected route redirecting to login
    return (
      <div className="text-center py-10">
        <p className="mb-4">Please log in to view your dashboard.</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }
  
  // Ensure `user` object conforms to what child components expect.
  // For example, if UserStats expects specific fields, ensure they exist on `user as AppUser`.

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user.username || user.email}!</h1>
      
      <UserStats user={user as AppUser} /> {/* Cast to AppUser if UserStats expects it */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UserActivity does not take userId prop based on its definition */}
        <UserActivity /> 
        {/* VipProgress does not take userId prop based on its definition, it takes wallet or direct points/level */}
        <VipProgress 
            currentLevel={user.vip_level_id ? parseInt(user.vip_level_id) : undefined} // Example: adapt if vip_level_id is not number
            currentPoints={user.user_metadata?.vip_points} // Example: adapt based on where vip_points are stored
        />
      </div>

      {/* Quick Actions or Links */}
      <div className="mt-8 space-x-4">
        <Button onClick={() => navigate('/transactions')}>View Transactions</Button>
        <Button onClick={() => navigate('/profile')}>Edit Profile</Button>
        <Button onClick={() => navigate('/bonuses')}>My Bonuses</Button>
      </div>
    </div>
  );
};

export default UserDashboard;

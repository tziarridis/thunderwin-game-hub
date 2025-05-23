
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserStats from '@/components/user/UserStats';
import UserActivity from '@/components/user/UserActivity';
import VipProgress from '@/components/user/VipProgress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import UserPageLoadingSkeleton from '@/components/user/UserPageLoadingSkeleton';
import { toast } from 'sonner';
import { AppUser } from '@/types';

const UserDashboard: React.FC = () => {
  const { user, isLoading, error, fetchAndUpdateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast.error(`Error loading user data: ${error}`);
    }
  }, [error]);

  if (isLoading) {
    return <UserPageLoadingSkeleton />;
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="mb-4">Please log in to view your dashboard.</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  // Convert AppUser to User format for UserStats component
  const userForStats: AppUser = {
    ...user,
    role: user.role || 'user'
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user.username || user.email}!</h1>
      
      <UserStats user={userForStats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserActivity />
        <VipProgress 
            currentLevel={user.vip_level_id ? parseInt(user.vip_level_id) : undefined}
            currentPoints={user.user_metadata?.vip_points}
        />
      </div>

      <div className="mt-8 space-x-4">
        <Button onClick={() => navigate('/transactions')}>View Transactions</Button>
        <Button onClick={() => navigate('/profile')}>Edit Profile</Button>
        <Button onClick={() => navigate('/bonuses')}>My Bonuses</Button>
      </div>
    </div>
  );
};

export default UserDashboard;


import React from 'react';
// Removed import ProfilePage from '@/components/user/ProfilePage'; 
// This was causing a circular dependency or incorrect import.
// MobileProfile should be a self-contained page or use specific components.

import UserLayout from '@/components/layout/UserLayout'; // If a layout is needed
import Profile from '@/components/user/Profile'; // Assuming this is the main profile content component
import UserStats from '@/components/user/UserStats';
import VipProgress from '@/components/user/VipProgress';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, ShieldCheck, LogOut, Gift, Gem, Zap, History, UserCircle } from 'lucide-react'; // Added UserCircle
import MobileWalletSummary from '@/components/user/MobileWalletSummary';


const MobileProfile = () => {
  const { user, logout, wallet } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    // Or redirect to login
    return (
        <div className="p-4 text-center">
            <p>Please log in to view your profile.</p>
            <Button onClick={() => navigate('/login')} className="mt-4">Log In</Button>
        </div>
    );
  }

  const profileMenuItems = [
    { label: 'Account Details', icon: UserCircle, path: '/profile/details' }, // Example path
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'Bonuses', icon: Gift, path: '/bonuses' },
    { label: 'VIP Program', icon: Gem, path: '/vip' },
    { label: 'Transaction History', icon: History, path: '/transactions' },
    { label: 'Responsible Gaming', icon: ShieldCheck, path: '/support/responsible-gaming' },
    { label: 'KYC Status', icon: Zap, path: '/kyc' }, // Example KYC path
  ];

  return (
    // Consider if UserLayout is appropriate here or if MobileProfile has its own full-screen structure
    // For now, assuming it's a full page component
    <div className="pb-20 bg-casino-thunder-darker min-h-screen"> {/* Added padding-bottom for tab bar */}
      <header className="bg-casino-thunder-dark p-4 shadow-md sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">{user.username || user.email}</h1>
            {/* Optional: small avatar or icon */}
        </div>
      </header>
      
      <div className="p-4 space-y-6">
        {wallet && <MobileWalletSummary wallet={wallet} user={user} />}

        {/* Quick Actions or summary cards could go here */}
        {/* e.g., <UserStats user={user} /> simplified for mobile */}
        {/* e.g., <VipProgress vipLevel={user.vip_level} vipPoints={user.vip_points} /> simplified */}


        <div className="bg-card rounded-lg shadow p-1">
          {profileMenuItems.map((item) => (
            <Link
              to={item.path}
              key={item.label}
              className="flex items-center p-3 space-x-3 hover:bg-muted/50 rounded-md transition-colors border-b border-border last:border-b-0"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="text-card-foreground">{item.label}</span>
            </Link>
          ))}
        </div>

        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" /> Log Out
        </Button>
      </div>
    </div>
  );
};

export default MobileProfile;

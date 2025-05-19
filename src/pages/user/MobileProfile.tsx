
import React from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, UserCircle, Shield, DollarSign, Gift, History, LifeBuoy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WalletBalance from '@/components/user/WalletBalance';

const MobileProfile = () => {
  const { user, logout, wallet } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/'); 
  };

  if (!user) {
    return (
      <div className="p-4 flex flex-col items-center space-y-4">
        <p>You are not logged in.</p>
        <Button onClick={() => navigate('/auth/login')}>Login</Button>
      </div>
    );
  }
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const menuItems = [
    { label: 'Account Details', icon: UserCircle, path: '/user/profile/details' },
    { label: 'Settings', icon: Settings, path: '/user/settings' },
    { label: 'Security', icon: Shield, path: '/user/security' },
    { label: 'Transactions', icon: History, path: '/user/transactions' },
    { label: 'Bonuses', icon: Gift, path: '/user/bonuses' },
    { label: 'Support', icon: LifeBuoy, path: '/support/contact' },
  ];

  return (
    <div className="p-4 bg-card text-card-foreground min-h-screen">
      <div className="flex flex-col items-center space-y-3 mb-6 pb-6 border-b">
        <Avatar className="w-24 h-24 border-2 border-primary">
          <AvatarImage src={user.user_metadata?.avatar_url || user.avatar_url} alt={user.user_metadata?.full_name || user.email} />
          <AvatarFallback>{getInitials(user.user_metadata?.full_name || user.email)}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold">{user.user_metadata?.full_name || user.username || user.email}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <div className="mt-2">
            <WalletBalance user={user} className="text-lg justify-center" />
        </div>
        <Button onClick={() => navigate('/payment/deposit')} className="w-full mt-2 bg-primary hover:bg-primary/90">
            <DollarSign className="mr-2 h-4 w-4" /> Deposit Funds
        </Button>
      </div>

      <nav className="space-y-2">
        {menuItems.map(item => (
          <Button
            key={item.label}
            variant="ghost"
            className="w-full justify-start text-base py-3 px-3"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="mr-3 h-5 w-5 text-muted-foreground" />
            {item.label}
          </Button>
        ))}
      </nav>

      <Button
        variant="destructive"
        className="w-full mt-8 text-base py-3"
        onClick={handleLogout}
      >
        <LogOut className="mr-3 h-5 w-5" />
        Logout
      </Button>
    </div>
  );
};

export default MobileProfile;

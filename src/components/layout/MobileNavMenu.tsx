import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Wallet as UserWallet } from '@/types'; // Renamed Wallet to UserWallet to avoid conflict
import { Home, Gift, Gem, ShieldCheck, LogOut, UserCircle, Settings, HelpCircle, BarChart3, ExternalLink, KeyRound, ShieldAlert, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface MobileNavMenuProps {
  user: User | null;
  isAuthenticated: boolean;
  onSignOut: () => void;
  onClose: () => void;
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ user, isAuthenticated, onSignOut, onClose }) => {
  const navigate = useNavigate();
  const { isAdmin, wallet } = useAuth(); // Get isAdmin and wallet from useAuth

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    { label: 'Home', icon: <Home className="h-5 w-5" />, path: '/', authRequired: false },
    { label: 'Casino', icon: <Gem className="h-5 w-5" />, path: '/casino', authRequired: false },
    { label: 'Promotions', icon: <Gift className="h-5 w-5" />, path: '/promotions', authRequired: false },
    // Add more general navigation items here
  ];

  const userMenuItems = [
    { label: 'Profile', icon: <UserCircle className="h-5 w-5" />, path: '/profile', authRequired: true },
    { label: 'Wallet', icon: <KeyRound className="h-5 w-5" />, path: '/wallet', authRequired: true }, // Changed icon
    { label: 'Bonuses', icon: <Gift className="h-5 w-5" />, path: '/bonuses', authRequired: true },
    { label: 'Transactions', icon: <BarChart3 className="h-5 w-5" />, path: '/transactions', authRequired: true },
    { label: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/settings', authRequired: true },
    { label: 'KYC', icon: <ShieldCheck className="h-5 w-5" />, path: '/kyc', authRequired: true },
    { label: 'Responsible Gambling', icon: <ShieldAlert className="h-5 w-5" />, path: '/support/responsible-gaming', authRequired: true },
    { label: 'Help Center', icon: <HelpCircle className="h-5 w-5" />, path: '/support/help', authRequired: false },
  ];
  
  // Admin menu item
  const adminMenuItem = { label: 'Admin Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/admin/dashboard', authRequired: true, adminOnly: true };


  return (
    <div className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-sm md:hidden">
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-4rem)] overflow-y-auto">
        {isAuthenticated && user && (
          <div className="mb-6 p-4 border-b border-border">
            <h3 className="font-semibold text-lg">{user.user_metadata?.name || user.username || user.email}</h3>
            {wallet && (
              <p className="text-sm text-muted-foreground">
                Balance: {wallet.balance.toFixed(2)} {wallet.currency}
              </p>
            )}
          </div>
        )}

        <nav className="flex flex-col gap-2 mb-6">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="justify-start text-base py-3 px-3"
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Button>
          ))}
          {isAuthenticated && userMenuItems.map((item) => (
             <Button
              key={item.label}
              variant="ghost"
              className="justify-start text-base py-3 px-3"
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Button>
          ))}
          {isAuthenticated && isAdmin && ( // Check isAdmin from useAuth
            <Button
              variant="ghost"
              className="justify-start text-base py-3 px-3 text-primary"
              onClick={() => handleNavigation(adminMenuItem.path)}
            >
              {adminMenuItem.icon}
              <span className="ml-3">{adminMenuItem.label}</span>
            </Button>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          {isAuthenticated ? (
            <Button variant="destructive" className="w-full justify-start py-3 px-3" onClick={onSignOut}>
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Sign Out</span>
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button className="w-full justify-center" onClick={() => handleNavigation('/auth/login')}>
                Log In
              </Button>
              <Button variant="outline" className="w-full justify-center" onClick={() => handleNavigation('/auth/signup')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileNavMenu;

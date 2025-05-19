
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import NavLinks from './NavLinks'; 
import MobileNavBar from './MobileNavBar';
import DepositButton from '@/components/user/DepositButton';
import UserMenu from '@/components/layout/UserMenu';
import SiteLogo from '@/components/SiteLogo';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';
import { supabase } from '@/integrations/supabase/client';
import { WalletType } from '@/types';

const AppHeader = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchWallet = async () => {
        setLoadingWallet(true);
        try {
          const { data, error } = await supabase
            .from('wallets')
            .select('balance, currency, vip_level, vip_points')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching wallet:", error);
            setWallet(null);
          } else if (data) {
            setWallet({
              balance: data.balance,
              currency: data.currency || 'USD',
              vipLevel: data.vip_level,
              vipPoints: data.vip_points,
            });
          }
        } catch (err) {
          console.error("Error in wallet fetch:", err);
          setWallet(null);
        } finally {
          setLoadingWallet(false);
        }
      };

      fetchWallet();

      // Also fetch notifications status (simplified for example)
      const fetchNotificationsStatus = async () => {
        // This would be replaced with actual notifications query
        setHasUnreadNotifications(Math.random() > 0.5); // Random for demo
      };

      fetchNotificationsStatus();
    } else {
      setWallet(null);
      setHasUnreadNotifications(false);
    }
  }, [isAuthenticated, user]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isHomePage ? "bg-transparent border-transparent" : ""
    )}>
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Logo and Main Navigation */}
        <div className="flex flex-1 items-center justify-start">
          <Link to="/" className="flex items-center space-x-2">
            <SiteLogo className="h-8 w-auto" />
          </Link>
          <div className="hidden md:flex md:items-center md:ml-6 space-x-1">
            <NavLinks />
          </div>
        </div>

        {/* Right Side: Theme Toggle, Notifications, User Menu */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="hidden sm:flex"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {/* Authenticated User: Deposit Button, Notifications, User Menu */}
          {isAuthenticated ? (
            <>
              {/* Deposit Button (hide on small screens) */}
              <div className="hidden md:block">
                <DepositButton />
              </div>
              
              {/* Notifications */}
              <NotificationsDropdown hasUnread={hasUnreadNotifications} />
              
              {/* User Menu */}
              <UserMenu user={user} wallet={wallet} loadingWallet={loadingWallet} />
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
          
          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <MobileNavBar onClose={toggleMobileMenu} wallet={wallet} />
        </div>
      )}
    </header>
  );
};

export default AppHeader;

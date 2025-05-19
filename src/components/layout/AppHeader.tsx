
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react'; // Removed Bell as NotificationsDropdown handles it
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import NavLinks from './NavLinks'; 
import MobileNavBar from './MobileNavBar';
import DepositButton from '@/components/user/DepositButton';
import UserMenu from '@/components/user/UserMenu'; // Corrected import path
import SiteLogo from '@/components/SiteLogo';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';
import { supabase } from '@/integrations/supabase/client';
import { Wallet } from '@/types/wallet'; // Changed WalletType to Wallet from wallet.d.ts

const AppHeader = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme(); // toggleTheme is now available
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null); // Changed WalletType to Wallet
  const [loadingWallet, setLoadingWallet] = useState<boolean>(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchWallet = async () => {
        setLoadingWallet(true);
        try {
          const { data, error } = await supabase
            .from('wallets')
            .select('balance, currency, vip_level, vip_points, symbol, wagering_requirement') // Added more fields to match Wallet type
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching wallet:", error);
            setWallet(null);
          } else if (data) {
            setWallet({
              balance: data.balance ?? 0,
              currency: data.currency || 'USD',
              symbol: data.symbol || '$',
              vipLevel: data.vip_level ?? 0,
              vipPoints: data.vip_points ?? 0,
              wagering_requirement: data.wagering_requirement ?? 0,
              // Ensure all required fields from Wallet type are present or optional
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
        // For now, let's assume some logic sets this
        const unreadCount = 0; // Replace with actual logic
        setHasUnreadNotifications(unreadCount > 0);
      };

      fetchNotificationsStatus();
    } else {
      setWallet(null);
      setHasUnreadNotifications(false);
    }
  }, [isAuthenticated, user]);

  const toggleMobileMenuHandler = () => { // Renamed to avoid conflict with useTheme's toggleTheme
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", // z-50 to be above other sticky elements
      isHomePage ? "bg-transparent border-transparent" : ""
    )}>
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Logo and Main Navigation */}
        <div className="flex flex-1 items-center justify-start">
          <Link to="/" className="flex items-center space-x-2 mr-6">
            <SiteLogo className="h-8 w-auto" />
          </Link>
          <div className="hidden md:flex md:items-center">
            <NavLinks />
          </div>
        </div>

        {/* Right Side: Theme Toggle, Notifications, User Menu */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} // Correctly uses toggleTheme from useTheme
            className="hidden sm:flex"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {/* Authenticated User: Deposit Button, Notifications, User Menu */}
          {isAuthenticated ? (
            <>
              {/* Deposit Button (hide on small screens) */}
              <div className="hidden lg:block">
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
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenuHandler} aria-label="Toggle mobile menu">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <MobileNavBar onClose={toggleMobileMenuHandler} wallet={wallet} />
        </div>
      )}
    </header>
  );
};

export default AppHeader;

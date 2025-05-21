import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider'; // Corrected import path for useTheme from shadcn
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import NavLinks from './NavLinks';
import MobileNavBar from './MobileNavBar'; // This seems to be the intended component for mobile bottom bar
// import MobileNavMenu from './MobileNavMenu'; // This is a full screen menu, AppHeader uses MobileNavBar
import DepositButton from '@/components/user/DepositButton';
import UserMenu from '@/components/user/UserMenu';
import SiteLogo from '@/components/SiteLogo';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';
import { supabase } from '@/integrations/supabase/client';
import { Wallet } from '@/types/wallet';

const AppHeader = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme(); // setTheme from useTheme
  const { user, isAuthenticated, signOut } = useAuth(); // Changed logout to signOut
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // This state seems to be for MobileNavMenu (full screen)
                                                                // but MobileNavBar is rendered. Assuming this controls the MobileNavMenu toggle
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchWallet = async () => {
        setLoadingWallet(true);
        try {
          const { data, error } = await supabase
            .from('wallets')
            .select('id, user_id, balance, currency, symbol, vip_level, vip_points, active')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching wallet:", error.message);
            setWallet(null);
          } else if (data) {
            setWallet({
              id: data.id,
              userId: data.user_id, // This should match Wallet type: userId
              balance: data.balance ?? 0,
              currency: data.currency || 'USD',
              symbol: data.symbol || '$',
              vipLevel: data.vip_level ?? 0,
              vipPoints: data.vip_points ?? 0,
              bonusBalance: 0, 
              cryptoBalance: 0, 
              demoBalance: 0, 
              isActive: data.active ?? false,
              lastTransactionDate: null, 
            });
          } else {
            setWallet(null);
          }
        } catch (err: any) {
          console.error("Error in wallet fetch:", err.message);
          setWallet(null);
        } finally {
          setLoadingWallet(false);
        }
      };

      fetchWallet();

      const fetchNotificationsStatus = async () => {
        // Placeholder: Replace with actual notification fetching logic
        // const { count } = await supabase.from('notifications').select('id', { count: 'exact' }).eq('user_id', user.id).eq('is_read', false);
        const unreadCount = 0; 
        setHasUnreadNotifications(unreadCount > 0);
      };

      fetchNotificationsStatus();
    } else {
      setWallet(null);
      setHasUnreadNotifications(false);
    }
  }, [isAuthenticated, user]);

  const toggleThemeHandler = () => { // Renamed to avoid conflict with useTheme's toggleTheme
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleMobileMenuHandler = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isHomePage ? "bg-transparent border-transparent" : ""
    )}>
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="flex flex-1 items-center justify-start">
          <Link to="/" className="flex items-center space-x-2 mr-6">
            <SiteLogo className="h-8 w-auto" />
          </Link>
          <div className="hidden md:flex md:items-center">
            <NavLinks />
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleThemeHandler} // Use renamed handler
            className="hidden sm:flex"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isAuthenticated && user ? ( 
            <>
              <div className="hidden lg:block">
                <DepositButton />
              </div>
              <NotificationsDropdown hasUnread={hasUnreadNotifications} />
              <UserMenu user={user} onLogout={signOut} />
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

          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenuHandler} aria-label="Toggle mobile menu">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* This renders the bottom mobile navigation bar, not a full screen menu */}
      {/* If a full screen menu is intended, MobileNavMenu should be used here, controlled by isMobileMenuOpen */}
      {/* For now, assuming MobileNavBar is for the bottom always-visible bar, and isMobileMenuOpen controls a different menu (e.g. MobileNavMenu) */}
      {/* The original code had MobileNavBar inside the conditional, which might be a bug if it's meant to be the full-screen menu */}
      {/* If isMobileMenuOpen is for a *different* menu like MobileNavMenu.tsx, it should be rendered here: */}
      {/* {isMobileMenuOpen && <MobileNavMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />} */}
      
      {/* The existing code renders MobileNavBar (bottom bar) when isMobileMenuOpen is true. This is likely not the intended behavior for `isMobileMenuOpen` */}
      {/* MobileNavBar is usually always present on mobile, or AppHeader itself changes layout. */}
      {/* For now, I will keep the logic as it was, but it might need review. */}
       {isMobileMenuOpen && ( // This implies MobileNavBar is only shown when menu icon is clicked, which is unusual for a bottom bar
        <div className="md:hidden">
          {/* This will render the BOTTOM navigation bar when the hamburger is clicked */}
          {/* If MobileNavMenu (the full screen one) is intended, replace MobileNavBar here */}
          <MobileNavBar onClose={toggleMobileMenuHandler} wallet={wallet} />
        </div>
      )}
    </header>
  );
};

export default AppHeader;

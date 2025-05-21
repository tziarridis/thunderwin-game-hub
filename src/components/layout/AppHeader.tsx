import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from "next-themes";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; 
import NavLinks from './NavLinks';
import MobileNavBar from './MobileNavBar'; 
import DepositButton from '@/components/user/DepositButton';
import UserMenu from '@/components/user/UserMenu';
import SiteLogo from '@/components/SiteLogo';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';
import { supabase } from '@/integrations/supabase/client';
import { Wallet } from '@/types/wallet'; 
import { AppUser } from '@/types/user';

interface WalletState extends Wallet {
  // WalletState can be removed if AppWalletType is sufficient
}

const AppHeader = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme(); 
  const { user: supabaseUser, isAuthenticated, signOut } = useAuth(); // user is Supabase User
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [appUserForMenu, setAppUserForMenu] = useState<AppUser | null>(null);


  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (isAuthenticated && supabaseUser) {
      // Transform Supabase User to AppUser for UserMenu
      setAppUserForMenu({
        id: supabaseUser.id,
        email: supabaseUser.email,
        // @ts-ignore supabaseUser.user_metadata might not be directly available or could be empty
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0], 
        // @ts-ignore
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
        // @ts-ignore
        firstName: supabaseUser.user_metadata?.first_name,
        // @ts-ignore
        lastName: supabaseUser.user_metadata?.last_name,
        isActive: true, // Assume active if authenticated
        createdAt: supabaseUser.created_at,
        updatedAt: supabaseUser.updated_at,
        // roles and permissions would need to be fetched separately if needed
      });
      
      const fetchWallet = async () => {
        try {
          const { data, error } = await supabase
            .from('wallets')
            .select('id, user_id, balance, currency, symbol, vip_level, vip_points, active, balance_bonus, balance_cryptocurrency, balance_demo, updated_at') 
            .eq('user_id', supabaseUser.id) // Use supabaseUser.id here
            .maybeSingle();

          if (error) {
            console.error("Error fetching wallet:", error.message);
            setWallet(null);
          } else if (data) {
            // Map to WalletState ensuring all fields from AppWalletType are covered
            setWallet({
              id: data.id,
              userId: data.user_id, // This should align with supabaseUser.id type if user_id in wallets is UUID
              balance: data.balance ?? 0,
              currency: data.currency || 'USD',
              symbol: data.symbol || '$',
              vipLevel: data.vip_level ?? 0,
              vipPoints: data.vip_points ?? 0,
              bonusBalance: data.balance_bonus ?? 0, 
              cryptoBalance: data.balance_cryptocurrency ?? 0, 
              demoBalance: data.balance_demo ?? 0, 
              isActive: data.active ?? false, // from 'wallets' table 'active' column
              lastTransactionDate: data.updated_at ? new Date(data.updated_at) : null,
              // any other fields required by AppWalletType
            });
          } else {
            setWallet(null);
          }
        } catch (err: any) {
          console.error("Error in wallet fetch:", err.message);
          setWallet(null);
        }
      };

      fetchWallet();

      const fetchNotificationsStatus = async () => {
        const unreadCount = 0; // Placeholder
        setHasUnreadNotifications(unreadCount > 0);
      };

      fetchNotificationsStatus();
    } else {
      setWallet(null);
      setAppUserForMenu(null);
      setHasUnreadNotifications(false);
    }
  }, [isAuthenticated, supabaseUser]);

  const toggleThemeHandler = () => { 
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
            onClick={toggleThemeHandler} 
            className="hidden sm:flex"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isAuthenticated && appUserForMenu ? ( 
            <>
              <div className="hidden lg:block">
                <DepositButton />
              </div>
              <NotificationsDropdown hasUnread={hasUnreadNotifications} />
              <UserMenu 
                user={appUserForMenu} // Pass the transformed AppUser object
                onLogout={signOut}
                // Pass wallet related props if UserMenu expects them explicitly
                // For example, if UserMenu has props like:
                // balance={wallet?.balance}
                // currencySymbol={wallet?.symbol}
              />
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
      
       {isMobileMenuOpen && ( 
        <div className="md:hidden">
          <MobileNavBar onClose={toggleMobileMenuHandler} wallet={wallet} />
        </div>
      )}
    </header>
  );
};

export default AppHeader;

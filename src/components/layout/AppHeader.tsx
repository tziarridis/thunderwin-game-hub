
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
import UserMenu from '@/components/user/UserMenu'; // UserMenu itself has internal errors I can't fix
import SiteLogo from '@/components/SiteLogo';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';
import { supabase } from '@/integrations/supabase/client';
import { Wallet } from '@/types/wallet'; 
import { AppUser, User as AuthUserType } from '@/types/user'; // Renamed to avoid conflict

// WalletState can be removed if AppWalletType is sufficient, using Wallet directly
// interface WalletState extends Wallet {}

const AppHeader = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme(); 
  const { user: supabaseUser, isAuthenticated, signOut } = useAuth(); // supabaseUser is Supabase User
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null); // Use Wallet type
  const [appUserForMenu, setAppUserForMenu] = useState<AppUser | null>(null);


  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (isAuthenticated && supabaseUser) {
      // Transform Supabase User to AppUser for UserMenu
      // The UserMenu might expect a type compatible with AuthUserType from @/types/user.ts
      // which needs created_at, updated_at. AppUser has createdAt, updatedAt.
      // Let's try to construct an object that satisfies what UserMenu might expect,
      // based on typical User properties.
      const transformedUser: AppUser & { created_at?: string, updated_at?: string } = { // Explicitly add for clarity
        id: supabaseUser.id,
        email: supabaseUser.email,
        // @ts-ignore user_metadata might not be directly on supabaseUser type from useAuth.
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0], 
        // @ts-ignore
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
        // @ts-ignore
        firstName: supabaseUser.user_metadata?.first_name,
        // @ts-ignore
        lastName: supabaseUser.user_metadata?.last_name,
        isActive: true, 
        createdAt: supabaseUser.created_at, // AppUser field
        updatedAt: supabaseUser.updated_at, // AppUser field
        created_at: supabaseUser.created_at, // For compatibility if UserMenu needs this exact name
        updated_at: supabaseUser.updated_at, // For compatibility
        roles: supabaseUser.app_metadata?.roles || [], // Get roles from app_metadata
        // permissions would need to be fetched separately if needed
      };
      setAppUserForMenu(transformedUser as AppUser); // Cast to AppUser for UserMenu prop
      
      const fetchWallet = async () => {
        try {
          // The 'wallets' table uses 'user_id', 'vip_level', 'vip_points'.
          // The Wallet type uses 'userId', 'vipLevel', 'vipPoints'.
          const { data, error } = await supabase
            .from('wallets')
            .select('id, user_id, balance, currency, symbol, vip_level, vip_points, active, balance_bonus, balance_cryptocurrency, balance_demo, updated_at') 
            .eq('user_id', supabaseUser.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching wallet:", error.message);
            setWallet(null);
          } else if (data) {
            setWallet({
              id: data.id,
              userId: data.user_id, // Map from user_id
              balance: data.balance ?? 0,
              currency: data.currency || 'USD',
              symbol: data.symbol || '$',
              vipLevel: data.vip_level ?? 0, // Map from vip_level
              vipPoints: data.vip_points ?? 0, // Map from vip_points
              bonusBalance: data.balance_bonus ?? 0, 
              cryptoBalance: data.balance_cryptocurrency ?? 0, 
              demoBalance: data.balance_demo ?? 0, 
              isActive: data.active ?? false,
              lastTransactionDate: data.updated_at ? new Date(data.updated_at) : null,
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

      // ... (fetchNotificationsStatus)
       const fetchNotificationsStatus = async () => {
        // Placeholder: Fetch actual unread count
        // For example, from a 'notifications' table where 'user_id' = supabaseUser.id and 'is_read' = false
        // const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', supabaseUser.id).eq('is_read', false);
        // setHasUnreadNotifications(count ? count > 0 : false);
        const unreadCount = 0; 
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

  // UserMenu expects a `user` prop. The type error `Type 'AppUser' is missing... created_at, updated_at`
  // suggests UserMenu internally expects a type matching the global `User` (AuthUserType).
  // My transformedUser now includes created_at, updated_at.
  // The internal UserMenu errors (user.role, user.user_metadata) are still an issue as UserMenu.tsx is not editable.

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
                // Wallet props would be passed if UserMenu accepted them directly
                // e.g. balance={wallet?.balance} currencySymbol={wallet?.symbol}
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

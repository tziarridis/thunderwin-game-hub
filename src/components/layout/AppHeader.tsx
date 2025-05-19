import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
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

const AppHeader = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchWallet = async () => {
        setLoadingWallet(true);
        try {
          // Corrected 'is_active' to 'active' in the select query
          const { data, error } = await supabase
            .from('wallets')
            .select('id, user_id, balance, currency, symbol, vip_level, vip_points, active, last_transaction_date') // Use 'active'
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching wallet:", error.message);
            setWallet(null);
          } else if (data) {
            setWallet({
              id: data.id,
              userId: data.user_id,
              balance: data.balance ?? 0,
              currency: data.currency || 'USD',
              symbol: data.symbol || '$',
              vipLevel: data.vip_level ?? 0,
              vipPoints: data.vip_points ?? 0,
              bonusBalance: (data as any).bonus_balance ?? 0, // Keep as is if not in direct select
              cryptoBalance: (data as any).crypto_balance ?? 0, // Keep as is
              demoBalance: (data as any).demo_balance ?? 0, // Keep as is
              isActive: data.active ?? false, // Map data.active to isActive
              lastTransactionDate: data.last_transaction_date,
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
        const unreadCount = 0; 
        setHasUnreadNotifications(unreadCount > 0);
      };

      fetchNotificationsStatus();
    } else {
      setWallet(null);
      setHasUnreadNotifications(false);
    }
  }, [isAuthenticated, user]);

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
            onClick={toggleTheme}
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
              <UserMenu user={user} onLogout={logout} />
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

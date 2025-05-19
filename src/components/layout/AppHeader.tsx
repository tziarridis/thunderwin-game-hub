import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SiteLogo from '@/components/SiteLogo';
import { useAuth } from '@/contexts/AuthContext';
// MobileNavMenuProps removed as it's not exported/used
import MobileNavMenu from './MobileNavMenu';
import UserMenu from '@/components/user/UserMenu';
import { Wallet, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { WalletType } from '@/types'; // Ensure WalletType is correctly defined and imported


const AppHeader = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletType | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchWallet = async () => {
        // Assuming 'wallets' table and user_id mapping
        // And that user.id from AuthContext is the auth.users.id (UUID)
        // but your 'wallets' table might be linked to a 'public.users.id'
        // This needs to align with your DB schema.
        // For now, assuming direct link or that user.id can be used.
        // This will likely need adjustment based on how public.users and auth.users are linked.
        // If user.id is from auth.users, and wallets.user_id is foreign key to public.users.id,
        // you need to fetch the public.users.id first using auth.users.id.
        
        // Placeholder: This logic needs to correctly fetch wallet based on your user ID setup.
        // Supabase client will use RLS, so if wallets.user_id matches auth.uid(), it should work.
        // Ensure your 'wallets' table RLS allows authenticated users to read their own wallet.
        const { data, error } = await supabase
          .from('wallets')
          .select('balance, currency, vipLevel') // Added vipLevel
          .eq('user_id', user.id) // This must match the column in your wallets table that refs the user
          .maybeSingle();

        if (error) {
          console.error("Error fetching wallet:", error);
        } else if (data) {
          setWallet(data as WalletType);
        }
      };
      fetchWallet();
    } else {
      setWallet(null);
    }
  }, [isAuthenticated, user]);


  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);


  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
                  ${isScrolled || isMobileMenuOpen ? 'bg-casino-thunder-dark/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <SiteLogo className="h-8 md:h-10" />

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <Button variant="link" className="text-white hover:text-primary" asChild><Link to="/">Home</Link></Button>
            <Button variant="link" className="text-white hover:text-primary" asChild><Link to="/casino">Casino</Link></Button>
            <Button variant="link" className="text-white hover:text-primary" asChild><Link to="/live-casino">Live Casino</Link></Button>
            <Button variant="link" className="text-white hover:text-primary" asChild><Link to="/promotions">Promotions</Link></Button>
            {/* <Button variant="link" className="text-white hover:text-primary" asChild><Link to="/tournaments">Tournaments</Link></Button> */}
            {/* <Button variant="link" className="text-white hover:text-primary" asChild><Link to="/vip">VIP</Link></Button> */}
          </nav>
        )}

        <div className="flex items-center space-x-2 md:space-x-3">
          {loading ? (
            <div className="h-8 w-20 bg-gray-700 animate-pulse rounded-md"></div>
          ) : isAuthenticated && user ? (
            <>
              {wallet && !isMobile && (
                 <Button variant="ghost" onClick={() => navigate('/user/wallet')} className="text-sm hidden sm:flex">
                    <Wallet className="mr-2 h-4 w-4 text-primary" /> 
                    {new Intl.NumberFormat(user.user_metadata.language || 'en-US', { style: 'currency', currency: wallet.currency || 'USD' }).format(wallet.balance || 0)}
                    {wallet.vipLevel && <span className="ml-2 text-xs text-amber-400">(VIP {wallet.vipLevel})</span>}
                 </Button>
              )}
              <UserMenu user={user} onLogout={logout} />
            </>
          ) : (
            <>
              <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => navigate('/login')} className="border-primary text-primary hover:bg-primary/10">
                <LogIn className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Login</span>
              </Button>
              <Button size={isMobile ? "sm" : "default"} onClick={() => navigate('/register')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                 <UserPlus className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Register</span>
              </Button>
            </>
          )}
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-white md:hidden">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && (
        <MobileNavMenu 
          isOpen={isMobileMenuOpen} 
          setIsOpen={setIsMobileMenuOpen} 
          // Removed props that were causing issues
        />
      )}
    </header>
  );
};

export default AppHeader;

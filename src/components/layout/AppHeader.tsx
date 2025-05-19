
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SiteLogo from '@/components/SiteLogo';
import { useAuth } from '@/contexts/AuthContext';
import MobileNavMenu from './MobileNavMenu';
import UserMenu from '@/components/user/UserMenu';
import { Wallet, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { WalletType } from '@/types';


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
        const { data, error } = await supabase
          .from('wallets')
          .select('balance, currency, vip_level, vip_points') // Fetched vip_level and vip_points
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching wallet:", error);
          // Check if it's a "column does not exist" error specifically for vip_level or vip_points
          if (error.message.includes("column \"vip_level\" does not exist") || error.message.includes("column \"vip_points\" does not exist")) {
            // Try fetching without them if they don't exist, or log a more specific warning
            console.warn("Attempting to fetch wallet without vip_level/vip_points due to schema mismatch.");
            const { data: basicData, error: basicError } = await supabase
              .from('wallets')
              .select('balance, currency')
              .eq('user_id', user.id)
              .maybeSingle();
            if(basicError) console.error("Error fetching basic wallet info:", basicError);
            else if (basicData) setWallet(basicData as WalletType); // vipLevel and vipPoints will be undefined
          }
        } else if (data) {
          // Map vip_level to vipLevel and vip_points to vipPoints
          setWallet({
            balance: data.balance,
            currency: data.currency,
            vipLevel: data.vip_level,
            vipPoints: data.vip_points,
          } as WalletType);
        }
      };
      fetchWallet();
    } else {
      setWallet(null);
    }
  }, [isAuthenticated, user]);


  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    await logout();
    navigate('/'); // Redirect to home after logout
  }


  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
                  ${isScrolled || isMobileMenuOpen ? 'bg-casino-thunder-dark/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <SiteLogo className="h-8 md:h-10" />

        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <Button variant="link" className="text-white hover:text-primary" asChild><Link to="/">Home</Link></Button>
            <Button variant="link" className="text-white hover:text-primary" asChild><Link to="/casino">Casino</Link></Button>
            <Button variant="link" className="text-white hover:text-primary" asChild><Link to="/live-casino">Live Casino</Link></Button>
            <Button variant="link" className="text-white hover:text-primary" asChild><Link to="/promotions">Promotions</Link></Button>
          </nav>
        )}

        <div className="flex items-center space-x-2 md:space-x-3">
          {loading ? (
            <div className="h-8 w-20 bg-gray-700 animate-pulse rounded-md"></div>
          ) : isAuthenticated && user ? (
            <>
              {wallet && !isMobile && (
                 <Button variant="ghost" onClick={() => navigate('/profile')} className="text-sm hidden sm:flex"> {/* Updated to navigate to /profile (user dashboard) */}
                    <Wallet className="mr-2 h-4 w-4 text-primary" /> 
                    {new Intl.NumberFormat(user.user_metadata.language || 'en-US', { style: 'currency', currency: wallet.currency || 'USD' }).format(wallet.balance || 0)}
                    {wallet.vipLevel !== undefined && <span className="ml-2 text-xs text-amber-400">(VIP {wallet.vipLevel})</span>}
                 </Button>
              )}
              <UserMenu user={user} onLogout={handleLogout} />
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

      {isMobile && (
        <MobileNavMenu 
          isOpen={isMobileMenuOpen} 
          setIsOpen={setIsMobileMenuOpen}
          wallet={wallet} // Pass wallet to MobileNavMenu
        />
      )}
    </header>
  );
};

export default AppHeader;

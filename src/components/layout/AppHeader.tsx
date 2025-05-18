import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/auth/UserMenu"; // Ensure UserMenu expects User type
import { User } from "@/types"; // Import User type
import MobileNavMenu from "./MobileNavMenu";
import { Menu, X, Search, Wallet, Gift, BadgePercent } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const AppHeader = () => {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false); // Close mobile menu if screen resizes to desktop
    }
  }, [isMobile, mobileMenuOpen]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 h-16 bg-casino-thunder-dark/80 backdrop-blur-md shadow-lg transition-all duration-300",
      // Add more dynamic styles if needed
    )}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo and Desktop Nav */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold text-casino-thunder-gold hover:text-casino-thunder-highlight transition-colors">
            ThunderSpin
          </Link>
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/casino" className="text-sm font-medium text-white hover:text-casino-thunder-gold transition-colors">Casino</Link>
              <Link to="/sports" className="text-sm font-medium text-white hover:text-casino-thunder-gold transition-colors">Sports</Link>
              <Link to="/promotions" className="text-sm font-medium text-white hover:text-casino-thunder-gold transition-colors">Promotions</Link>
              <Link to="/vip" className="text-sm font-medium text-white hover:text-casino-thunder-gold transition-colors">VIP</Link>
            </nav>
          )}
        </div>

        {/* Search, Wallet, Auth Buttons */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {!isMobile && (
             <Button variant="ghost" size="icon" className="text-white hover:text-casino-thunder-gold">
                <Search className="h-5 w-5" />
            </Button>
          )}

          {isAuthenticated && user && !isMobile && (
            <>
              <Button variant="ghost" size="icon" className="text-white hover:text-casino-thunder-gold" onClick={() => navigate('/bonuses')}>
                <Gift className="h-5 w-5" />
              </Button>
               <Button variant="outline" className="border-casino-thunder-gold text-casino-thunder-gold hover:bg-casino-thunder-gold/10" onClick={() => navigate('/profile')}>
                <Wallet className="h-4 w-4 mr-2" />
                {(user.balance ?? 0).toLocaleString(undefined, { style: 'currency', currency: user.currency || 'USD' })}
              </Button>
            </>
          )}
          
          {loading ? (
            <div className="h-8 w-20 bg-gray-700 animate-pulse rounded-md"></div>
          ) : isAuthenticated && user ? (
             // UserMenu expects User type or null
            <UserMenu user={user as User} onSignOut={handleSignOut} />
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate("/login")} className="border-casino-thunder-gold text-casino-thunder-gold hover:bg-casino-thunder-gold hover:text-black">
                Log In
              </Button>
              <Button onClick={() => navigate("/register")} className="bg-casino-thunder-gold text-black hover:bg-casino-thunder-highlight">
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-casino-thunder-gold"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && mobileMenuOpen && (
        <MobileNavMenu 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
          user={user} 
          isAuthenticated={isAuthenticated}
          onSignOut={handleSignOut}
        />
      )}
    </header>
  );
};

export default AppHeader;

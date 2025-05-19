
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/user/UserMenu";
import MobileNavMenu from "./MobileNavMenu"; 
import { Menu, X, Wallet, Loader2 } from "lucide-react"; 
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import SiteLogo from "@/components/SiteLogo";
import { User, Wallet as WalletType } from "@/types"; // WalletType alias for clarity

const AppHeader = () => {
    const { user, isAuthenticated, signOut, loading: authLoading, wallet } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isMobile = useIsMobile();

    const handleSignOut = async () => {
        if (signOut) { 
          await signOut();
        }
        setMobileMenuOpen(false); // Close menu on sign out
        navigate("/");
    };

    useEffect(() => {
        // Close mobile menu if screen size changes from mobile to desktop while menu is open
        if (!isMobile && mobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    }, [isMobile, mobileMenuOpen]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);


    return (
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-border/60",
          "transition-all duration-300" // Ensure smooth transitions for any property changes
        )}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <SiteLogo className="h-8 w-auto" />
            {/* <span className="font-bold text-xl text-primary">ThunderWin</span> Optional: if SiteLogo doesn't include text */}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-4">
            <Button variant="link" asChild><Link to="/casino">Casino</Link></Button>
            <Button variant="link" asChild><Link to="/sports">Sports</Link></Button>
            <Button variant="link" asChild><Link to="/promotions">Promotions</Link></Button>
            {/* Add more links as needed */}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            {authLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isAuthenticated && user ? (
              <>
                {wallet && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/profile?tab=wallet')} 
                    className="hidden sm:flex items-center" // Show on sm screens and up
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    {(wallet.balance ?? 0).toFixed(2)} {wallet.currency}
                  </Button>
                )}
                <UserMenu user={user} onSignOut={handleSignOut} />
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Log In</Button>
                <Button size="sm" onClick={() => navigate("/register")} className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu - Rendered conditionally */}
        {isMobile && mobileMenuOpen && (
          <MobileNavMenu 
            // Removed setIsOpen as it's not an expected prop for MobileNavMenu
            isAuthenticated={isAuthenticated}
            onSignOut={handleSignOut} // Pass signout to allow menu to trigger it
            user={user as User} // Pass user data for display in menu
            wallet={wallet as WalletType | null} // Pass wallet data
            // If MobileNavMenu needs to close itself (e.g. after a link click),
            // it should accept an `onClose` prop, which would call `setMobileMenuOpen(false)` here.
            // For now, route changes handled by useEffect above will close it.
          />
        )}
      </header>
    );
};

export default AppHeader;


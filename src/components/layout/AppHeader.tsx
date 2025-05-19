
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/user/UserMenu";
// User type is not directly used here, but UserMenu uses it.
import MobileNavMenu from "./MobileNavMenu";
import { Menu, X, Wallet } from "lucide-react"; // Gift removed as it's not used directly here
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import SiteLogo from "@/components/SiteLogo"; // This should now resolve

const AppHeader = () => {
  const { user, isAuthenticated, signOut, loading: authLoading, wallet } = useAuth(); // Added wallet
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut(); 
    setMobileMenuOpen(false);
    navigate("/");
  };

  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false); 
    }
  }, [isMobile, mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    if(mobileMenuOpen) {
        setMobileMenuOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]); // mobileMenuOpen removed from deps to avoid re-triggering itself


  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-border/60", 
      "transition-all duration-300"
    )}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <SiteLogo className="h-8 w-auto" />
          {/* <span className="font-bold text-xl hidden sm:inline">YourSite</span> */}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-4">
          <Button variant="link" asChild><Link to="/casino">Casino</Link></Button>
          <Button variant="link" asChild><Link to="/promotions">Promotions</Link></Button>
          {/* Add more links as needed */}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {authLoading ? (
            <LocalLoader className="h-5 w-5 animate-spin" /> // Renamed to LocalLoader
          ) : isAuthenticated && user ? (
            <>
              {wallet && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/wallet')} className="hidden sm:flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  {wallet.balance.toFixed(2)} {wallet.currency}
                </Button>
              )}
              <UserMenu user={user} onSignOut={handleSignOut} />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth/login")}>Log In</Button>
              <Button size="sm" onClick={() => navigate("/auth/signup")} className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
            </>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {mobileMenuOpen && isMobile && (
        <MobileNavMenu 
          user={user} 
          isAuthenticated={isAuthenticated} 
          onSignOut={handleSignOut} 
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

// Renamed Loader2 to LocalLoader to avoid conflict if lucide-react's Loader2 is also imported/used.
const LocalLoader = ({ className }: { className?: string }) => <div className={cn("animate-spin rounded-full h-5 w-5 border-b-2 border-current", className)}></div>;


export default AppHeader;

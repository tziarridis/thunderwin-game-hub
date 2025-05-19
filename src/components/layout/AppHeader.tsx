
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/user/UserMenu";
import { User } from "@/types"; // Using your app's User type
import MobileNavMenu from "./MobileNavMenu";
import { Menu, X, Search, Wallet, Gift } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import SiteLogo from "@/components/SiteLogo"; // Assuming you have a logo component

const AppHeader = () => {
  const { user, isAuthenticated, signOut, loading: authLoading, wallet } = useAuth(); // Added wallet
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut(); // signOut is now available
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
  }, [location, mobileMenuOpen]); // Depend on location


  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-border/60", // Adjusted height and style
      "transition-all duration-300"
    )}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <SiteLogo className="h-8 w-auto" />
          {/* <span className="font-bold text-xl hidden sm:inline">YourSite</span> */}
        </Link>

        {/* Desktop Navigation (placeholder, expand as needed) */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-4">
          <Button variant="link" asChild><Link to="/casino">Casino</Link></Button>
          <Button variant="link" asChild><Link to="/promotions">Promotions</Link></Button>
          {/* <Button variant="link" asChild><Link to="/live-casino">Live Casino</Link></Button> */}
          {/* <Button variant="link" asChild><Link to="/sports">Sports</Link></Button> */}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {authLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
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
// Placeholder for Loader2 if not already available globally
const Loader2 = ({ className }: { className?: string }) => <div className={cn("animate-spin rounded-full h-5 w-5 border-b-2 border-current", className)}></div>;


export default AppHeader;

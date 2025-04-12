
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  CreditCard, 
  ShieldCheck, 
  Gift
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { isMobile } = useMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle scroll effect on header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out Successfully",
      description: "Come back soon!",
    });
    navigate("/");
  };

  const primaryNavLinks = [
    { name: "Casino", path: "/casino" },
    { name: "Sports", path: "/sports" },
    { name: "Promotions", path: "/promotions" },
    { name: "VIP", path: "/vip" },
  ];

  const secondaryNavLinks = [
    { name: "Help", path: "/help" },
    { name: "Contact", path: "/contact" },
    { name: "Responsible Gaming", path: "/responsible-gaming" },
  ];
  
  // Generate VIP badge text based on user's VIP level
  const getVipBadge = () => {
    if (!user || typeof user.vipLevel !== 'number') return null;
    
    if (user.vipLevel === 0) return null; // No badge for level 0
    
    const vipNames = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
    const vipName = user.vipLevel <= vipNames.length ? vipNames[user.vipLevel - 1] : `VIP ${user.vipLevel}`;
    
    return (
      <div className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold">
        {vipName}
      </div>
    );
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled ? "header-blur py-2" : "bg-transparent py-4"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/file.svg" alt="ThunderWin" className="h-8 thunder-glow" />
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-1">
              {primaryNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-3 py-2 text-white/90 hover:text-white rounded-md transition-colors hover:bg-white/5"
                >
                  {link.name}
                </Link>
              ))}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-3 py-2 text-white/90 hover:text-white rounded-md transition-colors hover:bg-white/5 flex items-center">
                    More <ChevronDown size={16} className="ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-casino-thunder-dark border-white/10">
                  {secondaryNavLinks.map((link) => (
                    <DropdownMenuItem key={link.path} asChild>
                      <Link to={link.path} className="cursor-pointer">
                        {link.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          )}

          {/* Auth buttons or user menu */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/admin")}
                    className="mr-2 border-white/20 hover:border-casino-thunder-green hover:bg-casino-thunder-green/5"
                  >
                    Admin Panel
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost"
                      className="flex items-center space-x-2 hover:bg-white/5"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        {user?.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.name || "User"} 
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <User size={18} className="text-white/70" />
                        )}
                      </div>
                      {!isMobile && (
                        <div className="flex items-center">
                          <div className="text-left">
                            <div className="text-sm font-medium flex items-center">
                              {user?.name || user?.username || "User"}
                              {getVipBadge()}
                            </div>
                            <div className="text-xs text-white/60">${user?.balance?.toFixed(2) || "0.00"}</div>
                          </div>
                          <ChevronDown size={16} className="ml-1 text-white/60" />
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-casino-thunder-dark border-white/10">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      My Account
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center cursor-pointer">
                        <User size={16} className="mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/transactions" className="flex items-center cursor-pointer">
                        <CreditCard size={16} className="mr-2" />
                        Transactions
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/bonuses" className="flex items-center cursor-pointer">
                        <Gift size={16} className="mr-2" />
                        My Bonuses
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/kyc" className="flex items-center cursor-pointer">
                        <ShieldCheck size={16} className="mr-2" />
                        Identity Verification
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center cursor-pointer">
                        <Settings size={16} className="mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem 
                      className="flex items-center text-red-400 hover:text-red-300 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size={isMobile ? "sm" : "default"}
                  onClick={() => navigate("/login")}
                  className="text-white hover:bg-white/5"
                >
                  Login
                </Button>
                <Button 
                  size={isMobile ? "sm" : "default"}
                  onClick={() => navigate("/register")}
                  className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                >
                  Sign Up
                </Button>
              </>
            )}
            
            {/* Mobile menu button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:bg-white/5"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobile && mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <nav className="flex flex-col space-y-1">
              {primaryNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-3 py-2 text-white/90 hover:text-white rounded-md transition-colors hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {secondaryNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-3 py-2 text-white/90 hover:text-white rounded-md transition-colors hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

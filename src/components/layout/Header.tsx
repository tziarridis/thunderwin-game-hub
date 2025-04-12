
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Menu, 
  X, 
  LogIn, 
  Wallet, 
  Home, 
  Gamepad2, 
  Trophy, 
  Gift, 
  BadgeDollarSign,
  LogOut,
  Settings,
  ChevronDown,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DepositButton from "@/components/user/DepositButton";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(balance);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 header-blur border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src="/file.svg" 
                alt="ThunderWin" 
                className="h-8 w-auto thunder-glow"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <NavItem 
              icon={<Home size={18} />} 
              text="Home" 
              to="/" 
              isActive={isActive("/")}
            />
            <NavItem 
              icon={<Gamepad2 size={18} />} 
              text="Casino" 
              to="/casino" 
              isActive={isActive("/casino")}
            />
            <NavItem 
              icon={<Trophy size={18} />} 
              text="Sports" 
              to="/sports" 
              isActive={isActive("/sports")}
            />
            <NavItem 
              icon={<Gift size={18} />} 
              text="Promotions" 
              to="/promotions" 
              isActive={isActive("/promotions")}
            />
            <NavItem 
              icon={<BadgeDollarSign size={18} />} 
              text="VIP" 
              to="/vip" 
              isActive={isActive("/vip")}
            />
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="bg-white/5 px-3 py-1 rounded-md text-white/90 flex items-center mr-2">
                  <Wallet size={16} className="mr-2 text-casino-thunder-green" />
                  <span>{user?.balance ? formatBalance(user.balance) : "$0.00"}</span>
                </div>
                
                <DepositButton variant="small" />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-md flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {user?.username}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-casino-thunder-dark border-white/10">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/transactions")}>
                      <Wallet className="mr-2 h-4 w-4" />
                      Transactions
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <DepositButton variant="small" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-md"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button 
                  size="sm" 
                  className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black rounded-md"
                  onClick={() => navigate("/register")}
                >
                  Register
                </Button>
                {/* Show admin link for demo purposes */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-md"
                  onClick={() => navigate("/admin")}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Backoffice
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && <DepositButton variant="icon" />}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden thunder-gradient border-t border-white/5">
          <div className="px-4 pt-2 pb-3 space-y-1 sm:px-5">
            <MobileNavItem 
              icon={<Home size={18} />} 
              text="Home" 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              isActive={isActive("/")}
            />
            <MobileNavItem 
              icon={<Gamepad2 size={18} />} 
              text="Casino" 
              to="/casino" 
              onClick={() => setIsMenuOpen(false)}
              isActive={isActive("/casino")}
            />
            <MobileNavItem 
              icon={<Trophy size={18} />} 
              text="Sports" 
              to="/sports" 
              onClick={() => setIsMenuOpen(false)}
              isActive={isActive("/sports")}
            />
            <MobileNavItem 
              icon={<Gift size={18} />} 
              text="Promotions" 
              to="/promotions" 
              onClick={() => setIsMenuOpen(false)}
              isActive={isActive("/promotions")}
            />
            <MobileNavItem 
              icon={<BadgeDollarSign size={18} />} 
              text="VIP" 
              to="/vip" 
              onClick={() => setIsMenuOpen(false)}
              isActive={isActive("/vip")}
            />
            
            {isAuthenticated && (
              <>
                <div className="pt-2 pb-1">
                  <div className="flex items-center px-3 py-2">
                    <Wallet size={18} className="text-casino-thunder-green mr-3" />
                    <span className="font-medium">Balance: {user?.balance ? formatBalance(user.balance) : "$0.00"}</span>
                  </div>
                </div>
                <MobileNavItem 
                  icon={<User size={18} />} 
                  text="Profile" 
                  to="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  isActive={isActive("/profile")}
                />
                <MobileNavItem 
                  icon={<Wallet size={18} />} 
                  text="Transactions" 
                  to="/transactions" 
                  onClick={() => setIsMenuOpen(false)}
                  isActive={isActive("/transactions")}
                />
                <MobileNavItem 
                  icon={<Settings size={18} />} 
                  text="Settings" 
                  to="/settings" 
                  onClick={() => setIsMenuOpen(false)}
                  isActive={isActive("/settings")}
                />
                {user?.email === "admin@example.com" && (
                  <MobileNavItem 
                    icon={<LayoutDashboard size={18} />} 
                    text="Admin Dashboard" 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    isActive={isActive("/admin")}
                  />
                )}
                <button 
                  className="w-full flex items-center px-3 py-2 text-base font-medium text-white hover:text-red-400 hover:bg-white/5 rounded-md transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-3" />
                  Logout
                </button>
              </>
            )}
            
            {!isAuthenticated && (
              <div className="pt-4 pb-3 border-t border-white/10">
                <div className="flex items-center px-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-center rounded-md"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/login");
                    }}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                  <div className="w-4"></div>
                  <Button 
                    size="sm" 
                    className="w-full justify-center bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black rounded-md"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/register");
                    }}
                  >
                    Register
                  </Button>
                  <div className="w-4"></div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-center rounded-md"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/admin");
                    }}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Backoffice
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const NavItem = ({ 
  icon, 
  text, 
  to, 
  isActive = false 
}: { 
  icon: React.ReactNode; 
  text: string; 
  to: string;
  isActive?: boolean;
}) => (
  <Link 
    to={to} 
    className={`px-3 py-2 text-sm font-medium transition-colors flex items-center ${
      isActive 
        ? 'text-casino-thunder-green' 
        : 'text-white hover:text-casino-thunder-green'
    }`}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {text}
  </Link>
);

const MobileNavItem = ({ 
  icon, 
  text, 
  to, 
  onClick,
  isActive = false
}: { 
  icon: React.ReactNode; 
  text: string; 
  to: string;
  onClick?: () => void;
  isActive?: boolean;
}) => (
  <Link 
    to={to} 
    className={`block px-3 py-2 text-base font-medium hover:bg-white/5 rounded-md transition-colors flex items-center ${
      isActive 
        ? 'text-casino-thunder-green bg-white/5' 
        : 'text-white hover:text-casino-thunder-green'
    }`}
    onClick={onClick}
  >
    {icon && <span className="mr-3">{icon}</span>}
    {text}
  </Link>
);

export default Header;

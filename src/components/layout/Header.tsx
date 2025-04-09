
import { useState } from "react";
import { Link } from "react-router-dom";
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
  DollarSign
} from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 header-blur border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png" 
                alt="ThunderWin" 
                className="h-8 w-auto thunder-glow"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <NavItem icon={<Home size={18} />} text="Home" to="/" />
            <NavItem icon={<Gamepad2 size={18} />} text="Casino" to="/casino" />
            <NavItem icon={<Trophy size={18} />} text="Sports" to="/sports" />
            <NavItem icon={<Gift size={18} />} text="Promotions" to="/promotions" />
            <NavItem icon={<BadgeDollarSign size={18} />} text="VIP" to="/vip" />
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" size="sm" className="rounded-md">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
            <Button size="sm" className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black rounded-md">
              Register
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
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
            <MobileNavItem icon={<Home size={18} />} text="Home" to="/" />
            <MobileNavItem icon={<Gamepad2 size={18} />} text="Casino" to="/casino" />
            <MobileNavItem icon={<Trophy size={18} />} text="Sports" to="/sports" />
            <MobileNavItem icon={<Gift size={18} />} text="Promotions" to="/promotions" />
            <MobileNavItem icon={<BadgeDollarSign size={18} />} text="VIP" to="/vip" />
            
            <div className="pt-4 pb-3 border-t border-white/10">
              <div className="flex items-center px-2">
                <Button variant="outline" size="sm" className="w-full justify-center rounded-md">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <div className="w-4"></div>
                <Button size="sm" className="w-full justify-center bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black rounded-md">
                  Register
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const NavItem = ({ icon, text, to }: { icon: React.ReactNode; text: string; to: string }) => (
  <Link 
    to={to} 
    className="px-3 py-2 text-sm font-medium text-white hover:text-casino-thunder-green transition-colors flex items-center"
  >
    {icon && <span className="mr-2">{icon}</span>}
    {text}
  </Link>
);

const MobileNavItem = ({ icon, text, to }: { icon: React.ReactNode; text: string; to: string }) => (
  <Link 
    to={to} 
    className="block px-3 py-2 text-base font-medium text-white hover:text-casino-thunder-green hover:bg-white/5 rounded-md transition-colors flex items-center"
  >
    {icon && <span className="mr-3">{icon}</span>}
    {text}
  </Link>
);

export default Header;

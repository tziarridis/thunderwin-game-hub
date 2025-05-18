
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { X, LogIn, UserPlus, Home, LayoutGrid, Gift, Award, LifeBuoy, ShieldCheck, Search, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isAuthenticated: boolean;
  onSignOut: () => void;
}

const MobileNavMenu = ({ isOpen, onClose, user, isAuthenticated, onSignOut }: MobileNavMenuProps) => {
  const navigate = useNavigate();
  const { signOut: contextSignOut } = useAuth(); // Renamed to avoid conflict with prop

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSignOutClick = async () => {
    if (onSignOut) {
        onSignOut(); // Use prop if provided for specific header logic
    } else {
        await contextSignOut(); // Fallback to context signOut
        navigate("/");
    }
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-casino-thunder-dark/95 backdrop-blur-lg md:hidden">
      <div className="container mx-auto px-4 py-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-2xl font-bold text-casino-thunder-gold" onClick={onClose}>
            ThunderSpin
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
            <X className="h-7 w-7" />
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="search" 
            placeholder="Search games..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/20 rounded-full text-white placeholder-gray-400 focus:ring-2 focus:ring-casino-thunder-gold focus:border-casino-thunder-gold outline-none"
            // Add onChange and value if search functionality is implemented
          />
        </div>

        {isAuthenticated && user && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="font-semibold text-lg text-white">{user.displayName || user.username || "Player"}</p>
                    <p className="text-sm text-casino-thunder-gold">Balance: {(user.balance ?? 0).toLocaleString(undefined, { style: 'currency', currency: user.currency || 'USD' })}</p>
                </div>
                 <Button variant="ghost" size="icon" className="text-casino-thunder-gold" onClick={() => handleNavigation('/profile')}>
                    <Wallet className="h-6 w-6" />
                </Button>
            </div>
            <Button 
                onClick={() => { /* TODO: Implement deposit */ onClose(); navigate('/profile'); /* Placeholder for deposit page */}} 
                className="w-full bg-casino-thunder-green text-black font-semibold hover:bg-casino-thunder-green/90"
            >
                Deposit
            </Button>
          </div>
        )}

        <nav className="flex-grow space-y-3 overflow-y-auto pb-4">
          <LinkItem icon={Home} label="Home" path="/" onClick={() => handleNavigation("/")} />
          <LinkItem icon={LayoutGrid} label="Casino" path="/casino" onClick={() => handleNavigation("/casino")} />
          <LinkItem icon={Award} label="Sports" path="/sports" onClick={() => handleNavigation("/sports")} />
          <LinkItem icon={Gift} label="Promotions" path="/promotions" onClick={() => handleNavigation("/promotions")} />
          <LinkItem icon={ShieldCheck} label="VIP" path="/vip" onClick={() => handleNavigation("/vip")} />
          <LinkItem icon={LifeBuoy} label="Support" path="/support/help" onClick={() => handleNavigation("/support/help")} />
        </nav>

        {!isAuthenticated ? (
          <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
            <Button
              variant="outline"
              onClick={() => handleNavigation("/login")}
              className="w-full border-casino-thunder-gold text-casino-thunder-gold hover:bg-casino-thunder-gold hover:text-black"
            >
              <LogIn className="mr-2 h-5 w-5" /> Log In
            </Button>
            <Button
              onClick={() => handleNavigation("/register")}
              className="w-full bg-casino-thunder-gold text-black hover:bg-casino-thunder-highlight"
            >
              <UserPlus className="mr-2 h-5 w-5" /> Sign Up
            </Button>
          </div>
        ) : (
          <div className="mt-auto pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={handleSignOutClick}
              className="w-full text-casino-thunder-gold hover:bg-casino-thunder-gold/10"
            >
              Log Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface LinkItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  onClick: () => void;
}

const LinkItem: React.FC<LinkItemProps> = ({ icon: Icon, label, path, onClick }) => {
  return (
    <Link
      to={path}
      onClick={onClick}
      className="flex items-center space-x-3 p-3 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors group"
    >
      <Icon className="h-5 w-5 text-casino-thunder-gold group-hover:text-casino-thunder-highlight" />
      <span className="font-medium text-lg">{label}</span>
    </Link>
  );
};

export default MobileNavMenu;

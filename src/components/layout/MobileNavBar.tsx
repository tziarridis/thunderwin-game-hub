
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Gamepad2, Zap, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import WalletBalance from "@/components/user/WalletBalance";
import DepositButton from "@/components/user/DepositButton"; 

interface MobileNavBarProps {
  onOpenMenu: () => void;
}

const MobileNavBar = ({ onOpenMenu }: MobileNavBarProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-casino-thunder-darker border-t border-white/10 z-40">
      <div className="container px-2 py-2 grid grid-cols-5">
        <NavItem 
          icon={<Home />} 
          label="Home" 
          onClick={() => handleNavigation("/")}
        />
        
        <NavItem 
          icon={<Gamepad2 />} 
          label="Casino" 
          onClick={() => handleNavigation("/casino")}
        />
        
        {isAuthenticated ? (
          <div className="flex flex-col items-center justify-center -mt-6">
            <WalletBalance 
              variant="compact" 
              className="bg-casino-thunder-green text-black px-3 py-2 rounded-full shadow-lg" 
              showRefresh={false} 
            />
            <DepositButton 
              variant="icon" 
              className="h-6 w-6 mt-1 p-0"
            />
          </div>
        ) : (
          <NavItem 
            icon={<Zap />} 
            label="Play" 
            onClick={() => handleNavigation("/login")}
            highlight
          />
        )}
        
        <NavItem 
          icon={<User />} 
          label="Profile" 
          onClick={() => isAuthenticated ? handleNavigation("/profile") : handleNavigation("/login")}
        />
        
        <NavItem 
          icon={<Menu />} 
          label="Menu" 
          onClick={onOpenMenu}
        />
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, onClick, highlight }) => {
  return (
    <Button 
      variant="ghost" 
      className={cn(
        "flex flex-col items-center justify-center h-14 p-0 hover:bg-transparent",
        highlight ? "text-casino-thunder-green" : "text-white/80"
      )}
      onClick={onClick}
    >
      <div className="text-[20px]">{icon}</div>
      <span className="text-[10px] mt-0.5">{label}</span>
    </Button>
  );
};

export default MobileNavBar;

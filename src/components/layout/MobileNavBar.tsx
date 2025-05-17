
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Gamepad2, Zap, Menu, User, PlusCircle } from "lucide-react"; // Added PlusCircle for Deposit
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import WalletBalance from "@/components/user/WalletBalance";
// DepositButton is read-only. We will use a regular button styled as an icon if "icon" variant is not supported.

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
            {/* Assuming DepositButton (read-only) can be replaced by a regular Button or styled */}
            {/* For now, using a regular button if DepositButton variant="icon" caused issues */}
             <Button 
              variant="ghost" // Use a valid variant
              size="sm" // Use a valid size
              className="h-8 w-8 mt-1 p-0 text-casino-thunder-green hover:text-casino-thunder-green/80" // Style as icon
              onClick={() => navigate('/payment/deposit')} // Example action
            >
              <PlusCircle size={24}/>
            </Button>
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
        "flex flex-col items-center justify-center h-14 p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0", // Added focus visibility reset
        highlight ? "text-casino-thunder-green" : "text-white/80",
        "hover:text-casino-thunder-green" // Ensure hover color is consistent
      )}
      onClick={onClick}
    >
      <div className="text-[20px]">{icon}</div>
      <span className="text-[10px] mt-0.5">{label}</span>
    </Button>
  );
};

export default MobileNavBar;

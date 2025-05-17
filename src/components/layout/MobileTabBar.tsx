
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Gamepad2, Zap, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface MobileTabBarProps {
  onOpenMenu: () => void;
}

export const MobileTabBar = ({ onOpenMenu }: MobileTabBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    {
      icon: <Home size={20} />,
      label: "Home",
      path: "/",
      onClick: () => navigate("/")
    },
    {
      icon: <Gamepad2 size={20} />,
      label: "Casino",
      path: "/casino",
      onClick: () => navigate("/casino")
    },
    {
      icon: <Zap size={20} />,
      label: "Play",
      path: "#play",
      highlight: true,
      onClick: () => isAuthenticated ? navigate("/casino") : navigate("/login")
    },
    {
      icon: <User size={20} />,
      label: "Profile",
      path: "/profile",
      onClick: () => isAuthenticated ? navigate("/profile") : navigate("/login")
    },
    {
      icon: <Menu size={20} />,
      label: "Menu",
      path: "#menu",
      onClick: onOpenMenu
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-casino-thunder-darker border-t border-white/10 z-40 h-16">
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost" // Valid variant
            size="default" // Explicitly set a valid size or remove if not needed for custom styling
            className={cn(
              "flex flex-col items-center justify-center rounded-none h-full p-1", // Adjusted padding for smaller text
              isActive(item.path) ? "text-casino-thunder-green" : "text-white/70",
              item.highlight && "text-casino-thunder-green"
            )}
            onClick={item.onClick}
          >
            <div className="text-[20px]">{item.icon}</div>
            <span className="text-[10px] mt-0.5 leading-tight">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileTabBar;


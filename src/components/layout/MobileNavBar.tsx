import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, Compass, Heart, User, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface MobileNavBarProps {
  onOpenMenu: () => void;
}

const MobileNavBar = ({ onOpenMenu }: MobileNavBarProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // navigate('/login'); or similar
  };
  
  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-casino-thunder-darker border-t border-casino-thunder-dark z-50">
      <div className="container mx-auto flex justify-around items-center h-16">
        <NavLink to="/" className={({ isActive }) => isActive ? "text-primary" : "text-white/50 hover:text-white"} >
          <div className="flex flex-col items-center">
            <Home className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </div>
        </NavLink>
        <NavLink to="/casino/main" className={({ isActive }) => isActive ? "text-primary" : "text-white/50 hover:text-white"}>
          <div className="flex flex-col items-center">
            <Compass className="h-6 w-6" />
            <span className="text-xs">Casino</span>
          </div>
        </NavLink>
        <NavLink to="/casino/favorites" className={({ isActive }) => isActive ? "text-primary" : "text-white/50 hover:text-white"}>
          <div className="flex flex-col items-center">
            <Heart className="h-6 w-6" />
            <span className="text-xs">Favorites</span>
          </div>
        </NavLink>
        {isAuthenticated ? (
          <NavLink to="/profile" className={({ isActive }) => isActive ? "text-primary" : "text-white/50 hover:text-white"}>
            <div className="flex flex-col items-center">
              <User className="h-6 w-6" />
              <span className="text-xs">Profile</span>
            </div>
          </NavLink>
        ) : (
          <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
        )}
        <Button variant="ghost" onClick={onOpenMenu}>
          <Menu className="h-6 w-6 text-white/50 hover:text-white" />
        </Button>
      </div>
    </div>
  );
};

export default MobileNavBar;

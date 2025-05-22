import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavMenu = ({ isOpen, onClose }: MobileNavMenuProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose(); // Close menu after logout
    // navigate('/login'); or similar
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetTrigger asChild>
        <Menu className="h-6 w-6 cursor-pointer md:hidden" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 sm:w-80 bg-casino-thunder-darker text-white">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate through our exciting options.
          </SheetDescription>
        </SheetHeader>
        <nav className="grid gap-4 py-4">
          <NavLink to="/" className="block px-4 py-2 hover:bg-gray-700 rounded-md" onClick={onClose}>
            Home
          </NavLink>
          <NavLink to="/casino" className="block px-4 py-2 hover:bg-gray-700 rounded-md" onClick={onClose}>
            Casino
          </NavLink>
          <NavLink to="/sports" className="block px-4 py-2 hover:bg-gray-700 rounded-md" onClick={onClose}>
            Sports
          </NavLink>
          <NavLink to="/promotions" className="block px-4 py-2 hover:bg-gray-700 rounded-md" onClick={onClose}>
            Promotions
          </NavLink>
          <NavLink to="/vip" className="block px-4 py-2 hover:bg-gray-700 rounded-md" onClick={onClose}>
            VIP
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className="block px-4 py-2 hover:bg-gray-700 rounded-md" onClick={onClose}>
                Profile
              </NavLink>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 rounded-md">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="block px-4 py-2 hover:bg-gray-700 rounded-md" onClick={onClose}>
                Login
              </NavLink>
              <NavLink to="/register" className="block px-4 py-2 hover:bg-gray-700 rounded-md" onClick={onClose}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavMenu;

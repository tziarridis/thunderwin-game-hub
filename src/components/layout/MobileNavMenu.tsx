
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Home, LayoutDashboard, Gift, User, Settings, HelpCircle, LogOut, LogIn, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, signOut, isAdmin } = useAuth(); // Use signOut
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(); // Use signOut
      toast.success("Logged out successfully.");
      navigate('/');
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/casino', icon: LayoutDashboard, label: 'Casino' },
    { to: '/sports', icon: LayoutDashboard, label: 'Sports' },
    { to: '/promotions', icon: Gift, label: 'Promotions' },
    { to: '/bonuses', icon: Gift, label: 'Bonuses' },
    { to: '/vip', icon: User, label: 'VIP' },
    { to: '/support/help', icon: HelpCircle, label: 'Support' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0 bg-card text-card-foreground">
        <SheetHeader className="px-4 pt-4 pb-2 border-b">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center px-4 py-2 hover:bg-muted"
              onClick={onClose}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          
          <Separator className="my-2" />
          
          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                className="flex items-center px-4 py-2 hover:bg-muted"
                onClick={onClose}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </NavLink>
              
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className="flex items-center px-4 py-2 hover:bg-muted"
                  onClick={onClose}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Panel
                </NavLink>
              )}
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start flex items-center px-4 py-2 hover:bg-muted text-destructive hover:text-destructive-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="flex items-center px-4 py-2 hover:bg-muted"
                onClick={onClose}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="flex items-center px-4 py-2 hover:bg-muted"
                onClick={onClose}
              >
                <Plus className="mr-2 h-4 w-4" />
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

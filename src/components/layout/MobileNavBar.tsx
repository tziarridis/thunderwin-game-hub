
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User } from '@/types'; // App's User type
import { Home, UserCircle, LogOut, LogIn, UserPlus, Gift, Wallet } from 'lucide-react'; // Added more icons

interface MobileNavBarProps {
  onClose: () => void; // To close the menu
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({ onClose }) => {
  const { user, isAuthenticated, signOut, wallet } = useAuth(); // signOut is now available, added wallet
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    onClose(); // Close menu after action
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose(); // Close menu after navigation
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 bg-background border-t border-border p-2 shadow-lg md:hidden z-40">
        <div className="flex justify-around items-center">
            <Button variant="ghost" className="flex flex-col items-center h-auto p-1" onClick={() => handleNavigate('/')}>
                <Home className="h-5 w-5 mb-0.5" />
                <span className="text-xs">Home</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center h-auto p-1" onClick={() => handleNavigate('/casino')}>
                <Gift className="h-5 w-5 mb-0.5" /> {/* Placeholder for Casino icon */}
                <span className="text-xs">Casino</span>
            </Button>

            {isAuthenticated && user ? (
                <>
                    <Button variant="ghost" className="flex flex-col items-center h-auto p-1" onClick={() => handleNavigate('/wallet')}>
                        <Wallet className="h-5 w-5 mb-0.5" />
                        <span className="text-xs">Wallet</span>
                    </Button>
                    <Button variant="ghost" className="flex flex-col items-center h-auto p-1" onClick={() => handleNavigate('/user/profile')}>
                        <UserCircle className="h-5 w-5 mb-0.5" />
                        <span className="text-xs">Profile</span>
                    </Button>
                    <Button variant="ghost" className="flex flex-col items-center h-auto p-1 text-red-500 hover:text-red-600" onClick={handleSignOut}>
                        <LogOut className="h-5 w-5 mb-0.5" />
                        <span className="text-xs">Sign Out</span>
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="ghost" className="flex flex-col items-center h-auto p-1" onClick={() => handleNavigate('/auth/login')}>
                        <LogIn className="h-5 w-5 mb-0.5" />
                        <span className="text-xs">Log In</span>
                    </Button>
                    <Button variant="ghost" className="flex flex-col items-center h-auto p-1" onClick={() => handleNavigate('/auth/signup')}>
                        <UserPlus className="h-5 w-5 mb-0.5" />
                        <span className="text-xs">Sign Up</span>
                    </Button>
                </>
            )}
        </div>
    </nav>
  );
};

export default MobileNavBar;

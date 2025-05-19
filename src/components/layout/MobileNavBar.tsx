
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
// User type import not directly used, App's User type is from useAuth
import { Home, UserCircle, LogOut, LogIn, UserPlus, Gift, Wallet as WalletIcon } from 'lucide-react'; // Renamed Wallet to WalletIcon
import { WalletType } from '@/types'; // Import WalletType

interface MobileNavBarProps {
  onClose: () => void;
  wallet: WalletType | null; // Accept wallet as a prop
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({ onClose, wallet }) => {
  const { user, isAuthenticated, logout } = useAuth(); // Changed signOut to logout, removed wallet from context
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout(); // Use logout
    onClose();
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 bg-background border-t border-border p-2 shadow-lg md:hidden z-40">
        <div className="flex justify-around items-center">
            <Button variant="ghost" className="flex flex-col items-center h-auto p-1" onClick={() => handleNavigate('/')}>
                <Home className="h-5 w-5 mb-0.5" />
                <span className="text-xs">Home</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center h-auto p-1" onClick={() => handleNavigate('/casino')}>
                <Gift className="h-5 w-5 mb-0.5" />
                <span className="text-xs">Casino</span>
            </Button>

            {isAuthenticated && user ? (
                <>
                    <Button variant="ghost" className="flex flex-col items-center h-auto p-1" onClick={() => handleNavigate('/profile')}> {/* Changed from /wallet to /profile */}
                        <WalletIcon className="h-5 w-5 mb-0.5" />
                        <span className="text-xs">
                          {wallet ? `${new Intl.NumberFormat(user.user_metadata.language || 'en-US', { style: 'currency', currency: wallet.currency || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(wallet.balance || 0)}` : 'Wallet'}
                        </span>
                    </Button>
                    <Button variant="ghost" className="flex flex-col items-center h-auto p-1" onClick={() => handleNavigate('/profile')}>
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
                    <Button variant="ghost" className="flex flex-col items-center h-auto p-1" onClick={() => handleNavigate('/login')}>
                        <LogIn className="h-5 w-5 mb-0.5" />
                        <span className="text-xs">Log In</span>
                    </Button>
                    <Button variant="ghost" className="flex flex-col items-center h-auto p-1" onClick={() => handleNavigate('/register')}>
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


import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, UserCircle, LogOut, LogIn, UserPlus, Gift, Wallet as WalletIcon } from 'lucide-react';
import { Wallet } from '@/types/wallet'; // Corrected WalletType to Wallet

interface MobileNavBarProps {
  onClose: () => void; // Kept as is, but might be relevant if this is part of a modal-like menu
  wallet: Wallet | null; 
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({ onClose, wallet }) => {
  const { user, isAuthenticated, signOut } = useAuth(); // Changed logout to signOut
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (signOut) await signOut(); // Ensure signOut is called
    onClose(); // This suggests MobileNavBar might be part of a closable component
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose(); // This also suggests it's part of a closable component
  };

  // If this is a persistent bottom bar, `onClose` might not be needed for every action
  // or the component itself might not need an `onClose` prop.
  // For now, respecting the existing structure.

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
                    <Button variant="ghost" className="flex flex-col items-center h-auto p-1" onClick={() => handleNavigate('/profile')}>
                        <WalletIcon className="h-5 w-5 mb-0.5" />
                        <span className="text-xs">
                          {/* Ensure user_metadata is checked if language is there */}
                          {wallet ? `${new Intl.NumberFormat(user.app_metadata?.language || 'en-US', { style: 'currency', currency: wallet.currency || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(wallet.balance || 0)}` : 'Wallet'}
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


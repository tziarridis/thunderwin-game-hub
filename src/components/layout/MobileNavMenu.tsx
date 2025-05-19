
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '@/types'; // App's User type
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, UserCircle, LogOut, Settings, ShieldCheck, Star, Gift, Wallet, Percent } from 'lucide-react'; // Added icons

interface MobileNavMenuProps {
  user: User | null;
  isAuthenticated: boolean;
  onSignOut: () => void;
  onClose: () => void; // To close the menu
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ user, isAuthenticated, onSignOut, onClose }) => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose(); // Close menu after navigation
  };
  
  const userDisplayName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Player";
  const userAvatar = user?.user_metadata?.avatar_url;


  return (
    <div 
        className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-sm md:hidden animate-in slide-in-from-bottom-full duration-300"
        onClick={onClose} // Close on overlay click
    >
      <div 
        className="absolute left-0 top-0 h-full w-full max-w-xs bg-background shadow-xl flex flex-col p-4 pt-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside menu
      >
        {isAuthenticated && user && (
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarImage src={userAvatar} alt={userDisplayName} />
              <AvatarFallback>{userDisplayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="font-semibold text-lg">{userDisplayName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        )}
        
        <nav className="flex flex-col space-y-1">
          <Button variant="ghost" className="justify-start text-base py-3" onClick={() => handleNavigate('/')}><Home className="mr-3 h-5 w-5" /> Home</Button>
          <Button variant="ghost" className="justify-start text-base py-3" onClick={() => handleNavigate('/casino')}><Gift className="mr-3 h-5 w-5" /> Casino</Button>
          <Button variant="ghost" className="justify-start text-base py-3" onClick={() => handleNavigate('/promotions')}><Percent className="mr-3 h-5 w-5" /> Promotions</Button>

          {isAuthenticated && user && (
            <>
              <Separator className="my-2"/>
              <Button variant="ghost" className="justify-start text-base py-3" onClick={() => handleNavigate('/user/profile')}><UserCircle className="mr-3 h-5 w-5" /> Profile</Button>
              <Button variant="ghost" className="justify-start text-base py-3" onClick={() => handleNavigate('/wallet')}><Wallet className="mr-3 h-5 w-5" /> Wallet</Button>
              <Button variant="ghost" className="justify-start text-base py-3" onClick={() => handleNavigate('/user/favorites')}><Star className="mr-3 h-5 w-5" /> Favorites</Button>
              <Button variant="ghost" className="justify-start text-base py-3" onClick={() => handleNavigate('/user/settings')}><Settings className="mr-3 h-5 w-5" /> Settings</Button>
              {user.isAdmin && ( // Check if user is admin
                <Button variant="ghost" className="justify-start text-base py-3" onClick={() => handleNavigate('/admin/dashboard')}><ShieldCheck className="mr-3 h-5 w-5" /> Admin Panel</Button>
              )}
              <Separator className="my-2"/>
              <Button variant="ghost" className="justify-start text-base py-3 text-red-500 hover:text-red-600" onClick={onSignOut}>
                <LogOut className="mr-3 h-5 w-5" /> Sign Out
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Separator className="my-2"/>
              <Button variant="default" className="w-full text-base py-3" onClick={() => handleNavigate('/auth/login')}>Log In</Button>
              <Button variant="outline" className="w-full text-base py-3 mt-2" onClick={() => handleNavigate('/auth/signup')}>Sign Up</Button>
            </>
          )}
        </nav>
        <Button variant="outline" size="lg" className="mt-auto" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default MobileNavMenu;

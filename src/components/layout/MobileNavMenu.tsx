
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogIn, UserPlus, Home, Gift, Trophy, Star, LogOut, Settings, ShieldCheck, LifeBuoy, Briefcase } from 'lucide-react'; // Added icons

interface MobileNavMenuProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ isOpen, setIsOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  const mainLinks = [
    { path: '/', label: 'Home', icon: <Home className="h-5 w-5 mr-3" /> },
    { path: '/casino', label: 'Casino Games', icon: <Briefcase className="h-5 w-5 mr-3" /> }, // Using Briefcase for casino
    { path: '/live-casino', label: 'Live Casino', icon: <User className="h-5 w-5 mr-3" /> }, // Using User for live casino (placeholder)
    { path: '/promotions', label: 'Promotions', icon: <Gift className="h-5 w-5 mr-3" /> },
    // { path: '/tournaments', label: 'Tournaments', icon: <Trophy className="h-5 w-5 mr-3" /> },
    // { path: '/vip', label: 'VIP Program', icon: <Star className="h-5 w-5 mr-3" /> },
  ];

  const userLinks = [
    { path: '/user/dashboard', label: 'Dashboard', icon: <User className="h-5 w-5 mr-3" /> },
    { path: '/user/profile', label: 'Profile Settings', icon: <Settings className="h-5 w-5 mr-3" /> },
    { path: '/user/wallet', label: 'Wallet & Transactions', icon: <Briefcase className="h-5 w-5 mr-3" /> }, // Placeholder icon
    { path: '/user/kyc', label: 'KYC Verification', icon: <ShieldCheck className="h-5 w-5 mr-3" /> },
    { path: '/user/responsible-gambling', label: 'Responsible Gambling', icon: <LifeBuoy className="h-5 w-5 mr-3" /> },
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="md:hidden fixed inset-0 top-16 bg-casino-thunder-dark/95 backdrop-blur-md z-40 p-6 overflow-y-auto"
      // Adjust top based on header height, current is top-16 (64px)
    >
      <div className="flex flex-col h-full">
        {isAuthenticated && user && (
          <div className="mb-6 p-4 bg-card rounded-lg text-center">
            <p className="text-lg font-semibold">{user.user_metadata?.full_name || user.user_metadata?.username || 'Player'}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        )}

        <Accordion type="multiple" defaultValue={['main-links', 'user-links']} className="w-full space-y-4">
          <AccordionItem value="main-links" className="border-b-0">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline py-3 px-2 rounded-md hover:bg-white/5">Main Menu</AccordionTrigger>
            <AccordionContent className="pt-2 space-y-1">
              {mainLinks.map(link => (
                <Button
                  key={link.path}
                  variant="ghost"
                  className="w-full justify-start text-base py-3 px-2 h-auto"
                  onClick={() => handleNavigation(link.path)}
                >
                  {link.icon}{link.label}
                </Button>
              ))}
            </AccordionContent>
          </AccordionItem>

          {isAuthenticated && (
            <AccordionItem value="user-links" className="border-b-0">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline py-3 px-2 rounded-md hover:bg-white/5">My Account</AccordionTrigger>
              <AccordionContent className="pt-2 space-y-1">
                {userLinks.map(link => (
                  <Button
                    key={link.path}
                    variant="ghost"
                    className="w-full justify-start text-base py-3 px-2 h-auto"
                    onClick={() => handleNavigation(link.path)}
                  >
                    {link.icon}{link.label}
                  </Button>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
        
        <div className="mt-auto space-y-3 pt-6 border-t border-border">
          {isAuthenticated ? (
            <Button variant="destructive" className="w-full text-base py-3 h-auto" onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-3" /> Logout
            </Button>
          ) : (
            <>
              <Button variant="outline" className="w-full text-base py-3 h-auto border-primary text-primary" onClick={() => handleNavigation('/login')}>
                <LogIn className="h-5 w-5 mr-3" /> Login
              </Button>
              <Button className="w-full text-base py-3 h-auto bg-primary text-primary-foreground" onClick={() => handleNavigation('/register')}>
                <UserPlus className="h-5 w-5 mr-3" /> Register
              </Button>
            </>
          )}
          <Button variant="ghost" className="w-full text-base text-muted-foreground mt-4" onClick={() => setIsOpen(false)}>
            Close Menu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileNavMenu;


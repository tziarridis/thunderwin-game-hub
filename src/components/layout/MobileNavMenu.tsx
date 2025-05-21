
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Link component is not used directly for navigation actions here
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogIn, UserPlus, Home, Gift, Settings, ShieldCheck, LifeBuoy, Briefcase, LogOut as LogOutIcon } from 'lucide-react'; // Renamed LogOut to avoid conflict

interface MobileNavMenuProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ isOpen, setIsOpen }) => {
  const { user, isAuthenticated, signOut } = useAuth(); // Changed logout to signOut
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    if (signOut) await signOut(); // Ensure signOut is called
    setIsOpen(false);
    navigate('/');
  };

  const mainLinks = [
    { path: '/', label: 'Home', icon: <Home className="h-5 w-5 mr-3" /> },
    { path: '/casino', label: 'Casino Games', icon: <Briefcase className="h-5 w-5 mr-3" /> },
    { path: '/casino/live-casino', label: 'Live Casino', icon: <User className="h-5 w-5 mr-3" /> }, // Corrected path
    { path: '/promotions', label: 'Promotions', icon: <Gift className="h-5 w-5 mr-3" /> },
  ];

  const userLinks = [
    // { path: '/user/dashboard', label: 'Dashboard', icon: <User className="h-5 w-5 mr-3" /> }, // Assuming profile is main user page
    { path: '/profile', label: 'My Profile', icon: <User className="h-5 w-5 mr-3" /> },
    { path: '/settings', label: 'Account Settings', icon: <Settings className="h-5 w-5 mr-3" /> }, // General settings
    { path: '/transactions', label: 'Wallet & Transactions', icon: <Briefcase className="h-5 w-5 mr-3" /> }, 
    { path: '/kyc', label: 'KYC Verification', icon: <ShieldCheck className="h-5 w-5 mr-3" /> },
    // { path: '/user/responsible-gambling', label: 'Responsible Gambling', icon: <LifeBuoy className="h-5 w-5 mr-3" /> }, // Example path
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-md z-40 p-6 overflow-y-auto"
    >
      <div className="flex flex-col h-full">
        {isAuthenticated && user && (
          <div className="mb-6 p-4 bg-card rounded-lg text-center">
            {/* Use AppUser fields */}
            <p className="text-lg font-semibold">{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email || 'Player'}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        )}

        <Accordion type="multiple" defaultValue={['main-links', 'user-links']} className="w-full space-y-4">
          <AccordionItem value="main-links" className="border-b-0">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline py-3 px-2 rounded-md hover:bg-card/80">Main Menu</AccordionTrigger>
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
              <AccordionTrigger className="text-lg font-semibold hover:no-underline py-3 px-2 rounded-md hover:bg-card/80">My Account</AccordionTrigger>
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
              <LogOutIcon className="h-5 w-5 mr-3" /> Logout
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



import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Gamepad2, Gift, ShieldCheck } from 'lucide-react'; // Added ShieldCheck
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const MobileMenu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { href: '/', label: 'Home', icon: <Home className="h-5 w-5" /> },
    { href: '/casino/main', label: 'Casino', icon: <Gamepad2 className="h-5 w-5" /> },
    { href: '/promotions', label: 'Promotions', icon: <Gift className="h-5 w-5" /> },
    { href: '/vip', label: 'VIP', icon: <ShieldCheck className="h-5 w-5" /> }, // Example VIP icon
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link to="/" className="flex items-center space-x-2">
              {/* You can use an img tag for your logo if you have one */}
              <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
              {/* <span className="font-bold text-lg">YourSite</span> */}
            </Link>
          </div>
          <nav className="flex-grow p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start text-base"
                onClick={() => navigate(item.href)}
                asChild
              >
                <Link to={item.href}>
                  {item.icon && <span className="mr-3">{item.icon}</span>}
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="p-4 border-t">
            {user ? (
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                  My Account
                </Button>
                 {/* You might want a logout button here too, or integrate UserMenu if small enough */}
              </div>
            ) : (
              <div className="space-y-2">
                <Button className="w-full" onClick={() => navigate('/login')}>Login</Button>
                <Button variant="secondary" className="w-full" onClick={() => navigate('/register')}>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;

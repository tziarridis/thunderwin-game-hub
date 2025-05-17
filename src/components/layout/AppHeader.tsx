import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme as useNextTheme } from 'next-themes';
import UserMenu from '@/components/user/UserMenu'; // Corrected import
import { useAuth } from '@/contexts/AuthContext';
import MobileMenu from './MobileMenu'; // Corrected import

const AppHeader = () => {
  const { theme, setTheme } = useNextTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="container flex h-16 items-center px-4">
        <div className="hidden md:block">
          {/* Desktop logo/branding */}
          <img 
            src="/logo.svg" 
            alt="Logo" 
            className="h-8 w-auto" 
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
        </div>
        
        {/* Mobile menu (left side) */}
        <div className="md:hidden">
          <MobileMenu />
        </div>

        {/* Right side - actions */}
        <div className="ml-auto flex items-center space-x-2 md:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={`Toggle ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="hidden sm:flex"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

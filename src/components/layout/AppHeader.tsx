import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, // Import DropdownMenuItem
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Moon, Sun, LogOut, User, Settings, CreditCard, HelpCircle, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { NavigationMenu } from './NavigationMenu'; // Assuming this is the shadcn one
import { useTheme } from '@/components/ThemeProvider'; // Corrected import for useTheme
import WalletBalance from '@/components/user/WalletBalance';
import DepositButton from '@/components/user/DepositButton'; // Assuming this component exists
import { cn } from '@/lib/utils';

const AppHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  return (
    <header className="bg-casino-thunder-dark border-b border-casino-thunder-gray/20 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-64 bg-casino-thunder-darker text-white">
            <div className="py-4">
              <Link to="/" className="block px-4 py-2 text-lg font-semibold">
                YourCasinoName
              </Link>
              <NavigationMenu />
            </div>
          </SheetContent>
        </Sheet>
        <Link to="/" className="text-lg font-semibold">
          YourCasinoName
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <WalletBalance />
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.username} />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/wallet')}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Wallet</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user && user.role === 'admin' && (
                <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate('/support')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/responsible-gaming')}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Responsible Gaming</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button variant="ghost" onClick={() => navigate('/login')}>Log In</Button>
            <Button onClick={() => navigate('/register')}>Sign Up</Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme((prev: string) => (prev === "dark" ? "light" : "dark"))}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        {isAuthenticated && (
          <DepositButton />
        )}
      </div>
    </header>
  );
};

export default AppHeader;

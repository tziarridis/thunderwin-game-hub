import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Menu, Search, UserCircle, Settings, LogOut, Sun, Moon, LayoutDashboard, ListOrdered, Gift, Ticket, ShieldHalf, Star, Home
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider'; // Corrected import
import WalletBalance from '@/components/user/WalletBalance';
import DepositButton from '@/components/user/DepositButton';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileWalletSummary from '@/components/user/MobileWalletSummary';

const AppHeader = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const mainNavLinks = [
    { href: '/casino/main', label: 'Casino', icon: Star },
    { href: '/casino/live-casino', label: 'Live Casino', icon: ListOrdered },
    { href: '/casino/slots', label: 'Slots', icon: Gift },
    // { href: '/sports', label: 'Sports', icon: ShieldHalf },
    { href: '/promotions', label: 'Promotions', icon: Ticket },
  ];

  const UserNav = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar || undefined} alt={user?.displayName || user?.username || ""} />
            <AvatarFallback>{user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName || user?.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          {user && user.role === 'admin' && (
             <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );


  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        {/* Left Side: Logo and Mobile Nav Trigger */}
        <div className="flex items-center">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 lg:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm">
                <nav className="grid gap-4 p-4">
                  <Link
                    to="/"
                    className="flex items-center space-x-2 mb-4 pb-4 border-b"
                    onClick={() => document.dispatchEvent(new Event('closeSheet'))} // Assuming sheet closes on click
                  >
                    <Home className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg">Home</span>
                  </Link>
                  {mainNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex items-center space-x-3 rounded-md p-2 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                      onClick={() => document.dispatchEvent(new Event('closeSheet'))}
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
          <Link to="/" className="flex items-center space-x-2">
            {/* Replace with your actual logo component or img tag */}
            {/* <img src="/logo.svg" alt="Logo" className="h-8 w-auto" /> */}
            <span className="font-bold text-xl hidden sm:inline-block">CasinoVerse</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        {!isMobile && (
          <nav className="flex items-center space-x-2 lg:space-x-4">
            {mainNavLinks.map((link) => (
              <Button variant="ghost" asChild key={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                <Link to={link.href}>
                  <link.icon className="mr-1.5 h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
        )}

        {/* Right Side: Search, Wallet, UserNav, Theme Toggle */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {!isMobile && (
            <form className="relative ml-auto flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search games..."
                className="pl-8 sm:w-[200px] md:w-[250px] lg:w-[300px] rounded-full h-9"
              />
            </form>
          )}

          {isAuthenticated && user && !isMobile && (
            <>
              <WalletBalance showRefresh={true} />
              <DepositButton variant="default" size="sm" />
            </>
          )}

          {isAuthenticated && user ? (
            <UserNav />
          ) : (
            <div className="space-x-1">
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Login</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Sign Up</Button>
            </div>
          )}
          
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
      {isAuthenticated && user && isMobile && <MobileWalletSummary showRefresh={true} />}
    </header>
    </>
  );
};

export default AppHeader;

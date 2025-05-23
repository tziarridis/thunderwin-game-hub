
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Moon, Sun, Menu, LogOut, User, Settings, HelpCircle, Home, Plus, LayoutDashboard, Gift, LogIn } from 'lucide-react'; // Added Gift, LogIn
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AppHeader = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // navigate('/'); // or to login page
    } catch (error) {
      console.error("Logout failed:", error);
      // toast.error("Logout failed. Please try again.");
    }
  };
  
  return (
    <header className="bg-casino-thunder-darker border-b border-casino-thunder-dark flex items-center justify-between h-16 px-4 fixed top-0 left-0 w-full z-40">
      {/* Mobile Menu Button */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="px-4 pt-4 pb-2">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>Navigate through the app.</SheetDescription>
            </SheetHeader>
            <div className="py-2">
              <NavLink to="/" className="block px-4 py-2 hover:bg-casino-thunder-dark">
                <Home className="mr-2 inline-block h-4 w-4" /> Home
              </NavLink>
              <NavLink to="/casino" className="block px-4 py-2 hover:bg-casino-thunder-dark">
                <LayoutDashboard className="mr-2 inline-block h-4 w-4" /> Casino
              </NavLink>
              <NavLink to="/sports" className="block px-4 py-2 hover:bg-casino-thunder-dark">
                <LayoutDashboard className="mr-2 inline-block h-4 w-4" /> Sports
              </NavLink>
              <NavLink to="/promotions" className="block px-4 py-2 hover:bg-casino-thunder-dark">
                <Gift className="mr-2 inline-block h-4 w-4" /> Promotions
              </NavLink>
              <NavLink to="/bonuses" className="block px-4 py-2 hover:bg-casino-thunder-dark">
                <Gift className="mr-2 inline-block h-4 w-4" /> Bonuses
              </NavLink>
              <NavLink to="/vip" className="block px-4 py-2 hover:bg-casino-thunder-dark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 inline-block h-4 w-4">
                  <path fillRule="evenodd" d="M12 1.757l8.25 4.714v8.458l-8.25 4.714-8.25-4.714V6.47l8.25-4.714zm.75 6.47l3.97 2.273-3.97 2.273-3.97-2.273 3.97-2.273z" clipRule="evenodd" />
                </svg>
                VIP
              </NavLink>
              <NavLink to="/support/help" className="block px-4 py-2 hover:bg-casino-thunder-dark">
                <HelpCircle className="mr-2 inline-block h-4 w-4" /> Support
              </NavLink>
              {isAuthenticated ? (
                <>
                  <NavLink to="/profile" className="block px-4 py-2 hover:bg-casino-thunder-dark">
                    <User className="mr-2 inline-block h-4 w-4" /> Profile
                  </NavLink>
                  {isAdmin && (
                    <NavLink to="/admin" className="block px-4 py-2 hover:bg-casino-thunder-dark">
                      <LayoutDashboard className="mr-2 inline-block h-4 w-4" /> Admin Panel
                    </NavLink>
                  )}
                  <Button variant="ghost" onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-casino-thunder-dark">
                    <LogOut className="mr-2 inline-block h-4 w-4" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="block px-4 py-2 hover:bg-casino-thunder-dark">
                    <LogIn className="mr-2 inline-block h-4 w-4" /> Login
                  </NavLink>
                  <NavLink to="/register" className="block px-4 py-2 hover:bg-casino-thunder-dark">
                    <Plus className="mr-2 inline-block h-4 w-4" /> Register
                  </NavLink>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Logo */}
      <Link to="/" className="text-lg font-bold">
        ThunderWin
      </Link>

      {/* Theme Toggle & User Menu */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || "https://github.com/shadcn.png"} alt={user?.username || "Avatar"} />
                <AvatarFallback>{user?.username?.slice(0, 2).toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.username || user?.email || 'Guest'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAuthenticated ? (
              <>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => navigate('/login')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Login</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/register')}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Register</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;

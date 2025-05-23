import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Moon, Sun, Menu, LogOut, User, Settings, HelpCircle, Home, Plus, LayoutDashboard, Gift, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AppHeader = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully.");
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };
  
  return (
    <header className="bg-casino-thunder-darker border-b border-casino-thunder-dark flex items-center justify-between h-16 px-4 fixed top-0 left-0 w-full z-40">
      {/* Mobile Menu Button */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-card text-card-foreground">
            <SheetHeader className="px-4 pt-4 pb-2 border-b">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="py-2">
              <NavLink to="/" className="flex items-center px-4 py-2 hover:bg-muted" onClick={() => setSidebarOpen(false)}>
                <Home className="mr-2 h-4 w-4" /> Home
              </NavLink>
              <NavLink to="/casino" className="flex items-center px-4 py-2 hover:bg-muted" onClick={() => setSidebarOpen(false)}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Casino
              </NavLink>
              <NavLink to="/sports" className="flex items-center px-4 py-2 hover:bg-muted" onClick={() => setSidebarOpen(false)}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Sports
              </NavLink>
              <NavLink to="/promotions" className="flex items-center px-4 py-2 hover:bg-muted" onClick={() => setSidebarOpen(false)}>
                <Gift className="mr-2 h-4 w-4" /> Promotions
              </NavLink>
              <NavLink to="/bonuses" className="flex items-center px-4 py-2 hover:bg-muted" onClick={() => setSidebarOpen(false)}>
                <Gift className="mr-2 h-4 w-4" /> Bonuses
              </NavLink>
              <NavLink to="/vip" className="flex items-center px-4 py-2 hover:bg-muted" onClick={() => setSidebarOpen(false)}>
                <User className="mr-2 h-4 w-4" /> VIP
              </NavLink>
              <NavLink to="/support/help" className="flex items-center px-4 py-2 hover:bg-muted" onClick={() => setSidebarOpen(false)}>
                <HelpCircle className="mr-2 h-4 w-4" /> Support
              </NavLink>
              <DropdownMenuSeparator className="my-2"/>
              {isAuthenticated ? (
                <>
                  <NavLink to="/profile" className="flex items-center px-4 py-2 hover:bg-muted" onClick={() => setSidebarOpen(false)}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </NavLink>
                  {isAdmin && (
                    <NavLink to="/admin" className="flex items-center px-4 py-2 hover:bg-muted" onClick={() => setSidebarOpen(false)}>
                      <Settings className="mr-2 h-4 w-4" /> Admin Panel
                    </NavLink>
                  )}
                  <Button variant="ghost" onClick={() => { handleLogout(); setSidebarOpen(false); }} className="w-full justify-start flex items-center px-4 py-2 hover:bg-muted text-destructive hover:text-destructive-foreground">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="flex items-center px-4 py-2 hover:bg-muted" onClick={() => setSidebarOpen(false)}>
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </NavLink>
                  <NavLink to="/register" className="flex items-center px-4 py-2 hover:bg-muted" onClick={() => setSidebarOpen(false)}>
                    <Plus className="mr-2 h-4 w-4" /> Register
                  </NavLink>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      )}

      {/* Logo */}
      <Link to="/" className="text-lg font-bold">
        ThunderWin
      </Link>

      {/* Theme Toggle & User Menu */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Menu */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || "https://github.com/shadcn.png"} alt={user?.username || "Avatar"} />
                  <AvatarFallback>{user?.username?.slice(0, 2).toUpperCase() || user?.email?.slice(0,2).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.username || user?.email || 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive-foreground">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="outline" onClick={() => navigate('/login')}>Login</Button>
            <Button onClick={() => navigate('/register')}>Register</Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;

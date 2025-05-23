
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

const MobileNavBar = () => {
  const { user, isAuthenticated, signOut } = useAuth(); // Use signOut
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(); // Use signOut
      toast.success("Logged out successfully.");
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-casino-thunder-darker border-t border-casino-thunder-dark p-4 flex items-center justify-between md:hidden z-50">
      <div className="flex items-center space-x-4">
        {isAuthenticated && user ? (
          <>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url || "https://github.com/shadcn.png"} alt={user.username || "User"} />
              <AvatarFallback>{user.username?.slice(0, 2).toUpperCase() || user.email?.slice(0,2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{user.username || user.email}</p>
              <p className="text-xs text-muted-foreground">Welcome back!</p>
            </div>
          </>
        ) : (
          <div className="text-sm">
            <p className="font-medium">Guest User</p>
            <p className="text-xs text-muted-foreground">Please login</p>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {isAuthenticated ? (
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button onClick={() => navigate('/login')}>Login</Button>
        )}
      </div>
    </div>
  );
};

export default MobileNavBar;

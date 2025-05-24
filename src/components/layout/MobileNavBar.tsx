
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const MobileNavBar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-2 md:hidden">
      <div className="flex justify-around items-center">
        <Link to="/" className="p-2">
          <span className="text-sm">Home</span>
        </Link>
        <Link to="/casino" className="p-2">
          <span className="text-sm">Casino</span>
        </Link>
        <Link to="/sports" className="p-2">
          <span className="text-sm">Sports</span>
        </Link>
        {isAuthenticated ? (
          <Link to="/profile" className="p-2">
            <Avatar className="h-6 w-6">
              <AvatarImage 
                src={user?.avatar_url || user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} 
                alt={user?.username || "User"} 
              />
              <AvatarFallback>
                {user?.username?.slice(0, 2).toUpperCase() || user?.email?.slice(0,2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Link to="/login">
            <Button size="sm">Login</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default MobileNavBar;

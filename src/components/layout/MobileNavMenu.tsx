
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings } from 'lucide-react';

const MobileNavMenu: React.FC = () => {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="p-4 space-y-2">
      <Link to="/" className="block p-2 hover:bg-muted rounded">
        Home
      </Link>
      <Link to="/casino" className="block p-2 hover:bg-muted rounded">
        Casino
      </Link>
      <Link to="/sports" className="block p-2 hover:bg-muted rounded">
        Sports
      </Link>
      <Link to="/promotions" className="block p-2 hover:bg-muted rounded">
        Promotions
      </Link>
      
      {isAuthenticated ? (
        <>
          <Link to="/profile" className="block p-2 hover:bg-muted rounded">
            <User className="inline mr-2 h-4 w-4" />
            Profile
          </Link>
          {isAdmin && (
            <Link to="/admin" className="block p-2 hover:bg-muted rounded">
              <Settings className="inline mr-2 h-4 w-4" />
              Admin Panel
            </Link>
          )}
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="w-full justify-start text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </>
      ) : (
        <>
          <Link to="/login" className="block p-2 hover:bg-muted rounded">
            Login
          </Link>
          <Link to="/register" className="block p-2 hover:bg-muted rounded">
            Register
          </Link>
        </>
      )}
    </div>
  );
};

export default MobileNavMenu;


import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { LogOut, UserCircle, Settings, ShieldCheck, BarChart3, Gem, LayoutDashboard } from 'lucide-react'; // Added LayoutDashboard
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface UserMenuProps {
  user: User;
  onSignOut: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth(); // Get isAdmin status

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const names = name.split(' ');
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const displayName = user.user_metadata?.name || user.username || user.email;
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl} alt={displayName || 'User Avatar'} />
            <AvatarFallback>{getInitials(displayName, user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/wallet')}> {/* Assuming /wallet route exists */}
          <Gem className="mr-2 h-4 w-4" /> {/* Changed to Gem or appropriate icon */}
          <span>Wallet</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/transactions')}>
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>Transactions</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/kyc')}>
          <ShieldCheck className="mr-2 h-4 w-4" />
          <span>KYC Verification</span>
        </DropdownMenuItem>
        {isAdmin && (
            <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
            </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;

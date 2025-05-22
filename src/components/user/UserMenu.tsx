
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, LogOut, Settings, ShieldCheck, DollarSign, UserCog } from 'lucide-react'; // Added UserCog for admin
import { User } from '@/types'; // User type from your types

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const isAdmin = user.role === 'admin'; // Example check for admin role

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };
  
  const userDisplayName = user.user_metadata?.full_name || user.user_metadata?.username || user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.user_metadata?.avatar_url || undefined} alt={userDisplayName || 'User Avatar'} />
            <AvatarFallback>{getInitials(userDisplayName, user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card border-border text-white" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{userDisplayName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/user/dashboard')} className="cursor-pointer">
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/user/profile')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/user/wallet')} className="cursor-pointer">
          <DollarSign className="mr-2 h-4 w-4" />
          <span>My Wallet</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/user/kyc')} className="cursor-pointer">
          <ShieldCheck className="mr-2 h-4 w-4" />
          <span>KYC Verification</span>
        </DropdownMenuItem>
        {isAdmin && (
           <DropdownMenuItem onClick={() => navigate('/admin/dashboard')} className="cursor-pointer text-primary hover:!text-primary">
            <UserCog className="mr-2 h-4 w-4" />
            <span>Admin Panel</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-500 hover:!text-red-400 focus:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;


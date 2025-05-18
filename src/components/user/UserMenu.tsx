
import React from 'react';
import { User } from '@/types'; // Changed from AuthUser to User
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react'; // Added ChevronDown for better UX
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMenuProps {
  user: User; // Changed from AuthUser to User
  onSignOut?: () => void; // Optional onSignOut prop for custom handling if needed
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onSignOut }) => {
  const { signOut: contextSignOut } = useAuth(); // Use signOut from context
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await contextSignOut(); // Use signOut from context
      navigate('/');
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const names = name.split(' ');
      if (names.length > 1 && names[0] && names[names.length - 1]) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      if (names[0] && names[0].length > 1) return name.substring(0, 2).toUpperCase();
      if (names[0]) return names[0][0].toUpperCase();
    }
    if (email && email[0]) return email[0].toUpperCase();
    return 'U';
  };
  
  const userDisplayName = user.displayName || user.username || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 px-2 py-1 h-9 rounded-md hover:bg-white/10">
          <Avatar className="h-7 w-7">
            {/* Prefer avatar_url, then avatar, then fallback */}
            <AvatarImage src={user.avatar_url || user.avatar || ''} alt={userDisplayName} />
            <AvatarFallback>{getInitials(userDisplayName, user.email)}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium text-white">{userDisplayName.length > 10 ? `${userDisplayName.substring(0,8)}...` : userDisplayName}</span>
          <ChevronDown className="h-4 w-4 text-white/70 hidden sm:inline" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-casino-thunder-dark border-casino-thunder-gray-light text-white" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 p-1">
            <p className="text-sm font-medium leading-none">{userDisplayName}</p>
            {user.email && (
              <p className="text-xs leading-none text-gray-400">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-casino-thunder-gray-light/50" />
        <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-casino-thunder-gold/20 focus:bg-casino-thunder-gold/20 cursor-pointer">
          <UserIcon className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-casino-thunder-gold/20 focus:bg-casino-thunder-gold/20 cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-casino-thunder-gray-light/50" />
        <DropdownMenuItem onClick={handleSignOut} className="text-casino-thunder-gold hover:!text-casino-thunder-gold hover:bg-casino-thunder-gold/20 focus:bg-casino-thunder-gold/20 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;

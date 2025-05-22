import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Ensure useAuth is imported

const AdminHeader = () => {
  const { user, logout } = useAuth(); // Changed signOut to logout

  const handleLogout = async () => {
    await logout(); // Use logout from AuthContext
    // Navigate to login or home page after logout
  };

  return (
    <div className="bg-casino-thunder-darker border-b border-casino-thunder-dark p-4 flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src={user?.avatar_url || "https://github.com/shadcn.png"} alt={user?.username || "Admin"} />
            <AvatarFallback>{user?.username?.slice(0, 2).toUpperCase() || "AD"}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AdminHeader;

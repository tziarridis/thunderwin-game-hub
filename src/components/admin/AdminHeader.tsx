
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
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AdminHeader = () => {
  const { user, signOut } = useAuth(); // Use signOut from AuthContext
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login'); // Navigate to admin login page after logout
  };

  const handleSettings = () => {
    navigate('/admin/settings'); // Navigate to admin settings page
  };

  // Attempt to get a fallback from email if username is not present
  const getAvatarFallback = () => {
    if (user?.username) return user.username.slice(0, 2).toUpperCase();
    if (user?.email) return user.email.slice(0,2).toUpperCase();
    return "AD";
  }

  return (
    <div className="bg-casino-thunder-darker border-b border-casino-thunder-dark p-4 flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src={user?.avatar_url || "https://github.com/shadcn.png"} alt={user?.username || "Admin"} />
            <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.username || user?.email || 'My Account'}</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleSettings}>
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

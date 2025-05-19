
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, UserCircle, Settings, LogOut, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import SiteLogo from '../SiteLogo'; // Assuming SiteLogo is general enough

const AdminHeader = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    if (signOut) {
      await signOut();
      // Navigate to login or home page after sign out if needed
      // navigate('/admin/login'); 
    }
  };
  
  // Access username from user_metadata
  const displayName = user?.user_metadata?.username || user?.email || 'Admin';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-700 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <SiteLogo className="h-8 w-auto text-primary" /> 
          <span className="font-semibold text-lg hidden sm:inline">Admin Panel</span>
        </Link>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hover:bg-slate-700">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-slate-700 px-2 py-1">
                <UserCircle className="h-6 w-6" />
                <span className="hidden md:inline">{displayName}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-white">
              <DropdownMenuLabel>My Account ({user?.role || 'User'})</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem asChild className="hover:!bg-slate-700 focus:!bg-slate-700 cursor-pointer">
                <Link to="/admin/settings/profile"><Settings className="mr-2 h-4 w-4" /> Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:!bg-slate-700 focus:!bg-slate-700 cursor-pointer">
                <Link to="/"><Settings className="mr-2 h-4 w-4" /> View Site</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem onClick={handleSignOut} className="hover:!bg-slate-700 focus:!bg-slate-700 cursor-pointer text-red-400 hover:!text-red-300">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User as LucideUser, LogOut, Settings, LayoutDashboard, ShieldCheck } from "lucide-react"; // Added ShieldCheck for admin
import { User } from "@supabase/supabase-js"; // Use Supabase User type
import { AppUser } from "@/types/user";

// Helper function to get initials
const getInitials = (name?: string | null) => {
  if (!name) return "NN"; // No Name
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

interface UserMenuProps {
  user?: User | AppUser | null;
  onLogout?: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const authContext = useAuth(); // Get auth context for fallback
  const navigate = useNavigate();
  
  // Use props if provided, otherwise fall back to auth context
  const currentUser = user || authContext.user;
  const signOutHandler = onLogout || authContext.signOut;

  if (!currentUser) {
    return (
      <Button onClick={() => navigate("/login")}>
        <LucideUser className="mr-2 h-4 w-4" /> Login
      </Button>
    );
  }

  // Handle both User and AppUser types
  const userName = 
    'user_metadata' in currentUser 
      ? currentUser.user_metadata?.full_name || currentUser.email 
      : (currentUser as AppUser).firstName || (currentUser as AppUser).email;
  
  const userAvatar = 
    'user_metadata' in currentUser 
      ? currentUser.user_metadata?.avatar_url 
      : (currentUser as AppUser).avatarUrl;
  
  // Check if user has admin role from app_metadata
  const isAdmin = 
    'app_metadata' in currentUser 
      ? currentUser.app_metadata?.roles?.includes('admin')
      : (currentUser as AppUser).roles?.includes('admin');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={userAvatar} alt={userName || "User"} />
            <AvatarFallback>{getInitials(userName as string)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {'email' in currentUser ? currentUser.email : ''}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/profile/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Admin Panel
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOutHandler}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

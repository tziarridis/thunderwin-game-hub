
import React from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NotificationsDropdownProps {
  hasUnread?: boolean; // Added prop
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ hasUnread }) => {
  // Example: Use hasUnread to display a static number or fetch dynamic count
  // For this example, we'll use a fixed number if hasUnread is true.
  // In a real app, you'd fetch notificationCount or pass it as a prop.
  const notificationCount = hasUnread ? 1 : 0; // Simplified based on hasUnread
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="View notifications">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge 
              variant="destructive" // More prominent for unread
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs rounded-full"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-card border-border">
        <div className="p-3 border-b border-border">
          <h3 className="font-medium text-sm">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-auto">
          {/* Placeholder for actual notifications */}
          {notificationCount > 0 ? (
            <DropdownMenuItem className="p-3 hover:bg-muted/50 cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="bg-primary h-2 w-2 rounded-full mt-1.5 shrink-0"></div>
                <div>
                  <p className="text-xs font-medium">New Bonus Available!</p>
                  <p className="text-xs text-muted-foreground">Check out the latest deposit bonus.</p>
                </div>
              </div>
            </DropdownMenuItem>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          )}
        </div>
        {notificationCount > 0 && (
           <div className="p-2 border-t border-border text-center">
            <Button variant="link" size="sm" className="text-xs">View all notifications</Button>
           </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;

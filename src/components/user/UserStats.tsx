
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarDays, Clock } from 'lucide-react'; // Example icons
import { formatDistanceToNow, parseISO } from 'date-fns';
import { User } from "@supabase/supabase-js"; // Use Supabase User type

interface UserStatsProps {
  user: User | null; // User object from Supabase auth
  // Add other stats as needed, e.g., total_bets, total_winnings
}

const UserStats: React.FC<UserStatsProps> = ({ user }) => {
  if (!user) {
    return <p>Loading user data...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-3 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Username</p>
            <p className="font-medium">{user.user_metadata?.username || user.email}</p>
          </div>
        </div>
        <div className="flex items-center">
          <CalendarDays className="h-5 w-5 mr-3 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Joined</p>
            <p className="font-medium">
              {user.created_at ? formatDistanceToNow(parseISO(user.created_at), { addSuffix: true }) : 'N/A'}
            </p>
          </div>
        </div>
        {user.last_sign_in_at && (
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-3 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Last Login</p>
              <p className="font-medium">
                {formatDistanceToNow(parseISO(user.last_sign_in_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}
        {/* Add more stats here */}
      </CardContent>
    </Card>
  );
};

export default UserStats;

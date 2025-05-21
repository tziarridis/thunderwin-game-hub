import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Edit3, Shield, UserCog, Bell, LogOut, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import placeholder components
import UserActivity from './UserActivity';
import UserPreferences from './UserPreferences';
import ChangePasswordForm from './ChangePasswordForm'; // Assuming this exists and is correctly implemented
import TwoFactorAuthSettings from './TwoFactorAuthSettings';
import UserSettings from './UserSettings'; // This might be a page, or a component for general settings
import UserGamblingLimits from './UserGamblingLimits'; // Assuming this exists
import ResponsibleGambling from './ResponsibleGambling'; // Assuming this exists

const Profile = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading user profile...</p>
      </div>
    );
  }

  const getInitials = (email = '') => {
    const parts = email.split('@')[0];
    return parts?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.email} />
              <AvatarFallback className="text-2xl">{getInitials(user.email)}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl">{user.user_metadata?.username || user.email}</CardTitle>
              <CardDescription>Manage your profile, settings, and activity.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="sm:ml-auto mt-4 sm:mt-0" asChild>
              <Link to="/settings"><Edit3 className="mr-2 h-4 w-4" /> Edit Profile</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
          <UserInfoSection user={user} />
          <QuickLinks />
        </CardContent>
      </Card>

      {/* Placeholder Sections */}
      <UserActivity />
      <UserPreferences />
      <TwoFactorAuthSettings />
      
      {/* Assuming ChangePasswordForm, UserSettings, UserGamblingLimits, ResponsibleGambling are implemented elsewhere */}
      {/* If they are part of Profile.tsx structure, integrate them like UserActivity etc. */}
      {/* For example: */}
      {/* <ChangePasswordForm /> */}
      {/* <UserSettings /> */}
      {/* <UserGamblingLimits /> */}
      {/* <ResponsibleGambling /> */}

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={signOut} className="w-full sm:w-auto">
            <LogOut className="mr-2 h-4 w-4" /> Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const UserInfoSection: React.FC<{ user: any }> = ({ user }) => (
  <Card>
    <CardHeader>
      <CardTitle>Personal Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Email</p>
        <p>{user.email}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Username</p>
        <p>{user.user_metadata?.username || 'Not set'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Joined</p>
        <p>{new Date(user.created_at).toLocaleDateString()}</p>
      </div>
       <div>
        <p className="text-sm font-medium text-muted-foreground">Last Sign In</p>
        <p>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
      </div>
    </CardContent>
  </Card>
);

const QuickLinks = () => (
  <Card>
    <CardHeader>
      <CardTitle>Quick Links</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <Button variant="ghost" className="w-full justify-start" asChild><Link to="/settings/security"><Shield className="mr-2 h-4 w-4" /> Security Settings</Link></Button>
      <Button variant="ghost" className="w-full justify-start" asChild><Link to="/settings/preferences"><UserCog className="mr-2 h-4 w-4" /> Preferences</Link></Button>
      <Button variant="ghost" className="w-full justify-start" asChild><Link to="/settings/notifications"><Bell className="mr-2 h-4 w-4" /> Notification Settings</Link></Button>
      <Button variant="ghost" className="w-full justify-start" asChild><Link to="/settings/theme"><Palette className="mr-2 h-4 w-4" /> Theme Settings</Link></Button>
    </CardContent>
  </Card>
);

export default Profile;

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Wallet } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, LogOut, Wallet as WalletIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TransactionsList from './TransactionsList';
import WalletBalance from './WalletBalance';
import UserStats from './UserStats';
import VipProgress from './VipProgress';
import { toast } from 'sonner'; // Added toast import

const Profile = () => {
  const { user, signOut } = useAuth(); // Changed from logout to signOut
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut(); // Changed from logout to signOut
      navigate('/');
      toast.success("Successfully logged out");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to log out");
    }
  };
  
  if (!user) {
    return <div>Loading user profile...</div>;
  }

  const userDisplayName = user.displayName || user.username || "User";

  return (
    <div className="space-y-8 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url || user.avatar || ''} alt={userDisplayName} />
              <AvatarFallback>{userDisplayName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{userDisplayName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="mt-4">
            <UserStats user={user} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <WalletBalance user={user} />
          <VipProgress user={user} />
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          {/* Add more tabs as needed */}
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <p>
            Welcome to your profile overview. Here you can see a summary of your account
            activity and manage your settings.
          </p>
        </TabsContent>
      
      <TabsContent value="transactions" className="space-y-4">
        <TransactionsList userId={user.id} limit={10} /> {/* Added userId prop */}
      </TabsContent>
      
      </Tabs>
    </div>
  );
};

export default Profile;

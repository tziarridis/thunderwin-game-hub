
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Wallet } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, LogOut } from 'lucide-react'; // Wallet icon removed as WalletBalance handles it
import { useNavigate } from 'react-router-dom';
import TransactionsList from './TransactionsList'; // Assuming TransactionsList props are { userId: string, limit: number }
import WalletBalance, { WalletBalanceProps } from './WalletBalance'; // Import props
import UserStats, { UserStatsProps } from './UserStats'; // Import props
import VipProgress, { VipProgressProps } from './VipProgress'; // Import props
import { toast } from 'sonner'; 

const Profile = () => {
  const { user, signOut } = useAuth(); 
  const [activeTab, setActiveTab] = useState("overview"); // Keep if used, otherwise remove
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut(); 
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

  // Define props for child components
  const userStatsProps: UserStatsProps = { user };
  const walletBalanceProps: WalletBalanceProps = { user }; // Assuming WalletBalanceProps = { user: User }
  const vipProgressProps: VipProgressProps = { user }; // Assuming VipProgressProps = { user: User }


  return (
    <div className="space-y-8 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-500 hover:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
          </div>
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
            <UserStats {...userStatsProps} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <WalletBalance {...walletBalanceProps} />
          <VipProgress {...vipProgressProps} />
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          {/* Add more tabs as needed */}
        </TabsList>
        <TabsContent value="overview" className="space-y-4 mt-4">
          <p>
            Welcome to your profile overview. Here you can see a summary of your account
            activity and manage your settings.
          </p>
          {/* You can add more overview components here, e.g. recent activity, quick links */}
        </TabsContent>
      
      <TabsContent value="transactions" className="space-y-4 mt-4">
        <TransactionsList userId={user.id} limit={10} /> 
      </TabsContent>
      
      </Tabs>
    </div>
  );
};

export default Profile;


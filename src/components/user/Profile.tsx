
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Edit, Settings, LogOut, CreditCard, User, Shield, Clock } from "lucide-react";
import WalletBalance from "@/components/user/WalletBalance";
import TransactionsList from "@/components/user/TransactionsList";
import UserStats from '@/components/user/UserStats';
import VipProgress from '@/components/user/VipProgress';
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  if (!user) {
    navigate('/login'); // Should be handled by ProtectedRoute or similar in App.tsx ideally
    return null;
  }
  
  const handleLogout = async () => {
    if (logout) { // Check if logout function exists
      await logout();
      navigate('/');
    } else {
      toast.error("Logout function not available.");
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const userInitials = user.name ? getInitials(user.name) : user.email ? user.email[0].toUpperCase() : 'U';
  const userRole = user.role || 'player'; // Default role
  const userKycStatus = user.kycStatus || 'not_submitted';
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Profile</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/settings')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-6">
            <Avatar className="h-24 w-24 mb-4">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name || user.email || "User Avatar"} />
              ) : (
                <AvatarFallback className="bg-casino-thunder-green text-black text-xl">
                  {userInitials}
                </AvatarFallback>
              )}
            </Avatar>
            <h2 className="text-2xl font-bold">{user.name || 'User'}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            
            <div className="flex items-center mt-2">
              <Badge variant={userRole === 'admin' ? "destructive" : "secondary"} className="mr-2">
                {userRole === 'admin' ? 'Admin' : (userRole === 'moderator' ? 'Moderator' : 'Player')}
              </Badge>
              {userKycStatus === 'verified' && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Verified
                </Badge>
              )}
            </div>
            
            <Separator className="my-6" />
            
            <div className="w-full space-y-4">
              <WalletBalance variant="full" showRefresh={true} />
              
              <VipProgress level={user.vipLevel || 0} />
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <UserStats />
          
          <Card>
            <CardHeader>
              <CardTitle>Account Activity</CardTitle>
              <CardDescription>View your recent transactions and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="transactions">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="transactions" className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Transactions
                  </TabsTrigger>
                  <TabsTrigger value="game-history" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Game History
                  </TabsTrigger>
                  <TabsTrigger value="bonuses" className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Bonuses
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="transactions" className="pt-4">
                  {/* Assuming TransactionsList takes no props or fetches its own data */}
                  <TransactionsList /> 
                  <div className="flex justify-center mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/transactions')}
                    >
                      View All Transactions
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="game-history" className="pt-4">
                  <p className="text-center text-muted-foreground py-8">
                    Game history will be available soon.
                  </p>
                </TabsContent>
                
                <TabsContent value="bonuses" className="pt-4">
                  <p className="text-center text-muted-foreground py-8">
                    No active bonuses found. Visit the promotions page to claim bonuses.
                  </p>
                  <div className="flex justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/promotions')}
                    >
                      View Promotions
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal and account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                  <p>{user.name || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p>{user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Country</h3>
                  <p>{user.country || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <p>{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">KYC Status</h3>
                  <p className={
                    userKycStatus === 'verified' ? 'text-green-500' :
                    userKycStatus === 'pending' ? 'text-yellow-500' :
                    userKycStatus === 'rejected' ? 'text-red-500' :
                    'text-muted-foreground'
                  }>
                    {userKycStatus === 'verified' ? 'Verified' :
                     userKycStatus === 'pending' ? 'Pending Verification' :
                     userKycStatus === 'rejected' ? 'Verification Failed' :
                     'Not Submitted'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">2FA Status</h3>
                  <p>{user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/kyc')}
                  className="mr-2"
                >
                  {userKycStatus === 'verified' ? 'View KYC Status' : 'Complete KYC'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/settings')}
                >
                  Manage Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;


import React from 'react';
import { useParams } from 'react-router-dom';
import { UserProfileData, WalletTransaction, User, Wallet, Transaction } from '@/types'; // Ensure types are imported
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit } from 'lucide-react';

// Mock data for demonstration
const mockUserProfile: UserProfileData = {
  user: {
    id: '123',
    username: 'john_doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar_url: 'https://github.com/shadcn.png',
    registrationDate: new Date('2023-01-15').toISOString(),
    lastLogin: new Date('2023-10-20').toISOString(),
    kycStatus: 'verified',
    vipLevel: 2,
    balance: 1500.75,
    currency: 'USD',
    status: 'active',
    country: 'USA',
    emailVerified: true,
    twoFactorEnabled: false,
  },
  wallet: {
    id: 'w1',
    userId: '123',
    currency: 'USD',
    symbol: '$',
    balance: 1500.75,
    bonusBalance: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  recentTransactions: [
    { id: 't1', userId: '123', type: 'deposit', amount: 500, currency: 'USD', status: 'completed', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), description: 'Initial deposit' },
    { id: 't2', userId: '123', type: 'bet', amount: -50, currency: 'USD', status: 'completed', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), description: 'Slot game bet' },
    { id: 't3', userId: '123', type: 'win', amount: 100, currency: 'USD', status: 'completed', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), description: 'Slot game win' },
  ],
  stats: {
    gamesPlayed: 120,
    totalWagered: 5600,
  },
};


const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  // In a real app, you'd fetch user data based on userId
  const userProfileData = mockUserProfile; // Using mock data

  if (!userProfileData) {
    return <div>Loading user profile...</div>;
  }

  const { user, wallet, recentTransactions, stats } = userProfileData;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar_url} alt={user.username} />
            <AvatarFallback>{user.username?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.firstName} {user.lastName} ({user.username})</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <div className="flex space-x-2 mt-2">
              <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>{user.status}</Badge>
              <Badge variant="secondary">VIP Level {user.vipLevel}</Badge>
              <Badge variant={user.kycStatus === 'verified' ? 'default' : 'outline'}>KYC: {user.kycStatus}</Badge>
            </div>
          </div>
          <Button variant="outline" size="icon" className="ml-auto">
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Further user details can go here */}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <p><strong>Country:</strong> {user.country || 'N/A'}</p>
              <p><strong>Registered:</strong> {user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</p>
              <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
              <p><strong>2FA Enabled:</strong> {user.twoFactorEnabled ? 'Yes' : 'No'}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="wallet">
          <Card>
            <CardHeader><CardTitle>Wallet Details</CardTitle></CardHeader>
            <CardContent>
              {wallet ? (
                <>
                  <p><strong>Balance:</strong> {wallet.symbol}{wallet.balance.toFixed(2)} {wallet.currency}</p>
                  <p><strong>Bonus Balance:</strong> {wallet.symbol}{wallet.bonusBalance?.toFixed(2) || '0.00'}</p>
                </>
              ) : <p>No wallet information.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              {recentTransactions && recentTransactions.length > 0 ? (
                <ul className="space-y-2">
                  {recentTransactions.map(tx => (
                    <li key={tx.id} className="border p-2 rounded-md">
                      <p><strong>Type:</strong> {tx.type} | <strong>Amount:</strong> {tx.amount} {tx.currency} | <strong>Status:</strong> {tx.status}</p>
                      <p className="text-sm text-muted-foreground">{tx.description} - {new Date(tx.createdAt).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              ) : <p>No recent activity.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>User Settings</CardTitle></CardHeader>
            <CardContent>
              <p>User settings form or options would go here.</p>
              {/* Example: <Button>Change Password</Button> */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Transaction } from '@/types';
import { getTransactionsByPlayerId } from '@/services/transactionService';
import { getUserById } from '@/services/userService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import UserInfoForm from '@/components/admin/UserInfoForm';
import { Separator } from '@/components/ui/separator';
import { getWalletByUserId, Wallet } from '@/services/walletService';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Define a User interface to match the data structure
interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  phone?: string;
  ipAddress?: string;
  balance: number;
  vipLevel: number;
  status: string;
  isVerified: boolean;
  isAdmin?: boolean;
  role?: string;
  lastLogin?: string;
  created_at?: string;
  updated_at?: string;
  joined: string;
  favoriteGames: string[];
}

// Interface to define the shape of user data coming from Supabase
interface SupabaseUser {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  status?: string;
  banned?: boolean;
  created_at?: string;
  updated_at?: string;
  role_id?: number;
  avatar?: string;
  cpf?: string;
  language?: string;
  is_demo_agent?: boolean;
  affiliate_baseline?: number;
  affiliate_cpa?: number;
  affiliate_revenue_share?: number;
  affiliate_revenue_share_fake?: number;
}

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserAndTransactions = async () => {
      if (!userId) {
        setError("No user ID provided");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch user data
        const userData: SupabaseUser = await getUserById(userId);
        
        if (userData) {
          // Get wallet data for this user
          const walletData = await getWalletByUserId(userId);
          
          if (walletData) {
            // Fix: Use the setState function correctly
            setWallet(walletData);
          }
          
          // Transform userData to match our User interface
          const transformedUser: User = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            name: userData.first_name || userData.last_name ? 
                  `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : 
                  '',
            phone: userData.phone || '',
            balance: walletData?.balance || 0,
            vipLevel: walletData?.vip_level || 0,
            status: userData.status || 'active',
            isVerified: userData.role_id === 2, // Assuming role_id 2 is for verified users
            isAdmin: userData.role_id === 1, // Assuming role_id 1 is for admins
            role: getRoleFromId(userData.role_id),
            ipAddress: '', // Not stored in our current model
            joined: userData.created_at || new Date().toISOString(),
            favoriteGames: []
          };
          
          setUser(transformedUser);
          
          // Fetch transactions
          const transactionsData = await getTransactionsByPlayerId(userId, 10);
          setTransactions(transactionsData);
        } else {
          setError("User not found");
        }
        
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndTransactions();
  }, [userId]);
  
  // Helper function to convert role_id to a human-readable role
  const getRoleFromId = (roleId?: number): string => {
    switch (roleId) {
      case 1:
        return 'Admin';
      case 2:
        return 'Verified User';
      case 3:
        return 'User';
      default:
        return 'User';
    }
  };
  
  // Handle form submission
  const handleUpdateUser = async (updatedUser: User) => {
    try {
      // Update user data in Supabase
      // Split the name field into first_name and last_name
      const nameParts = updatedUser.name ? updatedUser.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const updatedData = {
        username: updatedUser.username,
        email: updatedUser.email,
        first_name: firstName,
        last_name: lastName,
        phone: updatedUser.phone || null,
        status: updatedUser.status,
      };
      
      // Update the user in Supabase
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', updatedUser.id);
      
      if (error) throw error;
      
      // Update wallet if balance or vipLevel has changed
      if (wallet && (updatedUser.balance !== wallet.balance || updatedUser.vipLevel !== wallet.vip_level)) {
        const { error: walletError } = await supabase
          .from('wallets')
          .update({
            balance: updatedUser.balance,
            vip_level: updatedUser.vipLevel
          })
          .eq('user_id', updatedUser.id);
        
        if (walletError) throw walletError;
      }
      
      // Update the local user state
      setUser(updatedUser);
      
      toast.success("User profile updated successfully");
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Failed to update user profile");
      throw err;
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-t-primary border-slate-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <Alert variant="destructive" className="max-w-3xl mx-auto mt-8">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || "User not found"}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Profile: {user?.username}</h1>
        <div className="flex space-x-2">
          <Badge variant={user?.isAdmin ? "default" : "outline"}>
            {user?.role || "User"}
          </Badge>
          <Badge variant={user?.status === 'active' ? "success" : "destructive"}>
            {user?.status}
          </Badge>
        </div>
      </div>
      
      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">User Details</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          {user && <UserInfoForm user={user} onSubmit={handleUpdateUser} />}
        </TabsContent>
        
        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-gray-400 mb-1">Balance</div>
                  <div className="text-2xl font-bold">${user?.balance.toFixed(2)}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-gray-400 mb-1">VIP Level</div>
                  <div className="text-2xl font-bold">{user?.vipLevel}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-gray-400 mb-1">Status</div>
                  <div className="text-2xl font-bold">{user?.status}</div>
                </div>
              </div>
              
              {wallet && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Additional Wallet Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800 p-4 rounded-lg">
                    <div>
                      <div className="text-gray-400 mb-1">Wallet ID</div>
                      <div className="font-mono text-sm">{wallet.id}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Currency</div>
                      <div>{wallet.currency} ({wallet.symbol})</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest activity for this user</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-right py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                          <td className="py-3 px-4">{new Date(transaction.date).toLocaleString()}</td>
                          <td className="py-3 px-4 capitalize">{transaction.type}</td>
                          <td className={`py-3 px-4 text-right ${transaction.type === 'deposit' || transaction.type === 'win' || transaction.type === 'bonus' ? 'text-green-500' : 'text-red-500'}`}>
                            {transaction.type === 'deposit' || transaction.type === 'win' || transaction.type === 'bonus' ? '+' : '-'}
                            {transaction.amount} {transaction.currency}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                              transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{transaction.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">No transactions found for this user.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bonuses">
          <Card>
            <CardHeader>
              <CardTitle>Bonuses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">No active bonuses for this user.</p>
              
              <Separator className="my-6" />
              
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-3">Assign Bonus</h3>
                <p className="text-gray-400 mb-6">This functionality will be implemented soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="kyc">
          <Card>
            <CardHeader>
              <CardTitle>KYC Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${user?.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="font-medium">{user?.isVerified ? 'Verified' : 'Not Verified'}</span>
              </div>
              
              {!user?.isVerified && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">KYC Verification</h3>
                  <p className="text-gray-400 mb-4">User has not submitted KYC documents yet.</p>
                </div>
              )}
              
              <Separator className="my-6" />
              
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-3">Identity Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-gray-400">Name</p>
                    <p>{user?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p>{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <p>{user?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">IP Address</p>
                    <p>{user?.ipAddress || 'Not available'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;

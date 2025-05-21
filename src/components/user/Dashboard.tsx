
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WalletBalance from '@/components/user/WalletBalance';
import VipProgress from '@/components/user/VipProgress';
import TransactionsList from '@/components/user/TransactionsList';
import { useAuth } from '@/contexts/AuthContext';
import { Stats } from '@/components/user/Stats'; // Assuming Stats component exists
import { supabase } from '@/integrations/supabase/client';
import { Wallet } from '@/types/wallet';
import { Transaction } from '@/types/transaction'; // Import Transaction type

const Dashboard = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true); // Added loading state for wallet
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWins: 0,
    favoriteGames: 0,
  });
  
  useEffect(() => {
    if (!user) {
      setIsLoadingWallet(false);
      return;
    }
    
    const fetchWallet = async () => {
      setIsLoadingWallet(true);
      const { data, error } = await supabase
        .from('wallets') // Supabase table name
        .select('*') // Select all columns
        .eq('user_id', user.id) // Ensure 'user_id' matches the column name in your 'wallets' table
        .single();
      
      if (error) {
        console.error('Error fetching wallet:', error);
        setWallet(null);
      } else if (data) {
        // Map Supabase data to Wallet type
        const fetchedWallet: Wallet = {
          id: data.id,
          userId: data.user_id, // Map user_id from DB to userId
          balance: data.balance ?? 0,
          currency: data.currency || 'USD',
          symbol: data.symbol || '$',
          vipLevel: data.vip_level ?? 0, // Map vip_level
          vipPoints: data.vip_points ?? 0, // Map vip_points
          bonusBalance: data.balance_bonus ?? 0,
          cryptoBalance: data.balance_cryptocurrency ?? 0,
          demoBalance: data.balance_demo ?? 0,
          isActive: data.active ?? false,
          lastTransactionDate: data.updated_at ? new Date(data.updated_at) : null,
          // Add any other fields from Wallet type, ensuring they have defaults if nullable
        };
        setWallet(fetchedWallet);
      } else {
        setWallet(null); // No wallet found
      }
      setIsLoadingWallet(false);
    };
    
    const fetchStats = async () => {
      // In a real implementation, you would fetch this data from your API
      // For now, just set some demo data
      setStats({
        totalBets: 50,
        totalWins: 12,
        favoriteGames: 5, // This might come from favorite_games table count
      });
    };
    
    fetchWallet();
    fetchStats();
  }, [user]);
  
  // Mock transactions for demo
  const transactions: Transaction[] = [ // Ensure mock data matches Transaction type
    {
      id: '1',
      player_id: user?.id || 'unknown-player',
      created_at: '2023-04-01T12:00:00Z',
      type: 'deposit', // ensure type matches TransactionType
      amount: 100,
      currency: 'USD',
      status: 'completed', // ensure status matches TransactionStatus
      provider: 'System',
    },
    {
      id: '2',
      player_id: user?.id || 'unknown-player',
      created_at: '2023-04-02T14:30:00Z',
      type: 'bet',
      amount: 20,
      currency: 'USD',
      status: 'completed',
      game_id: 'slots-adventure',
      provider: 'GameProviderX',
    },
    {
      id: '3',
      player_id: user?.id || 'unknown-player',
      created_at: '2023-04-03T16:45:00Z',
      type: 'win',
      amount: 50,
      currency: 'USD',
      status: 'completed',
      game_id: 'slots-adventure',
      provider: 'GameProviderX',
    },
    {
      id: '4',
      player_id: user?.id || 'unknown-player',
      created_at: '2023-04-04T09:15:00Z',
      type: 'withdrawal',
      amount: 30,
      currency: 'USD',
      status: 'pending',
      provider: 'System',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <WalletBalance wallet={wallet} isLoading={isLoadingWallet} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>VIP Status</CardTitle>
          </CardHeader>
          <CardContent>
            <VipProgress 
              currentLevel={wallet?.vipLevel || 0} 
              currentPoints={wallet?.vipPoints || 0} 
              pointsToNextLevel={1000} // Example value
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <Stats 
              totalBets={stats.totalBets}
              totalWins={stats.totalWins}
              favoriteGames={stats.favoriteGames}
            />
          </CardContent>
        </Card>
      </div>
      
      <TransactionsList 
        title="Recent Transactions" 
        transactions={transactions}
        showViewAllLink="/profile/transactions" // Make sure this route exists
      />
    </div>
  );
};

export default Dashboard;

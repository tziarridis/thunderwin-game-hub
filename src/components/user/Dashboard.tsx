import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WalletBalance from '@/components/user/WalletBalance';
import VipProgress from '@/components/user/VipProgress';
import TransactionsList from '@/components/user/TransactionsList';
import { useAuth } from '@/contexts/AuthContext';
import { Stats } from '@/components/user/Stats'; // Assuming Stats component exists
import { supabase } from '@/integrations/supabase/client';
import { Wallet } from '@/types/wallet';
import { Transaction, TransactionType, TransactionStatus } from '@/types/transaction'; // Import Transaction type

const Dashboard = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
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
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching wallet:', error);
        setWallet(null);
      } else if (data) {
        const fetchedWallet: Wallet = {
          id: data.id,
          userId: data.user_id,
          balance: data.balance ?? 0,
          currency: data.currency || 'USD',
          symbol: data.symbol || '$',
          vipLevel: data.vip_level ?? 0,
          vipPoints: data.vip_points ?? 0,
          bonusBalance: data.balance_bonus ?? 0,
          cryptoBalance: data.balance_cryptocurrency ?? 0,
          demoBalance: data.balance_demo ?? 0,
          isActive: data.active ?? false,
          lastTransactionDate: data.updated_at ? new Date(data.updated_at) : null,
        };
        setWallet(fetchedWallet);
      } else {
        setWallet(null);
      }
      setIsLoadingWallet(false);
    };
    
    const fetchStats = async () => {
      setStats({
        totalBets: 50,
        totalWins: 12,
        favoriteGames: 5,
      });
    };
    
    fetchWallet();
    fetchStats();
  }, [user]);
  
  // Mock transactions for demo, ensure they match the Transaction type from @/types/transaction
  const transactions: Transaction[] = [
    {
      id: '1',
      player_id: user?.id || 'unknown-player',
      created_at: new Date('2023-04-01T12:00:00Z').toISOString(),
      updated_at: new Date('2023-04-01T12:00:00Z').toISOString(), // Added updated_at
      type: 'deposit' as TransactionType,
      amount: 100,
      currency: 'USD',
      status: 'completed' as TransactionStatus,
      provider: 'System',
    },
    {
      id: '2',
      player_id: user?.id || 'unknown-player',
      created_at: new Date('2023-04-02T14:30:00Z').toISOString(),
      updated_at: new Date('2023-04-02T14:30:00Z').toISOString(), // Added updated_at
      type: 'bet' as TransactionType,
      amount: 20,
      currency: 'USD',
      status: 'completed' as TransactionStatus,
      game_id: 'slots-adventure',
      provider: 'GameProviderX',
    },
    {
      id: '3',
      player_id: user?.id || 'unknown-player',
      created_at: new Date('2023-04-03T16:45:00Z').toISOString(),
      updated_at: new Date('2023-04-03T16:45:00Z').toISOString(), // Added updated_at
      type: 'win' as TransactionType,
      amount: 50,
      currency: 'USD',
      status: 'completed' as TransactionStatus,
      game_id: 'slots-adventure',
      provider: 'GameProviderX',
    },
    {
      id: '4',
      player_id: user?.id || 'unknown-player',
      created_at: new Date('2023-04-04T09:15:00Z').toISOString(),
      updated_at: new Date('2023-04-04T09:15:00Z').toISOString(), // Added updated_at
      type: 'withdrawal' as TransactionType,
      amount: 30,
      currency: 'USD',
      status: 'pending' as TransactionStatus,
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
              pointsToNextLevel={1000}
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
        showViewAllLink="/profile/transactions"
      />
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WalletBalance from '@/components/user/WalletBalance';
import VipProgress from '@/components/user/VipProgress';
import TransactionsList from '@/components/user/TransactionsList';
import { useAuth } from '@/contexts/AuthContext';
import { Stats } from '@/components/user/Stats';
import { supabase } from '@/integrations/supabase/client';
import { Wallet } from '@/types/wallet';

const Dashboard = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWins: 0,
    favoriteGames: 0,
  });
  
  useEffect(() => {
    if (!user) return;
    
    const fetchWallet = async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching wallet:', error);
      } else {
        setWallet(data);
      }
    };
    
    const fetchStats = async () => {
      // In a real implementation, you would fetch this data from your API
      // For now, just set some demo data
      setStats({
        totalBets: 50,
        totalWins: 12,
        favoriteGames: 5,
      });
    };
    
    fetchWallet();
    fetchStats();
  }, [user]);
  
  // Mock transactions for demo
  const transactions = [
    {
      id: '1',
      date: '2023-04-01T12:00:00Z',
      type: 'Deposit',
      amount: 100,
      status: 'completed',
    },
    {
      id: '2',
      date: '2023-04-02T14:30:00Z',
      type: 'Bet',
      amount: 20,
      status: 'completed',
      game: 'Slots Adventure',
    },
    {
      id: '3',
      date: '2023-04-03T16:45:00Z',
      type: 'Win',
      amount: 50,
      status: 'completed',
      game: 'Slots Adventure',
    },
    {
      id: '4',
      date: '2023-04-04T09:15:00Z',
      type: 'Withdrawal',
      amount: 30,
      status: 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <WalletBalance wallet={wallet} /> {/* Pass wallet prop */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>VIP Status</CardTitle>
          </CardHeader>
          <CardContent>
            <VipProgress 
              currentLevel={wallet?.vip_level || 0} 
              currentPoints={wallet?.vip_points || 0} 
              pointsToNextLevel={100} 
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

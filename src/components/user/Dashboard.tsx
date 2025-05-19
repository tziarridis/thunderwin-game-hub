import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Heart, Award, TrendingUp, CreditCard, Gamepad2, UserCircle, ShieldCheck, AlertCircle, MessageSquare } from 'lucide-react';
import TransactionsList from '@/components/user/TransactionsList';
import VipProgress from '@/components/user/VipProgress';
import FeaturedGames from '@/components/marketing/FeaturedGames';
import UserPageLoadingSkeleton from './UserPageLoadingSkeleton';
import { User } from '@/types'; // Ensure User type is imported

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  // const { data: walletData, isLoading: walletLoading, error: walletError } = useQuery(['wallet', user?.id], () => fetchWallet(user!.id), { enabled: !!user });
  // const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useQuery(['transactions', user?.id], () => fetchTransactions(user!.id), { enabled: !!user });
  // const { data: gameStats, isLoading: gameStatsLoading, error: gameStatsError } = useQuery(['gameStats', user?.id], () => fetchGameStats(user!.id), { enabled: !!user });

  // Placeholder data until API calls are set up
  const [walletData, setWalletData] = useState({ balance: 1234.56, currency: 'USD', bonus_balance: 50.00, last_deposit: 100.00 });
  const [transactionsData, setTransactionsData] = useState([
    { id: '1', date: '2023-05-15', type: 'deposit', amount: 100.00, status: 'completed' },
    { id: '2', date: '2023-05-14', type: 'win', amount: 25.50, status: 'completed', game: 'Slots Deluxe' },
    { id: '3', date: '2023-05-13', type: 'withdrawal', amount: -50.00, status: 'pending' },
  ]);
  const [gameStats, setGameStats] = useState({ favorite_game: 'Gold Rush', total_bets: 500, total_wins: 250 });
  const [isLoading, setIsLoading] = useState(true); // General loading for placeholders

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);


  if (authLoading || isLoading) {
    return <UserPageLoadingSkeleton title="My Dashboard" />;
  }

  if (!user) {
    return <p className="text-center text-red-500">User not found. Please log in.</p>;
  }
  
  const userVipLevel = user.user_metadata?.vip_level || 0; // Corrected access

  const statsCards = [
    { title: "Current Balance", value: `${walletData.balance.toFixed(2)} ${walletData.currency}`, icon: DollarSign, description: `Bonus: ${walletData.bonus_balance.toFixed(2)} ${walletData.currency}` },
    { title: "Favorite Game", value: gameStats.favorite_game, icon: Heart, description: `Total Bets: ${gameStats.total_bets}` },
    { title: "VIP Level", value: userVipLevel, icon: Award, description: "Keep playing to level up!" }, // Used userVipLevel
    { title: "Last Deposit", value: `${walletData.last_deposit.toFixed(2)} ${walletData.currency}`, icon: TrendingUp, description: "Quick & easy deposits" },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Welcome, {user.user_metadata?.full_name || user.user_metadata?.username || user.email}!</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <Link to="/user/wallet/deposit"><CreditCard className="mr-2 h-4 w-4" /> Deposit</Link>
          </Button>
           <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground">
             <Link to="/casino"><Gamepad2 className="mr-2 h-4 w-4" /> Play Games</Link>
           </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <Card key={index} className="bg-card shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {card.title === "VIP Level" && typeof card.value === 'number' ? `Level ${card.value}` : card.value}
              </div>
              <p className="text-xs text-muted-foreground pt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VIP Progress */}
        <div className="lg:col-span-1">
          <VipProgress currentLevel={userVipLevel} currentPoints={user.user_metadata?.vip_points || 250} pointsToNextLevel={1000} />
        </div>

        {/* Recent Activity / Transactions */}
        <div className="lg:col-span-2">
          <TransactionsList title="Recent Activity" transactions={transactionsData.slice(0, 5)} showViewAllLink="/user/transactions" />
        </div>
      </div>

      {/* Quick Actions / Recommended Games */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { label: "My Profile", icon: UserCircle, path: "/user/profile" },
              { label: "Verify KYC", icon: ShieldCheck, path: "/user/kyc" },
              { label: "Set Limits", icon: AlertCircle, path: "/user/responsible-gambling" },
              { label: "Support", icon: MessageSquare, path: "/support" },
            ].map(action => (
              <Button key={action.label} variant="outline" className="flex-col h-24 text-center" asChild>
                <Link to={action.path}>
                  <action.icon className="h-8 w-8 mb-1 text-primary" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Placeholder for Recommended Games - using FeaturedGames component */}
        <FeaturedGames title="Recommended For You" tag="popular" count={6} />

      </div>
    </div>
  );
};

export default Dashboard;

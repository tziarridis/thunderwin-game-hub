import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletBalance from '@/components/user/WalletBalance';
import VipProgress from '@/components/user/VipProgress'; // Assuming this component exists
import UserPageLoadingSkeleton from '@/components/user/UserPageLoadingSkeleton';
import { useAuth } from '@/contexts/AuthContext'; // Ensure useAuth provides user object
import { WalletType, User } from '@/types'; // Import User type
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCog, CreditCard, Send, Gift, Heart, ArrowRight } from 'lucide-react';
import UserLayout from '@/components/layout/UserLayout';

const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth(); // user type here should be AppUser | null
  const navigate = useNavigate();
  
  // Simulate fetching user's primary wallet. This would typically come from a WalletContext or a specific service call.
  const [userWallet, setUserWallet] = useState<WalletType | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  useEffect(() => {
    if (user && user.id) { // Check if user and user.id exist
      setIsLoadingWallet(true);
      // Simulate fetching wallet data based on user.id
      // In a real app: const walletData = await walletService.getPrimaryWallet(user.id);
      setTimeout(() => {
        const exampleWallet: WalletType = {
          id: `wallet-${user.id}`,
          userId: user.id,
          user_id: user.id, // Also include if WalletType has it
          balance: user.balance ?? 1234.56, // Use user's balance if available, else default
          currency: user.currency ?? 'USD',
          symbol: user.currency === 'EUR' ? '€' : '$',
          vipLevel: user.vipLevel ?? 1,
          vipPoints: 750, // Example
          bonusBalance: 100.00, // Example
          cryptoBalance: 0.0,
          demoBalance: 0.0,
          isActive: true,
          lastTransactionDate: new Date(),
          hide_balance: false,
          total_bet: 2000,
          total_won: 1500,
          total_lose: 500,
        };
        setUserWallet(exampleWallet);
        setIsLoadingWallet(false);
      }, 500);
    } else if (!authLoading) {
      // If no user and auth is not loading, means user is not logged in or no user.id
      setIsLoadingWallet(false);
      // setUserWallet(null); // Not strictly needed if already null
    }
  }, [user, authLoading]);


  if (authLoading || (user && isLoadingWallet && !userWallet) ) { // Show loader if auth is loading OR (user exists AND wallet is loading AND wallet not yet set)
    return <UserPageLoadingSkeleton />;
  }

  if (!user) {
    // This should ideally be caught by a protected route redirecting to login.
    navigate('/login'); 
    return null; // Or a message prompting login
  }

  const quickActions = [
    { label: 'Deposit', icon: CreditCard, path: '/payment/deposit' },
    { label: 'Withdraw', icon: Send, path: '/payment/withdrawal' }, // Assuming withdrawal path
    { label: 'My Bonuses', icon: Gift, path: '/bonuses' },
    { label: 'Favorite Games', icon: Heart, path: '/casino/favorites' },
  ];

  const recentTransactions = [ /* Placeholder data */ ];

  return (
    <UserLayout title="My Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.username || user?.email}!</h1>
            <p className="text-muted-foreground">Here's your account overview.</p>
          </div>
          <Button onClick={() => navigate('/user/profile')}>
            <UserCog className="mr-2 h-4 w-4" /> View Profile
          </Button>
        </div>

        <WalletBalance wallet={userWallet} isLoading={isLoadingWallet} onRefresh={() => {/* Refresh wallet logic */}} />
        
        {/* VIP Progress - Assuming VipProgress component exists and takes user or vipLevel/vipPoints */}
        {user.vipLevel !== undefined && <VipProgress currentLevel={user.vipLevel} currentPoints={user.vipPoints || 0} pointsForNextLevel={1000} />}


        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map(action => (
                <Button key={action.path} variant="outline" className="h-auto py-3 justify-start" onClick={() => navigate(action.path)}>
                  <action.icon className="mr-3 h-5 w-5 text-primary" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Recent Transactions (Simplified) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/user/transactions')}>View All <ArrowRight className="ml-1 h-3 w-3"/></Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <ul className="space-y-3">
                  {/* Map recent transactions here */}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recent transactions.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recommended Games or Active Bonuses sections can be added here */}
        <Card>
            <CardHeader><CardTitle>Recommended For You</CardTitle></CardHeader>
            <CardContent>
                {/* Placeholder for recommended games */}
                <p className="text-sm text-muted-foreground">Game recommendations coming soon!</p>
            </CardContent>
        </Card>

      </div>
    </UserLayout>
  );
};

export default DashboardPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Gift, ListChecks, ShieldCheck, Settings, LifeBuoy, ArrowRight, CreditCard, Send, Heart, UserCog, Users, Percent, Ban, AlertOctagon, MailCheck, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, HelpCircle, Loader2, SearchX, ChevronLeft, PlayCircle, CircleDollarSign, HeartCrack, UserPlus, FileSearch } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { toast } from 'sonner';
import UserLayout from '@/components/layout/UserLayout';
import WalletBalance from './WalletBalance'; // Ensure this component is correctly defined and imported
import { WalletType } from '@/types/wallet'; // Ensure WalletType is imported
import { User } from '@/types'; // Assuming User type includes necessary fields

const UserDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Example: Fetch user-specific wallet. In a real app, this might come from a context or separate hook.
  // For now, we'll simulate it or assume it's part of the 'user' object or fetched separately.
  const [userWallet, setUserWallet] = React.useState<WalletType | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = React.useState(true);

  // Placeholder for fetching wallet data
  useEffect(() => {
    if (user) {
      // Simulate fetching wallet data
      // In a real app, you'd call an API: e.g., walletService.getWalletByUserId(user.id)
      setTimeout(() => {
        const fetchedWallet: WalletType = {
          // Sample data, ensure this matches WalletType structure from src/types/wallet.ts
          id: 'wallet123',
          userId: user.id,
          balance: user.balance ?? 1000.50, // Use balance from user object if available
          currency: user.currency ?? 'USD', // Use currency from user object if available
          symbol: user.currency === 'EUR' ? '€' : '$', // Example symbol logic
          vipLevel: user.vipLevel ?? 1,
          vipPoints: 500, // Example
          bonusBalance: 50.00, // Example
          cryptoBalance: 0.0, // Example
          demoBalance: 0.0, // Example
          isActive: true,
          lastTransactionDate: new Date(),
          hide_balance: false,
          total_bet: 1500, // Example
          total_won: 800, // Example
          total_lose: 700, // Example
          user_id: user.id, // Ensure user_id is present
        };
        setUserWallet(fetchedWallet);
        setIsLoadingWallet(false);
      }, 500);
    } else if (!authLoading) {
      // If no user and not loading auth, set loading wallet to false
      setIsLoadingWallet(false);
    }
  }, [user, authLoading]);

  const recentActivities = [
    { id: 1, type: 'deposit', amount: 100, status: 'Completed', date: '2023-05-20' },
    { id: 2, type: 'game_win', game: 'Slots Bonanza', amount: 50, status: 'Won', date: '2023-05-19' },
    { id: 3, type: 'withdrawal_request', amount: 75, status: 'Pending', date: '2023-05-18' },
  ];
  
  const quickLinks = [
    { label: 'Deposit Funds', path: '/payment/deposit', icon: DollarSign },
    { label: 'My Bonuses', path: '/bonuses', icon: Gift },
    { label: 'Transaction History', path: '/user/transactions', icon: ListChecks },
    { label: 'KYC Verification', path: '/user/kyc', icon: ShieldCheck },
    { label: 'Account Settings', path: '/user/settings', icon: Settings },
    { label: 'Responsible Gaming', path: '/support/responsible-gaming', icon: LifeBuoy },
  ];

  if (authLoading) {
    return <UserPageLoadingSkeleton />; // Or a simpler loader
  }

  if (!user) {
    // This case should ideally be handled by protected routes, redirecting to login
    // navigate('/login'); // Or show a message
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please log in to view your dashboard.</p>
        <Button onClick={() => navigate('/login')} className="mt-4">Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.username || user?.email}!</h1>
        <p className="text-muted-foreground">Here's what's new with your account.</p>
      </header>

      {/* Wallet Balance - ensure wallet prop is passed */}
      <WalletBalance wallet={userWallet} isLoading={isLoadingWallet} onRefresh={() => console.log("Refresh wallet")} />

      {/* ... rest of the dashboard JSX ... */}
      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Button
              key={link.path}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-primary/10 transition-all"
              onClick={() => navigate(link.path)}
            >
              <link.icon className="h-8 w-8 mb-1 text-primary" />
              <span className="text-sm font-medium">{link.label}</span>
            </Button>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            {recentActivities.length > 0 ? (
              <ul className="divide-y divide-border">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="p-4 flex justify-between items-center hover:bg-muted/50">
                    <div>
                      <p className="font-medium capitalize">{activity.type.replace('_', ' ')}{activity.game ? `: ${activity.game}` : ''}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${activity.amount > 0 && (activity.type.includes('win') || activity.type.includes('deposit')) ? 'text-green-500' : 'text-red-500'}`}>
                        {activity.amount > 0 && (activity.type.includes('win') || activity.type.includes('deposit')) ? '+' : activity.type.includes('withdrawal') ? '-' : ''}${Math.abs(activity.amount)}
                      </p>
                      <Badge variant={activity.status === 'Completed' || activity.status === 'Won' ? 'default' : 'secondary'} 
                             className={activity.status === 'Completed' || activity.status === 'Won' ? 'bg-green-500/20 text-green-700' : activity.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700' : ''}>
                        {activity.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-muted-foreground">No recent activity.</p>
            )}
          </CardContent>
          <CardFooter className="p-4 border-t border-border">
            <Button variant="link" onClick={() => navigate('/user/transactions')} className="p-0 h-auto">
              View All Transactions <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </section>
      
      {/* Placeholder for Promotions/Bonuses section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Active Promotions</h2>
        {/* Replace with actual PromotionSlider or list */}
        <div className="bg-card p-6 rounded-lg shadow text-center">
          <p className="text-muted-foreground">You have no active promotions.</p>
          <Button variant="default" onClick={() => navigate('/promotions')} className="mt-3">
            Explore Promotions
          </Button>
        </div>
      </section>

      {/* Placeholder for VIP Progress */}
      {/* <VipProgress user={user} /> */}
       <section>
        <h2 className="text-2xl font-semibold mb-4">VIP Progress</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">VIP features are coming soon!</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default UserDashboard;

// ... keep existing code (imports)
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, AppUser } from '@/contexts/AuthContext'; // Ensure AppUser is exported or use User directly if AppUser is internal
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import WalletBalance from '@/components/user/WalletBalance'; // Assuming WalletBalance expects WalletType
import { WalletType } from '@/types/wallet'; // Ensure WalletType is correctly imported
import { Gift, ShieldCheck, Users, TrendingUp, LifeBuoy, LogOut, Settings, UserCircle2 } from 'lucide-react'; // Added icons
import RecentActivity from '@/components/user/RecentActivity'; // Assuming this component exists
import QuickActions from '@/components/user/QuickActions'; // Assuming this component exists

const UserDashboardPage: React.FC = () => {
  const { user, signOut, loading: authLoading, refreshWalletBalance } = useAuth(); // user is AppUser | null

  // Mock wallet data - in a real app, this would come from user context or API
  const mockWallet: WalletType | null = user ? {
    id: 'wallet123',
    userId: user.id,
    balance: 1250.75,
    currency: 'USD',
    symbol: '$',
    vipLevel: 2,
    vipPoints: 1500,
    bonusBalance: 50.00,
    cryptoBalance: 0,
    demoBalance: 1000,
    isActive: true,
    lastTransactionDate: new Date(),
    hide_balance: false,
    total_bet: 5000,
    total_won: 6500,
    total_lose: 0, // Should be total_bet - total_won if no other factors
    user_id: user.id, // Ensure user_id is string
  } : null;

  if (authLoading && !user) {
    return <div className="flex justify-center items-center h-screen">Loading user data...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <p>Please log in to view your dashboard.</p>
        <Button asChild className="mt-4"><Link to="/login">Login</Link></Button>
      </div>
    );
  }
  
  const vipProgress = mockWallet ? (mockWallet.vipPoints / (mockWallet.vipLevel === 0 ? 1000 : mockWallet.vipLevel * 2000)) * 100 : 0;


  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.username || user.email?.split('@')[0]}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your account.</p>
        </div>
        <Button variant="outline" onClick={signOut} disabled={authLoading}>
            <LogOut className="mr-2 h-4 w-4"/> Sign Out
        </Button>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: User Info & Wallet */}
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user.avatarUrl || user.user_metadata?.avatar_url} alt={user.username || 'User'} />
                        <AvatarFallback>{(user.username || user.email || 'U')[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full mb-2"><Link to="/user/profile"><UserCircle2 className="mr-2 h-4 w-4"/>View Profile</Link></Button>
                    <Button asChild variant="outline" className="w-full"><Link to="/user/settings"><Settings className="mr-2 h-4 w-4"/>Account Settings</Link></Button>
                </CardContent>
            </Card>
            <WalletBalance wallet={mockWallet} isLoading={authLoading} onRefresh={refreshWalletBalance} />
        </div>

        {/* Right Column: Quick Actions & Recent Activity */}
        <div className="md:col-span-2 space-y-6">
            <QuickActions /> {/* This component needs to be created */}
            <RecentActivity /> {/* This component needs to be created */}
        </div>
      </div>
      
      {/* Other sections like VIP, Promotions, etc. */}
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>VIP Club</CardTitle>
                    <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                {mockWallet && <CardDescription>Level {mockWallet.vipLevel} - {mockWallet.vipPoints} Points</CardDescription>}
            </CardHeader>
            <CardContent>
                {mockWallet && <Progress value={vipProgress} className="mb-2 h-2" />}
                <p className="text-sm text-muted-foreground mb-3">
                    {mockWallet ? `You are ${100 - vipProgress.toFixed(0)}% away from the next level!` : 'Join the VIP club for exclusive rewards.'}
                </p>
                <Button asChild variant="secondary" className="w-full"><Link to="/user/vip-club">Explore VIP Benefits</Link></Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                 <div className="flex justify-between items-center">
                    <CardTitle>Active Promotions</CardTitle>
                    <Gift className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Check out the latest offers.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Placeholder for promotions, map through actual promotions */}
                <p className="text-sm text-muted-foreground mb-3">No active promotions currently. Check back soon!</p>
                <Button asChild variant="secondary" className="w-full"><Link to="/bonuses">View Bonus Hub</Link></Button>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Account Security</CardTitle>
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Manage your security settings.</CardDescription>
            </CardHeader>
            <CardContent>
                 <p className="text-sm text-muted-foreground mb-3">
                    Your account is {user.email_confirmed_at ? 'verified' : 'pending email verification'}. 
                    {/* Add 2FA status if available */}
                </p>
                <Button asChild variant="secondary" className="w-full"><Link to="/user/settings/security">Security Settings</Link></Button>
            </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default UserDashboardPage;

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, Wallet as WalletIcon, ShieldCheck, Gift, Star, Activity, Settings, LogOut } from 'lucide-react'; // Assuming icons are for illustration
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress"; // For VIP progress
import { Wallet } from '@/types'; // App's Wallet type

// Example Dashboard Stats Interface
interface DashboardStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalWagered: number;
  totalWins: number;
  activeBonuses: number;
}

const UserDashboard: React.FC = () => {
  const { user, wallet, signOut } = useAuth(); // signOut is now from context
  const navigate = useNavigate();

  // Placeholder data - replace with actual data fetching
  const stats: DashboardStats = {
    totalDeposits: 1250.75,
    totalWithdrawals: 300.00,
    totalWagered: 5800.50,
    totalWins: 6200.25,
    activeBonuses: 2,
  };
  
  const vipProgress = (user?.vip_level || 0) * 20; // Example: 5 levels, 20% per level

  const handleSignOut = async () => {
    await signOut();
    navigate('/'); // Redirect to home after sign out
  };

  if (!user) {
    // This should ideally be handled by a route guard, but as a fallback:
    navigate('/auth/login');
    return null;
  }
  
  const userDisplayName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Player";
  const userAvatar = user.user_metadata?.avatar_url;

  return (
    <div className="space-y-6 md:space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userAvatar} alt={userDisplayName} />
              <AvatarFallback>{userDisplayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome back, {userDisplayName}!</CardTitle>
              <CardDescription>Here's your casino overview.</CardDescription>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/user/profile')}>Edit Profile</Button>
        </CardHeader>
        <CardContent>
          {/* VIP Level and Progress */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-muted-foreground">VIP Level: <span className="text-primary font-semibold">{user.vip_level || 0}</span></p>
              <p className="text-sm text-primary font-semibold">{vipProgress}% to next level</p> {/* Example next level text */}
            </div>
            <Progress value={vipProgress} className="w-full h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Wallet Overview */}
      {wallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><WalletIcon className="mr-2 h-5 w-5 text-primary" /> Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-bold">{wallet.balance.toFixed(2)} <span className="text-lg text-muted-foreground">{wallet.currency}</span></p>
            {/* <p className="text-sm text-muted-foreground">Bonus Balance: {wallet.balance_bonus?.toFixed(2) || '0.00'} {wallet.currency}</p> */}
            <div className="flex gap-2 pt-2">
              <Button onClick={() => navigate('/wallet/deposit')}>Deposit</Button>
              <Button variant="outline" onClick={() => navigate('/wallet/withdraw')}>Withdraw</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Grid - Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Example Stat Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wagered</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalWagered.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        {/* Add more stat cards for totalDeposits, totalWins, activeBonuses etc. */}
      </div>

      {/* Quick Actions / Navigation */}
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Button variant="outline" className="flex-col h-auto py-4" onClick={() => navigate('/user/favorites')}><Star className="mb-1 h-6 w-6"/>My Favorites</Button>
          <Button variant="outline" className="flex-col h-auto py-4" onClick={() => navigate('/promotions')}><Gift className="mb-1 h-6 w-6"/>Promotions</Button>
          <Button variant="outline" className="flex-col h-auto py-4" onClick={() => navigate('/user/transactions')}><Activity className="mb-1 h-6 w-6"/>History</Button>
          <Button variant="outline" className="flex-col h-auto py-4" onClick={() => navigate('/user/settings')}><Settings className="mb-1 h-6 w-6"/>Settings</Button>
          <Button variant="outline" className="flex-col h-auto py-4 text-destructive hover:bg-destructive/10" onClick={handleSignOut}><LogOut className="mb-1 h-6 w-6"/>Sign Out</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;

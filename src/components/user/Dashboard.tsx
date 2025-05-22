import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { User, Game, Transaction as UserTransaction } from '@/types'; // Using UserTransaction alias
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AlertCircle, Award, BarChart3, DollarSign, Gift, Heart, LogOut, ShieldCheck, Star, UserCog, Users, Zap } from 'lucide-react';
import CasinoGameGrid from '@/components/casino/CasinoGameGrid'; // Using shared casino grid
import { useGames } from '@/hooks/useGames'; // For fetching favorite games

// Simplified type for wallet summary
interface WalletSummary {
  balance: number;
  currency: string;
  vipLevel: number;
  vipPoints: number;
  vipNextLevelPoints?: number; // Points needed for next VIP level
}

// Simplified type for recent activity
interface RecentActivity {
  id: string;
  type: 'game_played' | 'deposit' | 'withdrawal' | 'bonus_claimed';
  description: string;
  timestamp: string;
  game?: Partial<Game>; // Include game details if type is 'game_played'
}


const UserDashboard: React.FC = () => {
  // ... keep existing code (useState for wallet, recentGames, recentActivity)
  const { user, signOut, loading: authLoading } = useAuth();
  const { games: allGames, isLoadingGames, getGameById, favoriteGameIds, fetchGames } = useGames(); // Using useGames hook
  const navigate = useNavigate();

  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [recentPlayedGames, setRecentPlayedGames] = useState<Game[]>([]);
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<UserTransaction[]>([]); // Using aliased Transaction
  const [isLoadingData, setIsLoadingData] = useState(true);


  useEffect(() => {
    if (user && user.id) {
      setIsLoadingData(true);
      const fetchData = async () => {
        try {
          // Fetch wallet summary
          const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('balance, currency, vip_level, vip_points')
            .eq('user_id', user.id)
            .single();
          if (walletError) throw walletError;
          if (walletData) {
            setWallet({
              balance: walletData.balance,
              currency: walletData.currency,
              vipLevel: walletData.vip_level || 0,
              vipPoints: walletData.vip_points || 0,
              vipNextLevelPoints: ((walletData.vip_level || 0) + 1) * 1000, // Example calculation
            });
          }

          // Fetch recent transactions (limit 5)
          const { data: transactionsData, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .eq('player_id', user.id) // Assuming player_id is user_id
            .order('created_at', { ascending: false })
            .limit(5);
          if (transactionsError) throw transactionsError;
          setRecentTransactions((transactionsData as UserTransaction[]) || []);


          // Fetch recent played games (mocked or from a 'game_sessions' like table)
          // This is a placeholder, actual implementation depends on how recent games are tracked
          // For now, let's pick a few random games from the allGames list or featured games
          if(allGames.length > 0) {
            setRecentPlayedGames(allGames.slice(0, 3)); // Example: show first 3 loaded games
          } else {
             // If allGames is empty, fetch some featured games
             const { games: featured, totalCount } = await fetchGames({ is_featured: true }, 1, 3);
             setRecentPlayedGames(featured);
          }


          // Fetch favorite games
          if (favoriteGameIds.length > 0 && allGames.length > 0) {
            const favGames = favoriteGameIds
              .map(id => allGames.find(g => g.id === id))
              .filter(g => g !== undefined) as Game[];
            setFavoriteGames(favGames.slice(0,4)); // Show up to 4 favorite games
          } else if (favoriteGameIds.length > 0) {
            // If allGames not loaded yet but favorite IDs exist, fetch them individually (less efficient)
            // This scenario implies `allGames` might not be populated when this runs
            // Or better, fetch them by ID list if backend supports it
            // For now, we'll rely on allGames being available from useGames or being fetched
            console.log("Favorite IDs exist, but allGames might be empty or loading.")
          }


        } catch (error: any) {
          console.error('Error fetching dashboard data:', error);
          toast.error('Failed to load dashboard data: ' + error.message);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    } else if (!authLoading) {
      // If no user and not loading auth, means user is logged out
      setIsLoadingData(false);
    }
  }, [user, authLoading, allGames, favoriteGameIds, fetchGames]);


  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success("You have been signed out.");
  };

  if (authLoading || isLoadingData) {
    // ... keep existing code (loading skeleton)
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6 animate-pulse">
            <div className="h-10 bg-card rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-32 bg-card rounded"></div>
                <div className="h-32 bg-card rounded"></div>
                <div className="h-32 bg-card rounded"></div>
            </div>
            <div className="h-8 bg-card rounded w-1/4 mt-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-card rounded"></div>)}
            </div>
            <div className="h-8 bg-card rounded w-1/4 mt-6"></div>
             <div className="bg-card rounded p-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted rounded mb-2"></div>)}
            </div>
        </div>
    );
  }

  if (!user) {
    // ... keep existing code (prompt to login/register)
    return (
        <div className="container mx-auto p-4 md:p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">Please log in to view your dashboard.</p>
            <div className="space-x-4">
                <Button asChild><Link to="/login">Log In</Link></Button>
                <Button asChild variant="outline"><Link to="/register">Register</Link></Button>
            </div>
        </div>
    );
  }

  // ... keep existing code (JSX for the dashboard content: WalletSummary, VIPProgress, QuickActions, RecentActivity, FavoriteGames)
  // Ensure GameCard props are correctly passed (isFavorite, onToggleFavorite, onPlay)
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.username || user.email}!</h1>
        <p className="text-muted-foreground">Here's your gaming dashboard overview.</p>
      </div>

      {/* Wallet and VIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary" /> Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {wallet ? (
              <>
                <p className="text-3xl font-bold">{wallet.balance.toLocaleString(undefined, { style: 'currency', currency: wallet.currency || 'USD' })}</p>
                <Button asChild size="sm" className="mt-4 w-full"><Link to="/payment/deposit">Deposit</Link></Button>
              </>
            ) : <p>Loading wallet...</p>}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center"><Award className="mr-2 h-5 w-5 text-yellow-400" /> VIP Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {wallet ? (
              <>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Level {wallet.vipLevel}</span>
                  <span className="text-sm text-muted-foreground">{wallet.vipPoints} / {wallet.vipNextLevelPoints || ((wallet.vipLevel + 1) * 1000)} Points</span>
                </div>
                <Progress value={(wallet.vipPoints / (wallet.vipNextLevelPoints || ((wallet.vipLevel + 1) * 1000))) * 100} className="w-full h-3" />
                <p className="text-xs text-muted-foreground mt-2">Earn points by playing games to reach the next VIP level for exclusive rewards!</p>
                 <Button asChild variant="link" size="sm" className="px-0"><Link to="/vip">Learn More about VIP</Link></Button>
              </>
            ) : <p>Loading VIP status...</p>}
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader><CardTitle className="flex items-center"><Zap className="mr-2 h-5 w-5 text-blue-400"/>Quick Actions</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
            {[
                { label: "All Games", icon: BarChart3, link: "/casino/main" },
                { label: "Favorites", icon: Heart, link: "/casino/favorites" },
                { label: "Bonuses", icon: Gift, link: "/bonuses" },
                { label: "Settings", icon: UserCog, link: "/user/settings" },
                { label: "Support", icon: Users, link: "/support/help" },
            ].map(action => (
                <Button key={action.label} variant="outline" className="flex flex-col h-auto py-3" asChild>
                    <Link to={action.link}>
                        <action.icon className="h-6 w-6 mb-1 mx-auto" />
                        <span className="text-xs">{action.label}</span>
                    </Link>
                </Button>
            ))}
        </CardContent>
      </Card>


      {/* Recently Played Games */}
      {recentPlayedGames.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Recently Played</h2>
          <CasinoGameGrid games={recentPlayedGames} showEmptyMessage={false} />
        </section>
      )}

      {/* Favorite Games */}
      {favoriteGames.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Favorites</h2>
          <CasinoGameGrid games={favoriteGames} showEmptyMessage={false} />
        </section>
      )}


      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your last 5 transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <ul className="space-y-3">
              {recentTransactions.map(tx => (
                <li key={tx.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                  <div>
                    <p className="font-medium capitalize">{tx.type} {tx.game_id && `(${tx.game_id})`}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(tx.created_at), 'MMM d, yyyy - HH:mm')}</p>
                  </div>
                  <p className={`font-semibold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.amount.toLocaleString(undefined, { style: 'currency', currency: tx.currency || 'USD' })}
                  </p>
                </li>
              ))}
            </ul>
          ) : <p>No recent transactions.</p>}
          <Button asChild variant="link" className="mt-4 px-0"><Link to="/user/transactions">View All Transactions</Link></Button>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center">
          <Button variant="destructive" onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4"/>Sign Out</Button>
      </div>

    </div>
  );
};

export default UserDashboard;

import { supabase } from '@/integrations/supabase/client';
import { Game, Transaction } from '@/types'; // Assuming these types exist and are correct

export interface DashboardStats {
  totalUsers: number;
  activeSessions: number; // You'll need a way to determine this, e.g., recent activity
  totalDeposits: { amount: number; currency: string };
  totalWithdrawals: { amount: number; currency: string }; // Added
  totalBetsPlaced: number; // Count of bet transactions
  totalAmountWagered: { amount: number; currency: string }; // Sum of bet amounts
  totalAmountWon: { amount: number; currency: string }; // Sum of win amounts
  netGamingRevenue: { amount: number; currency: string }; // Wagered - Won
  popularGames: Pick<Game, 'id' | 'title' | 'views' | 'image'>[]; // Simplified for dashboard
  recentTransactions: Transaction[]; // Last N transactions
  pendingKycRequests: number;
  activePromotions: number;
}

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    console.log('Fetching dashboard stats...');
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));

      // Example queries (replace with actual Supabase calls)
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      if (usersError) console.error('Error fetching total users:', usersError);

      // For activeSessions, this is more complex.
      // You might query recent game_sessions or have another mechanism.
      // Placeholder:
      const { count: activeSessions, error: sessionsError } = await supabase
        .from('game_sessions') // Assuming you have a game_sessions table
        .select('*', { count: 'exact', head: true })
        .gt('ended_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()); // Active in last 15 mins
      if (sessionsError) console.error('Error fetching active sessions:', sessionsError);


      const { data: depositsData, error: depositsError } = await supabase
        .from('transactions')
        .select('amount, currency')
        .eq('type', 'deposit')
        .eq('status', 'completed'); // Or 'approved'
      if (depositsError) console.error('Error fetching deposits:', depositsError);
      const totalDepositsAmount = depositsData?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
      
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('transactions')
        .select('amount, currency')
        .eq('type', 'withdrawal')
        .eq('status', 'completed');
      if (withdrawalsError) console.error('Error fetching withdrawals:', withdrawalsError);
      const totalWithdrawalsAmount = withdrawalsData?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

      const { count: totalBetsPlaced, error: betsCountError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'bet');
      if (betsCountError) console.error('Error fetching total bets placed:', betsCountError);

      // Placeholder for pendingKycRequests and activePromotions
      // const { count: pendingKycRequests } = await supabase.from('kyc_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      // const { count: activePromotions } = await supabase.from('promotions').select('*', { count: 'exact', head: true }).eq('status', 'active');

      return {
        totalUsers: totalUsers ?? 0,
        activeSessions: activeSessions ?? 0, // Placeholder
        totalDeposits: { amount: totalDepositsAmount, currency: 'USD' }, // Assuming USD for now
        totalWithdrawals: { amount: totalWithdrawalsAmount, currency: 'USD' },
        totalBetsPlaced: totalBetsPlaced ?? 0,
        totalAmountWagered: { amount: 0, currency: 'USD' }, // Placeholder
        totalAmountWon: { amount: 0, currency: 'USD' }, // Placeholder
        netGamingRevenue: { amount: 0, currency: 'USD' }, // Placeholder
        popularGames: [], // Placeholder
        recentTransactions: [], // Placeholder
        pendingKycRequests: 0, // Placeholder
        activePromotions: 0, // Placeholder
      };
    } catch (error: any) {
      console.error('Error in getDashboardStats:', error.message);
      throw new Error(`Failed to fetch dashboard statistics: ${error.message}`);
    }
  },
};

export default dashboardService;

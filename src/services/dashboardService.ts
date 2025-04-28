
import { DashboardStats, GameStats, ProviderStats, RegionStats } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Attempt to fetch data from Supabase
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, created_at, status');
    
    if (usersError) throw usersError;
    
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*');
    
    if (transactionsError) throw transactionsError;
    
    // Calculate stats
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const totalUsers = users?.length || 0;
    const newUsers = users?.filter(u => new Date(u.created_at) >= new Date(monthStart)).length || 0;
    const activeUsers = users?.filter(u => u.status === 'active').length || 0;
    
    const deposits = transactions?.filter(t => t.type === 'deposit') || [];
    const withdrawals = transactions?.filter(t => t.type === 'withdrawal') || [];
    const bets = transactions?.filter(t => t.type === 'bet') || [];
    const wins = transactions?.filter(t => t.type === 'win') || [];
    
    const totalDeposits = deposits.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalBets = bets.length;
    const betAmount = bets.reduce((sum, t) => sum + Number(t.amount), 0);
    const winAmount = wins.reduce((sum, t) => sum + Number(t.amount), 0);
    
    const dailyTransactions = transactions?.filter(t => 
      new Date(t.created_at) >= new Date(todayStart)
    ) || [];
    
    const dailyRevenue = dailyTransactions
      .filter(t => t.type === 'bet' || t.type === 'deposit')
      .reduce((sum, t) => sum + Number(t.amount), 0) - 
      dailyTransactions
      .filter(t => t.type === 'win' || t.type === 'withdrawal')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const monthlyTransactions = transactions?.filter(t => 
      new Date(t.created_at) >= new Date(monthStart)
    ) || [];
    
    const monthlyRevenue = monthlyTransactions
      .filter(t => t.type === 'bet' || t.type === 'deposit')
      .reduce((sum, t) => sum + Number(t.amount), 0) - 
      monthlyTransactions
      .filter(t => t.type === 'win' || t.type === 'withdrawal')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalRevenue = betAmount - winAmount;
    const avgBetSize = totalBets > 0 ? betAmount / totalBets : 0;
    
    const registeredUsers = totalUsers;
    const usersWithDeposit = new Set(deposits.map(t => t.player_id)).size;
    const registrationConversion = registeredUsers > 0 ? (newUsers / registeredUsers) * 100 : 0;
    const depositConversion = registeredUsers > 0 ? (usersWithDeposit / registeredUsers) * 100 : 0;
    
    // Calculate GGR and NGR
    const bonusAmount = transactions?.filter(t => t.type === 'bonus').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const ggr = betAmount - winAmount;
    const ngr = ggr - bonusAmount;
    
    return {
      totalUsers,
      newUsers,
      activeUsers,
      totalRevenue,
      dailyRevenue,
      monthlyRevenue,
      totalBets,
      avgBetSize,
      registrationConversion,
      depositConversion,
      ggr,
      ngr,
      volume: betAmount,
      bonusAmount,
      taxes: ggr * 0.15, // Example tax calculation
      totalDeposits,
      totalWithdrawals,
      availableBalance: totalDeposits - totalWithdrawals
    };
    
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    
    // Return mock data for development
    return {
      totalUsers: 1250,
      newUsers: 125,
      activeUsers: 780,
      totalRevenue: 125000,
      dailyRevenue: 5200,
      monthlyRevenue: 125000,
      totalBets: 7800,
      avgBetSize: 32.5,
      registrationConversion: 25.5,
      depositConversion: 18.2,
      ggr: 35000,
      ngr: 30000,
      volume: 500000,
      bonusAmount: 5000,
      taxes: 5250,
      totalDeposits: 250000,
      totalWithdrawals: 150000,
      availableBalance: 100000
    };
  }
};

export const getGameStats = async (): Promise<GameStats[]> => {
  try {
    // Implement Supabase queries here for actual data
    // This is a mock implementation
    const mockGameStats: GameStats = {
      mostPlayed: [
        { name: "Sweet Bonanza", count: 450 },
        { name: "Wolf Gold", count: 320 },
        { name: "Gates of Olympus", count: 290 },
        { name: "Book of Dead", count: 245 },
        { name: "Starburst", count: 215 }
      ],
      highestWin: [
        { name: "Mega Moolah", amount: 12500 },
        { name: "Sweet Bonanza", amount: 8750 },
        { name: "Gonzo's Quest", amount: 7200 },
        { name: "Wolf Gold", amount: 6500 },
        { name: "Book of Dead", amount: 5800 }
      ],
      popularCategories: [
        { name: "Slots", count: 1200 },
        { name: "Table Games", count: 450 },
        { name: "Live Casino", count: 350 },
        { name: "Jackpots", count: 200 },
        { name: "New Games", count: 180 }
      ],
      totalBets: 3500,
      totalWins: 2800,
      netProfit: 12500,
      uniquePlayers: 750
    };
    
    return [mockGameStats];
    
  } catch (error) {
    console.error("Error fetching game stats:", error);
    
    // Return mock data for development
    return [{
      mostPlayed: [
        { name: "Sweet Bonanza", count: 450 },
        { name: "Wolf Gold", count: 320 },
        { name: "Gates of Olympus", count: 290 },
        { name: "Book of Dead", count: 245 },
        { name: "Starburst", count: 215 }
      ],
      highestWin: [
        { name: "Mega Moolah", amount: 12500 },
        { name: "Sweet Bonanza", amount: 8750 },
        { name: "Gonzo's Quest", amount: 7200 },
        { name: "Wolf Gold", amount: 6500 },
        { name: "Book of Dead", amount: 5800 }
      ],
      popularCategories: [
        { name: "Slots", count: 1200 },
        { name: "Table Games", count: 450 },
        { name: "Live Casino", count: 350 },
        { name: "Jackpots", count: 200 },
        { name: "New Games", count: 180 }
      ],
      totalBets: 3500,
      totalWins: 2800,
      netProfit: 12500,
      uniquePlayers: 750
    }];
  }
};

export const getProviderStats = async (): Promise<ProviderStats[]> => {
  try {
    // Implement Supabase queries here for actual data
    // This is a mock implementation
    const mockProviderStats: ProviderStats = {
      revenue: [
        { name: "Pragmatic Play", amount: 45000 },
        { name: "Evolution", amount: 32000 },
        { name: "NetEnt", amount: 28000 },
        { name: "Play'n GO", amount: 25000 },
        { name: "Microgaming", amount: 22000 }
      ],
      bets: [
        { name: "Pragmatic Play", count: 2800 },
        { name: "Evolution", count: 1900 },
        { name: "NetEnt", count: 1700 },
        { name: "Play'n GO", count: 1500 },
        { name: "Microgaming", count: 1300 }
      ],
      winRate: [
        { name: "NetEnt", rate: 97.5 },
        { name: "Microgaming", rate: 96.8 },
        { name: "Pragmatic Play", rate: 96.3 },
        { name: "Play'n GO", rate: 95.9 },
        { name: "Evolution", rate: 95.5 }
      ],
      totalBets: 9200,
      totalWins: 8800,
      netProfit: 45000,
      providerName: "All Providers",
      totalGames: 1500,
      uniquePlayers: 1200
    };
    
    return [mockProviderStats];
    
  } catch (error) {
    console.error("Error fetching provider stats:", error);
    
    // Return mock data for development
    return [{
      revenue: [
        { name: "Pragmatic Play", amount: 45000 },
        { name: "Evolution", amount: 32000 },
        { name: "NetEnt", amount: 28000 },
        { name: "Play'n GO", amount: 25000 },
        { name: "Microgaming", amount: 22000 }
      ],
      bets: [
        { name: "Pragmatic Play", count: 2800 },
        { name: "Evolution", count: 1900 },
        { name: "NetEnt", count: 1700 },
        { name: "Play'n GO", count: 1500 },
        { name: "Microgaming", count: 1300 }
      ],
      winRate: [
        { name: "NetEnt", rate: 97.5 },
        { name: "Microgaming", rate: 96.8 },
        { name: "Pragmatic Play", rate: 96.3 },
        { name: "Play'n GO", rate: 95.9 },
        { name: "Evolution", rate: 95.5 }
      ],
      totalBets: 9200,
      totalWins: 8800,
      netProfit: 45000,
      providerName: "All Providers",
      totalGames: 1500,
      uniquePlayers: 1200
    }];
  }
};

export const getRegionStats = async (): Promise<RegionStats[]> => {
  try {
    // Implement Supabase queries here for actual data
    // This is a mock implementation
    const mockRegionStats: RegionStats = {
      usersByCountry: [
        { country: "United States", users: 450 },
        { country: "Germany", users: 320 },
        { country: "United Kingdom", users: 290 },
        { country: "Canada", users: 245 },
        { country: "Australia", users: 215 }
      ],
      revenueByCountry: [
        { country: "United States", revenue: 45000 },
        { country: "Germany", revenue: 32000 },
        { country: "United Kingdom", revenue: 29000 },
        { country: "Canada", revenue: 24500 },
        { country: "Australia", revenue: 21500 }
      ],
      activeSessionsByRegion: [
        { region: "North America", sessions: 650 },
        { region: "Europe", sessions: 550 },
        { region: "Asia", sessions: 350 },
        { region: "Oceania", sessions: 250 },
        { region: "South America", sessions: 200 }
      ],
      depositAmount: 150000,
      betAmount: 350000,
      netProfit: 35000,
      region: "All Regions",
      userCount: 2000,
      winAmount: 315000
    };
    
    return [mockRegionStats];
    
  } catch (error) {
    console.error("Error fetching region stats:", error);
    
    // Return mock data for development
    return [{
      usersByCountry: [
        { country: "United States", users: 450 },
        { country: "Germany", users: 320 },
        { country: "United Kingdom", users: 290 },
        { country: "Canada", users: 245 },
        { country: "Australia", users: 215 }
      ],
      revenueByCountry: [
        { country: "United States", revenue: 45000 },
        { country: "Germany", revenue: 32000 },
        { country: "United Kingdom", revenue: 29000 },
        { country: "Canada", revenue: 24500 },
        { country: "Australia", revenue: 21500 }
      ],
      activeSessionsByRegion: [
        { region: "North America", sessions: 650 },
        { region: "Europe", sessions: 550 },
        { region: "Asia", sessions: 350 },
        { region: "Oceania", sessions: 250 },
        { region: "South America", sessions: 200 }
      ],
      depositAmount: 150000,
      betAmount: 350000,
      netProfit: 35000,
      region: "All Regions",
      userCount: 2000,
      winAmount: 315000
    }];
  }
};

export const getTransactionHistory = async (days: number = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // For now, return mock data with daily transactions for the specified number of days
    const mockData = [];
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        deposits: Math.floor(Math.random() * 5000) + 1000,
        withdrawals: Math.floor(Math.random() * 3000) + 500,
        bets: Math.floor(Math.random() * 10000) + 5000,
        wins: Math.floor(Math.random() * 8000) + 4000,
      });
    }
    
    return mockData;
    
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return [];
  }
};

export const getBonusStats = async () => {
  // Mock data for bonus statistics
  return {
    activeBonuses: 325,
    totalAwarded: 45000,
    averageBonusValue: 138,
    conversionRate: 65.2,
    bonusByType: [
      { name: "Welcome", value: 12000 },
      { name: "Deposit", value: 18000 },
      { name: "Free Spins", value: 8000 },
      { name: "Cashback", value: 5000 },
      { name: "VIP", value: 2000 }
    ],
    recentBonuses: [
      { id: '1', userId: 'user-1', type: 'welcome', amount: 100, status: 'active' },
      { id: '2', userId: 'user-2', type: 'deposit', amount: 50, status: 'active' },
      { id: '3', userId: 'user-3', type: 'free_spins', amount: 25, status: 'active' },
      { id: '4', userId: 'user-4', type: 'cashback', amount: 75, status: 'active' },
      { id: '5', userId: 'user-5', type: 'vip', amount: 200, status: 'active' }
    ]
  };
};

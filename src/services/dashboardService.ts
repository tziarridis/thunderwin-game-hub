
import { Transaction, User, Game, DashboardStats, GameStats, ProviderStats, RegionStats } from "@/types";
import { getTransactions } from "./transactionService";
import { usersApi } from "./apiService";
import { supabase } from "@/integrations/supabase/client";

// Calculate GGR (Gross Gaming Revenue): Total bets - Total wins
export const calculateGGR = (transactions: Transaction[]): number => {
  const bets = transactions
    .filter(t => t.type === 'bet')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const wins = transactions
    .filter(t => t.type === 'win')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return bets - wins;
};

// Calculate NGR (Net Gaming Revenue): GGR - Bonuses - Taxes
export const calculateNGR = (transactions: Transaction[]): number => {
  const ggr = calculateGGR(transactions);
  
  const bonuses = transactions
    .filter(t => t.type === 'bonus')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Assume taxes as a fixed percentage of GGR (e.g., 15%)
  const taxRate = 0.15;
  const taxes = ggr * taxRate;
  
  return ggr - bonuses - taxes;
};

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Fetch users and transactions from Supabase
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*');
      
    if (usersError) throw usersError;
    
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*');
      
    if (transactionsError) throw transactionsError;
    
    if (usersData && transactionsData) {
      const totalUsers = usersData.length;
      const activeUsers = usersData.filter(u => u.status === 'active').length;
      
      // Get transactions from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const recentTransactions = transactionsData.filter(
        t => new Date(t.created_at) >= yesterday
      );
      
      const totalBets = transactionsData
        .filter(t => t.type === 'bet')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalWins = transactionsData
        .filter(t => t.type === 'win')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const deposits = transactionsData
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const withdrawals = transactionsData
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const ggr = totalBets - totalWins;
      const bonusAmount = transactionsData
        .filter(t => t.type === 'bonus')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const taxes = ggr * 0.15; // Assume 15% tax rate
      const ngr = ggr - bonusAmount - taxes;
      
      // Calculate new users in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newUsers = usersData.filter(
        u => new Date(u.created_at) >= thirtyDaysAgo
      ).length;
      
      return {
        totalUsers,
        newUsers,
        activeUsers,
        totalRevenue: ggr,
        dailyRevenue: recentTransactions
          .filter(t => t.type === 'bet')
          .reduce((sum, t) => sum + t.amount, 0) - recentTransactions
          .filter(t => t.type === 'win')
          .reduce((sum, t) => sum + t.amount, 0),
        monthlyRevenue: ggr,
        totalBets: transactionsData.filter(t => t.type === 'bet').length,
        avgBetSize: totalBets / Math.max(1, transactionsData.filter(t => t.type === 'bet').length),
        registrationConversion: 0.25, // Placeholder
        depositConversion: 0.15, // Placeholder
        ggr,
        ngr,
        volume: totalBets,
        bonusAmount,
        taxes,
        totalDeposits: deposits,
        totalWithdrawals: withdrawals,
        availableBalance: deposits - withdrawals
      };
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }
  
  // Fallback to mock data
  return {
    totalUsers: 1250,
    newUsers: 87,
    activeUsers: 543,
    totalRevenue: 358750.25,
    dailyRevenue: 12450.75,
    monthlyRevenue: 358750.25,
    totalBets: 45678,
    avgBetSize: 25.35,
    registrationConversion: 0.25,
    depositConversion: 0.15,
    ggr: 89687.50,
    ngr: 67265.63,
    volume: 358750.25,
    bonusAmount: 5000,
    taxes: 13453.13,
    totalDeposits: 425000,
    totalWithdrawals: 267500,
    availableBalance: 157500
  };
};

// Get game statistics
export const getGameStats = async (gameId?: string): Promise<GameStats> => {
  try {
    // If gameId is provided, fetch stats for a specific game
    let query = supabase
      .from('transactions')
      .select('*');
      
    if (gameId) {
      query = query.eq('game_id', gameId);
    }
    
    const { data: transactionsData, error } = await query;
    
    if (error) throw error;
    
    if (transactionsData) {
      const gameBets: Record<string, { bets: number, wins: number, count: number }> = {};
      
      // Process transactions to build game stats
      transactionsData.forEach(t => {
        if (!t.game_id) return;
        
        if (!gameBets[t.game_id]) {
          gameBets[t.game_id] = { bets: 0, wins: 0, count: 0 };
        }
        
        if (t.type === 'bet') {
          gameBets[t.game_id].bets += t.amount;
          gameBets[t.game_id].count += 1;
        } else if (t.type === 'win') {
          gameBets[t.game_id].wins += t.amount;
        }
      });
      
      // Extract data for mostPlayed and highestWin
      const mostPlayed = Object.entries(gameBets)
        .map(([id, stats]) => ({
          name: id,
          count: stats.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
        
      const highestWin = Object.entries(gameBets)
        .map(([id, stats]) => ({
          name: id,
          amount: stats.wins
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
        
      // Create popular categories (using game IDs as proxy since we don't have categories)
      const popularCategories = Object.entries(gameBets)
        .map(([id, stats]) => ({
          name: id.split('-')[0] || 'other',
          count: stats.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
        
      const totalBets = Object.values(gameBets).reduce((sum, stats) => sum + stats.bets, 0);
      const totalWins = Object.values(gameBets).reduce((sum, stats) => sum + stats.wins, 0);
      
      return {
        mostPlayed,
        highestWin,
        popularCategories,
        totalBets,
        totalWins,
        netProfit: totalBets - totalWins,
        uniquePlayers: new Set(transactionsData.map(t => t.player_id)).size,
        gameName: gameId
      };
    }
  } catch (error) {
    console.error("Error fetching game stats:", error);
  }
  
  // Fallback to mock data
  return {
    mostPlayed: [
      { name: "Book of Dead", count: 2341 },
      { name: "Starburst", count: 1873 },
      { name: "Gonzo's Quest", count: 1506 },
      { name: "Sweet Bonanza", count: 1321 },
      { name: "Wolf Gold", count: 1102 }
    ],
    highestWin: [
      { name: "Mega Moolah", amount: 15732.45 },
      { name: "Book of Dead", amount: 8643.20 },
      { name: "Gonzo's Quest", amount: 6521.75 },
      { name: "Reactoonz", amount: 4350.90 },
      { name: "Wolf Gold", amount: 3279.60 }
    ],
    popularCategories: [
      { name: "slots", count: 5478 },
      { name: "table games", count: 2134 },
      { name: "live casino", count: 1876 },
      { name: "jackpot", count: 987 },
      { name: "megaways", count: 765 }
    ],
    totalBets: 245678,
    totalWins: 189543,
    netProfit: 56135,
    uniquePlayers: 3578
  };
};

// Get provider statistics
export const getProviderStats = async (providerId?: string): Promise<ProviderStats> => {
  try {
    // If providerId is provided, fetch stats for a specific provider
    const { data: transactionsData, error } = await supabase
      .from('transactions')
      .select('*');
      
    if (error) throw error;
    
    if (transactionsData) {
      const providerStats: Record<string, { revenue: number, bets: number, wins: number, count: number }> = {};
      
      // Process transactions to build provider stats
      transactionsData.forEach(t => {
        if (!t.provider) return;
        
        const provider = providerId ? (t.provider === providerId ? t.provider : null) : t.provider;
        if (!provider) return;
        
        if (!providerStats[provider]) {
          providerStats[provider] = { revenue: 0, bets: 0, wins: 0, count: 0 };
        }
        
        if (t.type === 'bet') {
          providerStats[provider].bets += t.amount;
          providerStats[provider].count += 1;
          providerStats[provider].revenue += t.amount;
        } else if (t.type === 'win') {
          providerStats[provider].wins += t.amount;
          providerStats[provider].revenue -= t.amount;
        }
      });
      
      // Extract data for revenue, bets, and winRate
      const revenue = Object.entries(providerStats)
        .map(([name, stats]) => ({
          name,
          amount: stats.revenue
        }))
        .sort((a, b) => b.amount - a.amount);
        
      const bets = Object.entries(providerStats)
        .map(([name, stats]) => ({
          name,
          count: stats.count
        }))
        .sort((a, b) => b.count - a.count);
        
      const winRate = Object.entries(providerStats)
        .map(([name, stats]) => ({
          name,
          rate: stats.bets > 0 ? stats.wins / stats.bets : 0
        }))
        .sort((a, b) => b.rate - a.rate);
        
      const totalBets = Object.values(providerStats).reduce((sum, stats) => sum + stats.bets, 0);
      const totalWins = Object.values(providerStats).reduce((sum, stats) => sum + stats.wins, 0);
      
      return {
        revenue,
        bets,
        winRate,
        totalBets,
        totalWins,
        netProfit: totalBets - totalWins,
        totalGames: Object.keys(providerStats).length,
        uniquePlayers: new Set(transactionsData.map(t => t.player_id)).size,
        providerName: providerId
      };
    }
  } catch (error) {
    console.error("Error fetching provider stats:", error);
  }
  
  // Fallback to mock data
  return {
    revenue: [
      { name: "Pragmatic Play", amount: 45678.90 },
      { name: "NetEnt", amount: 34567.80 },
      { name: "Play'n GO", amount: 23456.70 },
      { name: "Evolution Gaming", amount: 18765.60 },
      { name: "Microgaming", amount: 15678.50 }
    ],
    bets: [
      { name: "Pragmatic Play", count: 12345 },
      { name: "NetEnt", count: 10987 },
      { name: "Play'n GO", count: 8765 },
      { name: "Evolution Gaming", count: 7654 },
      { name: "Microgaming", count: 6543 }
    ],
    winRate: [
      { name: "NetEnt", rate: 0.97 },
      { name: "Microgaming", rate: 0.96 },
      { name: "Pragmatic Play", rate: 0.95 },
      { name: "Play'n GO", rate: 0.94 },
      { name: "Evolution Gaming", rate: 0.92 }
    ],
    totalBets: 187654,
    totalWins: 154321,
    netProfit: 33333,
    totalGames: 345,
    uniquePlayers: 2345
  };
};

// Get region statistics
export const getRegionStats = async (region?: string): Promise<RegionStats> => {
  try {
    // Get users and transactions data
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*');
      
    if (usersError) throw usersError;
    
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*');
      
    if (transactionsError) throw transactionsError;
    
    if (usersData && transactionsData) {
      // Implement region-based filtering and aggregation
      // We'll mock this with generic region data for now
      const userRegions: Record<string, number> = {};
      const revenueByRegion: Record<string, number> = {};
      const sessionsRegion: Record<string, number> = {};
      
      // Collect unique regions (could be countries, states, etc.)
      const uniqueRegions = [...new Set(usersData.map(u => u.language || 'unknown'))];
      
      // Generate mock counts by region
      uniqueRegions.forEach(region => {
        userRegions[region] = usersData.filter(u => u.language === region).length;
        
        const regionUsers = usersData.filter(u => u.language === region).map(u => u.id);
        const regionTransactions = transactionsData.filter(t => 
          regionUsers.includes(t.player_id)
        );
        
        const bets = regionTransactions
          .filter(t => t.type === 'bet')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const wins = regionTransactions
          .filter(t => t.type === 'win')
          .reduce((sum, t) => sum + t.amount, 0);
          
        revenueByRegion[region] = bets - wins;
        sessionsRegion[region] = new Set(regionTransactions.map(t => t.session_id || '')).size;
      });
      
      // Format the data for response
      const usersByCountry = Object.entries(userRegions)
        .map(([country, users]) => ({ country, users }))
        .sort((a, b) => b.users - a.users);
        
      const revenueByCountry = Object.entries(revenueByRegion)
        .map(([country, revenue]) => ({ country, revenue }))
        .sort((a, b) => b.revenue - a.revenue);
        
      const activeSessionsByRegion = Object.entries(sessionsRegion)
        .map(([region, sessions]) => ({ region, sessions }))
        .sort((a, b) => b.sessions - a.sessions);
        
      // Calculate aggregate values
      const betAmount = transactionsData
        .filter(t => t.type === 'bet')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const winAmount = transactionsData
        .filter(t => t.type === 'win')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const depositAmount = transactionsData
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
        
      return {
        usersByCountry,
        revenueByCountry,
        activeSessionsByRegion,
        depositAmount,
        betAmount,
        netProfit: betAmount - winAmount,
        region,
        userCount: usersData.length,
        winAmount
      };
    }
  } catch (error) {
    console.error("Error fetching region stats:", error);
  }
  
  // Fallback to mock data
  return {
    usersByCountry: [
      { country: "United States", users: 3452 },
      { country: "Germany", users: 2134 },
      { country: "United Kingdom", users: 1875 },
      { country: "Canada", users: 1456 },
      { country: "Australia", users: 978 }
    ],
    revenueByCountry: [
      { country: "United States", revenue: 78543.25 },
      { country: "Germany", revenue: 45678.90 },
      { country: "United Kingdom", revenue: 34567.80 },
      { country: "Canada", revenue: 23456.70 },
      { country: "Australia", revenue: 12345.60 }
    ],
    activeSessionsByRegion: [
      { region: "Europe", sessions: 3456 },
      { region: "North America", sessions: 2345 },
      { region: "Asia", sessions: 1234 },
      { region: "Oceania", sessions: 765 },
      { region: "South America", sessions: 432 }
    ],
    depositAmount: 245678.90,
    betAmount: 387654.30,
    netProfit: 67543.20,
    userCount: 8943,
    winAmount: 320111.10
  };
};

// Get KYC verification statistics
export const getKycStats = async (): Promise<any> => {
  try {
    const { data: kycData, error } = await supabase
      .from('kyc_requests')
      .select('*');
      
    if (error) throw error;
    
    if (kycData) {
      const pending = kycData.filter(k => k.status === 'pending').length;
      const verified = kycData.filter(k => k.status === 'verified').length;
      const rejected = kycData.filter(k => k.status === 'rejected').length;
      const notSubmitted = kycData.filter(k => k.status === 'not_submitted').length;
      
      const weeklyPending = kycData.filter(k => {
        const date = new Date(k.submission_date);
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo && k.status === 'pending';
      }).length;
      
      return {
        total: kycData.length,
        pending,
        verified,
        rejected,
        notSubmitted,
        verificationRate: kycData.length > 0 ? verified / kycData.length : 0,
        weeklyPending
      };
    }
  } catch (error) {
    console.error("Error fetching KYC stats:", error);
  }
  
  // Fallback to mock data
  return {
    total: 2345,
    pending: 342,
    verified: 1876,
    rejected: 127,
    notSubmitted: 0,
    verificationRate: 0.8,
    weeklyPending: 56
  };
};

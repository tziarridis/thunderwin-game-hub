import { Transaction, User, Game, DashboardStats, GameStats, ProviderStats, RegionStats } from "@/types";
import { getTransactions } from "./transactionService";
import { getUsers, getGames, getTransactions as getApiTransactions } from "./apiService";

// Calculate GGR (Gross Gaming Revenue): Total bets - Total wins
export const calculateGGR = (transactions: Transaction[]): number => {
  const totalBets = transactions.filter(tx => tx.type === "bet").reduce((sum, tx) => sum + tx.amount, 0);
  const totalWins = transactions.filter(tx => tx.type === "win").reduce((sum, tx) => sum + tx.amount, 0);
  return totalBets - totalWins;
};

// Calculate NGR (Net Gaming Revenue): GGR - Bonuses - Taxes
export const calculateNGR = (transactions: Transaction[]): number => {
  const ggr = calculateGGR(transactions);
  const bonuses = transactions.filter(tx => tx.type === "bonus").reduce((sum, tx) => sum + tx.amount, 0);
  // Assuming taxes are 5% of GGR for now, as a placeholder
  const taxes = ggr * 0.05;
  return ggr - bonuses - taxes;
};

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const transactions = await getApiTransactions();
    const users = await getUsers();
    
    // Calculate various metrics
    const deposits = transactions.filter(tx => tx.type === "deposit").reduce((sum, tx) => sum + tx.amount, 0);
    const withdrawals = transactions.filter(tx => tx.type === "withdraw").reduce((sum, tx) => sum + tx.amount, 0);
    const bets = transactions.filter(tx => tx.type === "bet").reduce((sum, tx) => sum + tx.amount, 0);
    const wins = transactions.filter(tx => tx.type === "win").reduce((sum, tx) => sum + tx.amount, 0);
    const bonuses = transactions.filter(tx => tx.type === "bonus").reduce((sum, tx) => sum + tx.amount, 0);
    
    // Calculate GGR & NGR
    const ggr = calculateGGR(transactions);
    const taxes = ggr * 0.05; // Assuming 5% tax rate as placeholder
    const ngr = ggr - bonuses - taxes;
    
    // Calculate total volume (total amount wagered)
    const volume = bets;
    
    // Calculate active users (users with transactions in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTransactions = transactions.filter(tx => {
      const txDate = tx.date ? new Date(tx.date) : new Date();
      return txDate >= thirtyDaysAgo;
    });
    
    const activeUserIds = [...new Set(recentTransactions.map(tx => tx.userId))];
    
    // Calculate new users (registered in the last 30 days)
    const newUsers = users.filter(user => {
      const joinDate = user.joined ? new Date(user.joined) : new Date();
      return joinDate >= thirtyDaysAgo;
    });
    
    // Calculate available balance (sum of all user balances)
    const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
    
    return {
      ggr,
      ngr,
      totalDeposits: deposits,
      totalWithdrawals: withdrawals,
      totalBets: bets,
      totalWins: wins,
      totalUsers: users.length,
      newUsers: newUsers.length,
      activeUsers: activeUserIds.length,
      bonusAmount: bonuses,
      availableBalance: totalBalance,
      volume: bets,
      taxes
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      ggr: 0,
      ngr: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalBets: 0,
      totalWins: 0,
      totalUsers: 0,
      newUsers: 0,
      activeUsers: 0,
      bonusAmount: 0,
      availableBalance: 0,
      volume: 0,
      taxes: 0
    };
  }
};

// Get game statistics
export const getGameStats = async (): Promise<GameStats[]> => {
  try {
    const transactions = await getApiTransactions();
    const games = await getGames();
    
    const gameStats: Map<string, GameStats> = new Map();
    
    // Process bet and win transactions
    for (const tx of transactions) {
      if ((tx.type === "bet" || tx.type === "win") && tx.gameId) {
        const game = games.find(g => g.id === tx.gameId);
        if (!game) continue;
        
        if (!gameStats.has(tx.gameId)) {
          gameStats.set(tx.gameId, {
            gameId: tx.gameId,
            gameName: game.title,
            provider: game.provider,
            totalBets: 0,
            totalWins: 0,
            netProfit: 0,
            uniquePlayers: 0
          });
        }
        
        const stats = gameStats.get(tx.gameId)!;
        
        if (tx.type === "bet") {
          stats.totalBets += tx.amount;
        } else if (tx.type === "win") {
          stats.totalWins += tx.amount;
        }
        
        stats.netProfit = stats.totalBets - stats.totalWins;
      }
    }
    
    // Calculate unique players per game
    for (const [gameId, stats] of gameStats.entries()) {
      const uniquePlayers = new Set(
        transactions
          .filter(tx => tx.gameId === gameId)
          .map(tx => tx.userId)
      );
      
      stats.uniquePlayers = uniquePlayers.size;
    }
    
    return Array.from(gameStats.values())
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, 10); // Return top 10 games by profit
  } catch (error) {
    console.error("Error fetching game stats:", error);
    return [];
  }
};

// Get provider statistics
export const getProviderStats = async (): Promise<ProviderStats[]> => {
  try {
    const transactions = await getApiTransactions();
    const games = await getGames();
    
    // Group games by provider
    const providers = new Map<string, string[]>();
    for (const game of games) {
      if (!providers.has(game.provider)) {
        providers.set(game.provider, []);
      }
      providers.get(game.provider)!.push(game.id);
    }
    
    const providerStats: ProviderStats[] = [];
    
    // Calculate stats for each provider
    for (const [providerName, gameIds] of providers.entries()) {
      let totalBets = 0;
      let totalWins = 0;
      const uniquePlayers = new Set<string>();
      
      for (const tx of transactions) {
        if (tx.gameId && gameIds.includes(tx.gameId)) {
          if (tx.type === "bet") {
            totalBets += tx.amount;
            uniquePlayers.add(tx.userId);
          } else if (tx.type === "win") {
            totalWins += tx.amount;
          }
        }
      }
      
      providerStats.push({
        providerId: providerName.toLowerCase().replace(/\s+/g, '-'),
        providerName,
        totalGames: gameIds.length,
        totalBets,
        totalWins,
        netProfit: totalBets - totalWins,
        uniquePlayers: uniquePlayers.size
      });
    }
    
    return providerStats.sort((a, b) => b.netProfit - a.netProfit);
  } catch (error) {
    console.error("Error fetching provider stats:", error);
    return [];
  }
};

// Get region statistics
export const getRegionStats = async (): Promise<RegionStats[]> => {
  try {
    const transactions = await getApiTransactions();
    const users = await getUsers();
    
    // Group users by country/region
    const regions = new Map<string, string[]>();
    for (const user of users) {
      const region = user.country || "Unknown";
      if (!regions.has(region)) {
        regions.set(region, []);
      }
      regions.get(region)!.push(user.id);
    }
    
    const regionStats: RegionStats[] = [];
    
    // Calculate stats for each region
    for (const [region, userIds] of regions.entries()) {
      let depositAmount = 0;
      let betAmount = 0;
      let winAmount = 0;
      
      for (const tx of transactions) {
        if (userIds.includes(tx.userId)) {
          if (tx.type === "deposit") {
            depositAmount += tx.amount;
          } else if (tx.type === "bet") {
            betAmount += tx.amount;
          } else if (tx.type === "win") {
            winAmount += tx.amount;
          }
        }
      }
      
      regionStats.push({
        region,
        userCount: userIds.length,
        depositAmount,
        betAmount,
        winAmount,
        netProfit: betAmount - winAmount
      });
    }
    
    return regionStats.sort((a, b) => b.netProfit - a.netProfit);
  } catch (error) {
    console.error("Error fetching region stats:", error);
    return [];
  }
};

// Get transaction history with time series data (for charts)
export const getTransactionHistory = async (days: number = 30): Promise<any[]> => {
  try {
    const transactions = await getApiTransactions();
    const result: any[] = [];
    
    // Create date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Initialize data for each day
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      result.push({
        date: dateStr,
        deposits: 0,
        withdrawals: 0,
        bets: 0,
        wins: 0,
        newUsers: 0,
        netRevenue: 0
      });
    }
    
    // Fill in transaction data
    for (const tx of transactions) {
      const txDate = tx.date ? new Date(tx.date) : new Date();
      if (txDate >= startDate && txDate <= endDate) {
        const dateStr = txDate.toISOString().split('T')[0];
        const dayData = result.find(item => item.date === dateStr);
        
        if (dayData) {
          if (tx.type === "deposit") {
            dayData.deposits += tx.amount;
          } else if (tx.type === "withdraw") {
            dayData.withdrawals += tx.amount;
          } else if (tx.type === "bet") {
            dayData.bets += tx.amount;
          } else if (tx.type === "win") {
            dayData.wins += tx.amount;
          }
          
          // Recalculate net revenue
          dayData.netRevenue = (dayData.bets - dayData.wins);
        }
      }
    }
    
    // Add new users count
    const users = await getUsers();
    for (const user of users) {
      if (user.joined) {
        const joinDate = new Date(user.joined);
        if (joinDate >= startDate && joinDate <= endDate) {
          const dateStr = joinDate.toISOString().split('T')[0];
          const dayData = result.find(item => item.date === dateStr);
          
          if (dayData) {
            dayData.newUsers += 1;
          }
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return [];
  }
};

// Get bonus usage statistics
export const getBonusStats = async (): Promise<any[]> => {
  try {
    const transactions = await getApiTransactions();
    
    // Filter bonus transactions
    const bonusTransactions = transactions.filter(tx => tx.type === "bonus");
    
    // Group bonuses by description/type
    const bonusesByType = bonusTransactions.reduce((acc, tx) => {
      const type = tx.description || "Unspecified";
      if (!acc[type]) {
        acc[type] = {
          type,
          count: 0,
          amount: 0,
          users: new Set()
        };
      }
      acc[type].count += 1;
      acc[type].amount += tx.amount;
      acc[type].users.add(tx.userId);
      return acc;
    }, {} as Record<string, { type: string; count: number; amount: number; users: Set<string> }>);
    
    // Convert to array and format for display
    return Object.values(bonusesByType).map(bonus => ({
      type: bonus.type,
      count: bonus.count,
      amount: bonus.amount,
      uniqueUsers: bonus.users.size
    }));
  } catch (error) {
    console.error("Error fetching bonus stats:", error);
    return [];
  }
};

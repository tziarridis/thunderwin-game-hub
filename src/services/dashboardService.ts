
import { DashboardStats, Transaction, User } from '@/types';
import { apiService } from './apiService'; // Assuming apiService provides necessary data fetching

export const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    // In a real app, this would fetch data from multiple sources or a dedicated dashboard API endpoint.
    // For this mock, we'll use existing apiService calls if available or return mock data.
    
    try {
      // Example: Fetch some data using apiService
      const users = await apiService.getUsers();
      const transactions = await apiService.getTransactions(); // Assuming this gets recent ones or all
      // const games = await apiService.getGames(); // If needed for 'most popular game'

      const totalDeposits = transactions
        .filter(t => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalWithdrawals = transactions
        .filter(t => t.type === 'withdrawal' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      // Mocking other stats for now
      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length, // Assuming User type has 'status'
        totalDeposits,
        totalWithdrawals,
        totalWagered: 125000, // Mock
        totalGGR: 12500, // Mock
        gamesPlayed: 5000, // Mock
        newSignupsToday: users.filter(u => u.created_at && new Date(u.created_at).toDateString() === new Date().toDateString()).length, // Basic daily signup
        averageSessionTime: "30 min", // Mock
        mostPopularGame: { name: "Sweet Bonanza", plays: 1200 }, // Mock
        recentTransactions: transactions.slice(0, 5), // Example: last 5 transactions
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return default/empty stats on error
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalWagered: 0,
        totalGGR: 0,
        gamesPlayed: 0,
        newSignupsToday: 0,
        averageSessionTime: "N/A",
        mostPopularGame: { name: "N/A", plays: 0 },
        recentTransactions: [],
      };
    }
  },
};

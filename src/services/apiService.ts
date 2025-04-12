
import { Game, User, Transaction, Promotion } from "@/types";

// Mock API service for games
export const gamesApi = {
  getGames: async (): Promise<Game[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Try to get games from localStorage first (if they exist from mock data)
      const storedGames = localStorage.getItem('games');
      if (storedGames) {
        return JSON.parse(storedGames);
      }
      
      // Fallback to imported mock data (this would be an actual API call in production)
      const { default: mockGames } = await import('@/data/mock-games');
      return mockGames;
    } catch (error) {
      console.error("Error fetching games:", error);
      return [];
    }
  },
  
  getGameById: async (id: string): Promise<Game | null> => {
    try {
      const games = await gamesApi.getGames();
      return games.find(game => game.id === id) || null;
    } catch (error) {
      console.error(`Error fetching game with id ${id}:`, error);
      return null;
    }
  },
  
  toggleFavorite: async (gameId: string): Promise<boolean> => {
    try {
      const games = await gamesApi.getGames();
      const gameIndex = games.findIndex(game => game.id === gameId);
      
      if (gameIndex === -1) {
        return false;
      }
      
      games[gameIndex].isFavorite = !games[gameIndex].isFavorite;
      localStorage.setItem('games', JSON.stringify(games));
      return true;
    } catch (error) {
      console.error(`Error toggling favorite for game ${gameId}:`, error);
      return false;
    }
  },
  
  addGame: async (game: Game): Promise<boolean> => {
    try {
      const games = await gamesApi.getGames();
      games.push(game);
      localStorage.setItem('games', JSON.stringify(games));
      return true;
    } catch (error) {
      console.error("Error adding game:", error);
      return false;
    }
  },
  
  updateGame: async (updatedGame: Game): Promise<boolean> => {
    try {
      const games = await gamesApi.getGames();
      const gameIndex = games.findIndex(game => game.id === updatedGame.id);
      
      if (gameIndex === -1) {
        return false;
      }
      
      games[gameIndex] = updatedGame;
      localStorage.setItem('games', JSON.stringify(games));
      return true;
    } catch (error) {
      console.error(`Error updating game ${updatedGame.id}:`, error);
      return false;
    }
  },
  
  deleteGame: async (gameId: string): Promise<boolean> => {
    try {
      const games = await gamesApi.getGames();
      const filteredGames = games.filter(game => game.id !== gameId);
      
      localStorage.setItem('games', JSON.stringify(filteredGames));
      return true;
    } catch (error) {
      console.error(`Error deleting game ${gameId}:`, error);
      return false;
    }
  }
};

// Mock API service for users
export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Try to get users from localStorage
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        return JSON.parse(storedUsers);
      }
      
      // Fallback to mock data
      const mockUsers = [
        {
          id: "1",
          username: "player1",
          email: "player1@example.com",
          balance: 2500,
          name: "John Doe",
          status: "Active",
          isAdmin: false,
          vipLevel: 3,
          isVerified: true,
          joined: "2023-01-15",
          role: "user",
        },
        {
          id: "2",
          username: "player2",
          email: "player2@example.com",
          balance: 1200,
          name: "Jane Smith",
          status: "Active",
          isAdmin: false,
          vipLevel: 1,
          isVerified: true,
          joined: "2023-02-20",
          role: "user",
        },
        {
          id: "admin1",
          username: "admin",
          email: "admin@thunderwin.com",
          balance: 10000,
          name: "Admin User",
          status: "Active",
          isAdmin: true,
          vipLevel: 10,
          isVerified: true,
          joined: "2022-10-01",
          role: "admin",
        }
      ];
      
      localStorage.setItem('users', JSON.stringify(mockUsers));
      return mockUsers;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },
  
  addUser: async (user: Omit<User, 'id'>): Promise<boolean> => {
    try {
      const users = await usersApi.getUsers();
      const newUser = {
        ...user,
        id: `user_${Date.now()}`,
      };
      
      users.push(newUser as User);
      localStorage.setItem('users', JSON.stringify(users));
      return true;
    } catch (error) {
      console.error("Error adding user:", error);
      return false;
    }
  },
  
  updateUser: async (updatedUser: User): Promise<boolean> => {
    try {
      const users = await usersApi.getUsers();
      const userIndex = users.findIndex(user => user.id === updatedUser.id);
      
      if (userIndex === -1) {
        return false;
      }
      
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
      return true;
    } catch (error) {
      console.error(`Error updating user ${updatedUser.id}:`, error);
      return false;
    }
  },
  
  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      const users = await usersApi.getUsers();
      const filteredUsers = users.filter(user => user.id !== userId);
      
      localStorage.setItem('users', JSON.stringify(filteredUsers));
      return true;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      return false;
    }
  }
};

// Mock API service for transactions
export const transactionsApi = {
  getTransactions: async (): Promise<Transaction[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Try to get transactions from localStorage
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        return JSON.parse(storedTransactions);
      }
      
      // Fallback to mock data
      const users = await usersApi.getUsers();
      const mockTransactions: Transaction[] = [];
      
      // Generate some mock transactions for each user
      users.forEach(user => {
        // Generate deposits
        mockTransactions.push({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId: user.id,
          userName: user.name || user.username,
          type: "deposit",
          amount: Math.floor(Math.random() * 1000) + 50,
          status: "completed",
          date: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
          method: "credit_card",
          currency: "USD"
        });
        
        // Generate withdrawals
        mockTransactions.push({
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId: user.id,
          userName: user.name || user.username,
          type: "withdraw",
          amount: Math.floor(Math.random() * 500) + 50,
          status: Math.random() > 0.3 ? "completed" : "pending",
          date: new Date(Date.now() - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000)).toISOString(),
          method: "bank_transfer",
          currency: "USD"
        });
        
        // Generate bets and wins
        for (let i = 0; i < 3; i++) {
          const betAmount = Math.floor(Math.random() * 100) + 10;
          
          mockTransactions.push({
            id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            userId: user.id,
            userName: user.name || user.username,
            type: "bet",
            amount: betAmount,
            status: "completed",
            date: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)).toISOString(),
            gameId: `game_${Math.floor(Math.random() * 20) + 1}`,
            method: "game",
            currency: "USD"
          });
          
          if (Math.random() > 0.5) {
            mockTransactions.push({
              id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              userId: user.id,
              userName: user.name || user.username,
              type: "win",
              amount: betAmount * (Math.random() * 3 + 1),
              status: "completed",
              date: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)).toISOString(),
              gameId: `game_${Math.floor(Math.random() * 20) + 1}`,
              method: "game",
              currency: "USD"
            });
          }
        }
      });
      
      localStorage.setItem('transactions', JSON.stringify(mockTransactions));
      return mockTransactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }
};

// Mock API service for promotions
export const promotionsApi = {
  getPromotions: async (): Promise<Promotion[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Try to get promotions from localStorage
      const storedPromotions = localStorage.getItem('promotions');
      if (storedPromotions) {
        return JSON.parse(storedPromotions);
      }
      
      // Fallback to mock data
      const mockPromotions: Promotion[] = [
        {
          id: "promo1",
          title: "Welcome Bonus",
          description: "Get 100% up to $500 + 100 Free Spins on your first deposit!",
          imageUrl: "/path/to/welcome-bonus.jpg",
          image: "/path/to/welcome-bonus.jpg",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          isActive: true,
          promotionType: "welcome",
          terms: "Terms and conditions apply. New players only. Minimum deposit $20.",
          category: "welcome"
        },
        {
          id: "promo2",
          title: "Weekend Reload",
          description: "Get 50% up to $200 on your weekend deposits!",
          imageUrl: "/path/to/weekend-reload.jpg",
          image: "/path/to/weekend-reload.jpg",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          isActive: true,
          promotionType: "deposit",
          terms: "Terms and conditions apply. Minimum deposit $20. Available Friday to Sunday only.",
          category: "deposit"
        },
        {
          id: "promo3",
          title: "Tuesday Free Spins",
          description: "Get 20 Free Spins on Starburst every Tuesday!",
          imageUrl: "/path/to/tuesday-spins.jpg",
          image: "/path/to/tuesday-spins.jpg",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          isActive: true,
          promotionType: "noDeposit",
          terms: "Terms and conditions apply. Available to all players who deposited in the last 7 days.",
          category: "free_spins"
        }
      ];
      
      localStorage.setItem('promotions', JSON.stringify(mockPromotions));
      return mockPromotions;
    } catch (error) {
      console.error("Error fetching promotions:", error);
      return [];
    }
  }
};

export default {
  gamesApi,
  usersApi,
  transactionsApi,
  promotionsApi
};

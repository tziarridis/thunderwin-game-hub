import { Game, User, Transaction } from "@/types";

// Mock API service for fetching games
export const gamesApi = {
  getGames: async (): Promise<Game[]> => {
    try {
      const { default: games } = await import('@/data/mock-games');
      return games;
    } catch (error) {
      console.error("Error fetching games:", error);
      throw error;
    }
  },
  
  toggleFavorite: async (gameId: string): Promise<boolean> => {
    // In a real application, you would make an API call to update the favorite status on the server
    // For this example, we'll just simulate a successful response
    console.log(`Toggling favorite for game ID: ${gameId}`);
    return true; // Simulate successful toggle
  },
};

// Mock API service for fetching users
export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    try {
      // For development, we're using mock data
      return [
        {
          id: "1",
          username: "player1",
          email: "player1@example.com",
          balance: 1000,
          vipLevel: 1,
          createdAt: "2023-01-15T12:00:00Z",
          lastLoginAt: "2023-04-10T09:30:00Z",
          isVerified: true,
          country: "United States",
          isAdmin: false
        },
        {
          id: "2",
          username: "player2",
          email: "player2@example.com",
          balance: 500,
          vipLevel: 2,
          createdAt: "2023-02-20T15:20:00Z",
          lastLoginAt: "2023-04-11T14:45:00Z",
          isVerified: true,
          country: "Canada",
          isAdmin: false
        },
        {
          id: "3",
          username: "admin",
          email: "admin@example.com",
          balance: 5000,
          vipLevel: 5,
          createdAt: "2023-01-01T10:00:00Z",
          lastLoginAt: "2023-04-12T08:15:00Z",
          isVerified: true,
          country: "United Kingdom",
          isAdmin: true
        }
      ];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },
};

// Mock API service for fetching transactions
export const transactionsApi = {
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      // For development, we're using mock data
      return [
        {
          id: "1",
          userId: "1",
          type: "deposit",
          amount: 500,
          status: "completed",
          createdAt: "2023-04-10T14:30:00Z",
          paymentMethod: "credit_card"
        },
        {
          id: "2",
          userId: "1",
          type: "withdraw",
          amount: 200,
          status: "completed",
          createdAt: "2023-04-11T10:15:00Z",
          paymentMethod: "bank_transfer"
        },
        {
          id: "3",
          userId: "2",
          type: "deposit",
          amount: 300,
          status: "completed",
          createdAt: "2023-04-09T16:45:00Z",
          paymentMethod: "e-wallet"
        },
        {
          id: "4",
          userId: "2",
          type: "bonus",
          amount: 50,
          status: "completed",
          createdAt: "2023-04-09T17:00:00Z",
          description: "Welcome bonus"
        },
        {
          id: "5",
          userId: "1",
          type: "bet",
          amount: 25,
          status: "completed",
          createdAt: "2023-04-10T18:30:00Z",
          gameId: "1"
        },
        {
          id: "6",
          userId: "1",
          type: "win",
          amount: 75,
          status: "completed",
          createdAt: "2023-04-10T18:35:00Z",
          gameId: "1"
        }
      ];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },
};

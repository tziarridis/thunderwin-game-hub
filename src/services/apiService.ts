
import { Game, User, Transaction, GameBet } from "@/types";
import { mockGames } from "@/data/mock-games";
import { toast } from "@/components/ui/use-toast";

// In a real application, these would be API calls to your backend
// For now, we'll use mock data and localStorage to simulate a backend

// Initialize local storage with mock data if empty
const initializeStorage = () => {
  if (!localStorage.getItem('games')) {
    localStorage.setItem('games', JSON.stringify(mockGames));
  }
  
  if (!localStorage.getItem('users')) {
    const mockUsers = [
      {
        id: "USR-1001",
        name: "John Doe",
        email: "john.doe@example.com",
        status: "Active",
        balance: 2540.00,
        joined: "2025-04-05",
        favoriteGames: ["1", "15"]
      },
      {
        id: "USR-1002",
        name: "Alice Smith",
        email: "alice.smith@example.com",
        status: "Active",
        balance: 1890.75,
        joined: "2025-04-03",
        favoriteGames: []
      },
      {
        id: "USR-1003",
        name: "Robert Johnson",
        email: "robert.johnson@example.com",
        status: "Inactive",
        balance: 0.00,
        joined: "2025-03-28",
        favoriteGames: ["6", "10"]
      }
    ];
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }
  
  if (!localStorage.getItem('transactions')) {
    const mockTransactions = [
      {
        id: "TRX-10045",
        userId: "USR-1001",
        userName: "John Doe",
        type: "deposit",
        amount: 500.00,
        currency: "USD",
        status: "completed",
        method: "Credit Card",
        date: "2025-04-08T15:30:22Z"
      },
      {
        id: "TRX-10044",
        userId: "USR-1002",
        userName: "Alice Smith",
        type: "withdraw",
        amount: 250.00,
        currency: "USD",
        status: "completed",
        method: "Bank Transfer",
        date: "2025-04-08T14:22:10Z"
      }
    ];
    localStorage.setItem('transactions', JSON.stringify(mockTransactions));
  }
  
  if (!localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', JSON.stringify({
      id: "USR-1001",
      name: "John Doe",
      email: "john.doe@example.com"
    }));
  }
  
  if (!localStorage.getItem('bets')) {
    const mockBets = [
      {
        id: "BET-1001",
        gameId: "1",
        userId: "USR-1001",
        amount: 10,
        result: "win",
        winAmount: 15,
        date: "2025-04-08T16:30:22Z"
      },
      {
        id: "BET-1002",
        gameId: "15",
        userId: "USR-1001",
        amount: 5,
        result: "loss",
        winAmount: 0,
        date: "2025-04-08T16:15:10Z"
      }
    ];
    localStorage.setItem('bets', JSON.stringify(mockBets));
  }
};

// Initialize storage on module load
initializeStorage();

// Helper to simulate API delay
const simulateApiDelay = () => new Promise(resolve => setTimeout(resolve, 300));

// Games API
export const gamesApi = {
  getGames: async (): Promise<Game[]> => {
    await simulateApiDelay();
    try {
      const games = JSON.parse(localStorage.getItem('games') || '[]');
      
      // Get current user's favorite games
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.id === currentUser.id);
      
      if (user && user.favoriteGames) {
        // Mark games as favorite for the current user
        return games.map((game: Game) => ({
          ...game,
          isFavorite: user.favoriteGames.includes(game.id)
        }));
      }
      
      return games;
    } catch (error) {
      console.error("Error fetching games:", error);
      toast({
        title: "Error",
        description: "Failed to load games",
        variant: "destructive"
      });
      return [];
    }
  },
  
  getGameById: async (id: string): Promise<Game | null> => {
    await simulateApiDelay();
    try {
      const games = JSON.parse(localStorage.getItem('games') || '[]');
      const game = games.find((g: Game) => g.id === id);
      
      if (!game) return null;
      
      // Check if game is in user's favorites
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.id === currentUser.id);
      
      return {
        ...game,
        isFavorite: user?.favoriteGames?.includes(game.id) || false
      };
    } catch (error) {
      console.error("Error fetching game:", error);
      toast({
        title: "Error",
        description: "Failed to load game details",
        variant: "destructive"
      });
      return null;
    }
  },
  
  addGame: async (game: Omit<Game, 'id'>): Promise<Game> => {
    await simulateApiDelay();
    try {
      const games = JSON.parse(localStorage.getItem('games') || '[]');
      const newId = (games.length + 1).toString();
      
      const newGame = {
        ...game,
        id: newId
      };
      
      localStorage.setItem('games', JSON.stringify([...games, newGame]));
      
      toast({
        title: "Success",
        description: "Game added successfully"
      });
      
      return newGame;
    } catch (error) {
      console.error("Error adding game:", error);
      toast({
        title: "Error",
        description: "Failed to add game",
        variant: "destructive"
      });
      throw error;
    }
  },
  
  updateGame: async (game: Game): Promise<Game> => {
    await simulateApiDelay();
    try {
      const games = JSON.parse(localStorage.getItem('games') || '[]');
      const index = games.findIndex((g: Game) => g.id === game.id);
      
      if (index === -1) throw new Error("Game not found");
      
      games[index] = game;
      localStorage.setItem('games', JSON.stringify(games));
      
      toast({
        title: "Success",
        description: "Game updated successfully"
      });
      
      return game;
    } catch (error) {
      console.error("Error updating game:", error);
      toast({
        title: "Error",
        description: "Failed to update game",
        variant: "destructive"
      });
      throw error;
    }
  },
  
  deleteGame: async (id: string): Promise<void> => {
    await simulateApiDelay();
    try {
      const games = JSON.parse(localStorage.getItem('games') || '[]');
      const filteredGames = games.filter((g: Game) => g.id !== id);
      
      localStorage.setItem('games', JSON.stringify(filteredGames));
      
      toast({
        title: "Success",
        description: "Game deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting game:", error);
      toast({
        title: "Error",
        description: "Failed to delete game",
        variant: "destructive"
      });
      throw error;
    }
  },
  
  toggleFavorite: async (gameId: string): Promise<boolean> => {
    await simulateApiDelay();
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
      
      if (userIndex === -1) throw new Error("User not found");
      
      const user = users[userIndex];
      const favorites = user.favoriteGames || [];
      
      // Toggle favorite status
      let isFavorite = false;
      
      if (favorites.includes(gameId)) {
        // Remove from favorites
        user.favoriteGames = favorites.filter((id: string) => id !== gameId);
      } else {
        // Add to favorites
        user.favoriteGames = [...favorites, gameId];
        isFavorite = true;
      }
      
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));
      
      toast({
        title: isFavorite ? "Added to Favorites" : "Removed from Favorites",
        description: isFavorite ? "Game added to your favorites" : "Game removed from your favorites"
      });
      
      return isFavorite;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
      throw error;
    }
  }
};

// Users API
export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    await simulateApiDelay();
    try {
      return JSON.parse(localStorage.getItem('users') || '[]');
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
      return [];
    }
  },
  
  getUserById: async (id: string): Promise<User | null> => {
    await simulateApiDelay();
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.find((u: User) => u.id === id) || null;
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive"
      });
      return null;
    }
  },
  
  addUser: async (user: Omit<User, 'id'>): Promise<User> => {
    await simulateApiDelay();
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const newId = `USR-${1000 + users.length + 1}`;
      
      const newUser = {
        ...user,
        id: newId,
        favoriteGames: []
      };
      
      localStorage.setItem('users', JSON.stringify([...users, newUser]));
      
      toast({
        title: "Success",
        description: "User added successfully"
      });
      
      return newUser;
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive"
      });
      throw error;
    }
  },
  
  updateUser: async (user: User): Promise<User> => {
    await simulateApiDelay();
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const index = users.findIndex((u: User) => u.id === user.id);
      
      if (index === -1) throw new Error("User not found");
      
      users[index] = user;
      localStorage.setItem('users', JSON.stringify(users));
      
      toast({
        title: "Success",
        description: "User updated successfully"
      });
      
      return user;
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
      throw error;
    }
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    await simulateApiDelay();
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!currentUser.id) return null;
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.find((u: User) => u.id === currentUser.id) || null;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  }
};

// Transactions API
export const transactionsApi = {
  getTransactions: async (): Promise<Transaction[]> => {
    await simulateApiDelay();
    try {
      return JSON.parse(localStorage.getItem('transactions') || '[]');
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
      return [];
    }
  },
  
  getUserTransactions: async (userId: string): Promise<Transaction[]> => {
    await simulateApiDelay();
    try {
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      return transactions.filter((t: Transaction) => t.userId === userId);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
      return [];
    }
  },
  
  addTransaction: async (transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
    await simulateApiDelay();
    try {
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const newId = `TRX-${10000 + transactions.length + 1}`;
      
      const newTransaction = {
        ...transaction,
        id: newId,
        date: new Date().toISOString()
      };
      
      localStorage.setItem('transactions', JSON.stringify([...transactions, newTransaction]));
      
      // Update user balance
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === transaction.userId);
      
      if (userIndex !== -1) {
        const user = users[userIndex];
        
        if (transaction.type === 'deposit' && transaction.status === 'completed') {
          user.balance += transaction.amount;
        } else if (transaction.type === 'withdraw' && transaction.status === 'completed') {
          user.balance -= transaction.amount;
        } else if (transaction.type === 'bet') {
          user.balance -= transaction.amount;
        } else if (transaction.type === 'win') {
          user.balance += transaction.amount;
        }
        
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      toast({
        title: "Success",
        description: "Transaction completed successfully"
      });
      
      return newTransaction;
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive"
      });
      throw error;
    }
  }
};

// Game bets API
export const betsApi = {
  placeBet: async (gameId: string, amount: number): Promise<GameBet> => {
    await simulateApiDelay();
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!currentUser.id) throw new Error("User not logged in");
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
      
      if (userIndex === -1) throw new Error("User not found");
      
      const user = users[userIndex];
      
      // Check if user has enough balance
      if (user.balance < amount) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough funds to place this bet",
          variant: "destructive"
        });
        throw new Error("Insufficient balance");
      }
      
      // Random win/loss with 40% chance of winning
      const isWin = Math.random() < 0.4;
      const winMultiplier = isWin ? Math.random() * 2 + 1 : 0; // Random multiplier between 1 and 3
      const winAmount = isWin ? Math.round(amount * winMultiplier * 100) / 100 : 0;
      
      const bets = JSON.parse(localStorage.getItem('bets') || '[]');
      const newBet: GameBet = {
        id: `BET-${1000 + bets.length + 1}`,
        gameId,
        userId: currentUser.id,
        amount,
        result: isWin ? 'win' : 'loss',
        winAmount,
        date: new Date().toISOString()
      };
      
      // Add bet to history
      localStorage.setItem('bets', JSON.stringify([...bets, newBet]));
      
      // Add transaction for the bet
      await transactionsApi.addTransaction({
        userId: currentUser.id,
        userName: user.name,
        type: 'bet',
        amount,
        currency: 'USD',
        status: 'completed',
        method: 'Game Bet',
        gameId,
      });
      
      // Add transaction for the win (if won)
      if (isWin && winAmount > 0) {
        await transactionsApi.addTransaction({
          userId: currentUser.id,
          userName: user.name,
          type: 'win',
          amount: winAmount,
          currency: 'USD',
          status: 'completed',
          method: 'Game Win',
          gameId,
        });
      }
      
      // Update user balance directly (already updated in transactions, but let's be safe)
      user.balance = user.balance - amount + winAmount;
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));
      
      return newBet;
    } catch (error) {
      console.error("Error placing bet:", error);
      if (error.message !== "Insufficient balance") {
        toast({
          title: "Error",
          description: "Failed to place bet",
          variant: "destructive"
        });
      }
      throw error;
    }
  },
  
  getUserBets: async (userId: string): Promise<GameBet[]> => {
    await simulateApiDelay();
    try {
      const bets = JSON.parse(localStorage.getItem('bets') || '[]');
      return bets.filter((b: GameBet) => b.userId === userId);
    } catch (error) {
      console.error("Error fetching user bets:", error);
      toast({
        title: "Error",
        description: "Failed to load bet history",
        variant: "destructive"
      });
      return [];
    }
  },
  
  getGameBets: async (gameId: string): Promise<GameBet[]> => {
    await simulateApiDelay();
    try {
      const bets = JSON.parse(localStorage.getItem('bets') || '[]');
      return bets.filter((b: GameBet) => b.gameId === gameId);
    } catch (error) {
      console.error("Error fetching game bets:", error);
      toast({
        title: "Error",
        description: "Failed to load game bets",
        variant: "destructive"
      });
      return [];
    }
  }
};

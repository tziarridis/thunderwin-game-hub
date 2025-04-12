
import { User, Game, Transaction, GameBet, GameProvider } from "@/types";
import { mockGames } from "@/data/mock-games";

// Initialize all database tables in localStorage
export const initializeDatabase = () => {
  // Initialize mock users if empty
  if (!localStorage.getItem('users')) {
    const mockUsers = [
      {
        id: "USR-1001",
        name: "John Doe",
        email: "john.doe@example.com",
        status: "Active",
        balance: 2540.00,
        joined: "2025-04-05",
        favoriteGames: ["1", "15"],
        role: "user"
      },
      {
        id: "USR-1002",
        name: "Alice Smith",
        email: "alice.smith@example.com",
        status: "Active",
        balance: 1890.75,
        joined: "2025-04-03",
        favoriteGames: [],
        role: "user"
      },
      {
        id: "USR-1003",
        name: "Robert Johnson",
        email: "robert.johnson@example.com",
        status: "Inactive",
        balance: 0.00,
        joined: "2025-03-28",
        favoriteGames: ["6", "10"],
        role: "user"
      },
      {
        id: "admin1",
        name: "Administrator",
        email: "admin@example.com",
        status: "Active",
        balance: 9999.00,
        joined: "2025-03-01",
        favoriteGames: [],
        role: "admin"
      }
    ];
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }
  
  // Initialize mock user accounts for login
  if (!localStorage.getItem('mockUsers')) {
    const mockUsers = [
      {
        id: "user1",
        username: "demo_user",
        name: "Demo User",
        email: "demo@example.com",
        password: "password123",
        balance: 1000,
        isVerified: true,
        vipLevel: 1,
        role: 'user',
        status: "Active",
        joined: "2025-04-01"
      },
      {
        id: "admin1",
        username: "admin",
        name: "Administrator",
        email: "admin@example.com",
        password: "admin",
        balance: 9999,
        isVerified: true,
        vipLevel: 10,
        role: 'admin',
        status: "Active",
        joined: "2025-03-01"
      }
    ];
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
  }
  
  // Initialize games
  if (!localStorage.getItem('games')) {
    localStorage.setItem('games', JSON.stringify(mockGames));
  }
  
  // Initialize transactions
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
  
  // Initialize game bets
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
  
  // Initialize game providers
  if (!localStorage.getItem('providers')) {
    const mockProviders = [
      {
        id: "prov-1",
        name: "Evolution Gaming",
        logo: "https://via.placeholder.com/100",
        gamesCount: 84,
        isActive: true
      },
      {
        id: "prov-2",
        name: "NetEnt",
        logo: "https://via.placeholder.com/100",
        gamesCount: 126,
        isActive: true
      },
      {
        id: "prov-3",
        name: "Pragmatic Play",
        logo: "https://via.placeholder.com/100",
        gamesCount: 218,
        isActive: true
      },
      {
        id: "prov-4",
        name: "Playtech",
        logo: "https://via.placeholder.com/100",
        gamesCount: 142,
        isActive: true
      },
      {
        id: "prov-5",
        name: "Microgaming",
        logo: "https://via.placeholder.com/100",
        gamesCount: 186,
        isActive: true
      }
    ];
    localStorage.setItem('providers', JSON.stringify(mockProviders));
  }
  
  console.log("Database initialized successfully");
};

// Sync a user between the auth system and the admin database
export const syncUser = (user: any) => {
  if (!user || !user.id) return;
  
  try {
    // Get admin database users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUserIndex = users.findIndex((u: User) => u.id === user.id);
    
    if (existingUserIndex === -1) {
      // User doesn't exist in admin database, add them
      const newUser = {
        id: user.id,
        name: user.username || user.name,
        email: user.email,
        status: 'Active',
        balance: user.balance || 0,
        joined: new Date().toISOString().split('T')[0],
        favoriteGames: [],
        role: user.role || 'user'
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      console.log("User synced to admin database:", newUser);
    } else {
      // Update existing user
      users[existingUserIndex] = {
        ...users[existingUserIndex],
        balance: user.balance,
        name: user.username || user.name,
        email: user.email,
        role: user.role || users[existingUserIndex].role
      };
      
      localStorage.setItem('users', JSON.stringify(users));
      console.log("User updated in admin database");
    }
  } catch (error) {
    console.error("Error syncing user:", error);
  }
};

// Update App.tsx to use this initializer
export const initializeDatabaseOnStartup = () => {
  initializeDatabase();
  
  // Sync current user if logged in
  const currentUser = JSON.parse(localStorage.getItem('thunderwin_user') || 'null');
  if (currentUser) {
    syncUser(currentUser);
  }
};

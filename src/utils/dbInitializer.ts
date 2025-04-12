
import { Game, User, Transaction, Promotion } from "@/types";
import mockGames from "@/data/mock-games";

export const initializeDatabase = () => {
  // Initialize games if they don't exist
  if (!localStorage.getItem('games')) {
    localStorage.setItem('games', JSON.stringify(mockGames));
    console.log('Games initialized with mock data');
  }

  // Initialize users if they don't exist
  if (!localStorage.getItem('users')) {
    const mockUsers: User[] = [
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
        email: "admin@example.com",
        password: "admin123", // This would be hashed in a real application
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
    console.log('Users initialized with mock data');
  }

  // Initialize promotions if they don't exist
  if (!localStorage.getItem('promotions')) {
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
    console.log('Promotions initialized with mock data');
  }

  // Initialize transactions if they don't exist
  if (!localStorage.getItem('transactions')) {
    const mockTransactions: Transaction[] = [];
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Generate some mock transactions for each user
    users.forEach((user: User) => {
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
    console.log('Transactions initialized with mock data');
  }
};

export default initializeDatabase;

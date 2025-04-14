
import { User } from "@/types";

const users: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@thunderwin.com",
    password: "admin", // Updated to match the admin demo credentials
    balance: 10000,
    isAdmin: true,
    vipLevel: 10,
    avatar: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    isVerified: true,
    name: "Admin User",
    status: "Active",
    joined: "2023-01-01",
    role: "admin",
  },
  {
    id: "2",
    username: "player1",
    email: "player1@example.com",
    password: "player123",
    balance: 500,
    isAdmin: false,
    vipLevel: 2,
    avatar: "/placeholder.svg",
    isVerified: true,
    name: "Regular Player",
    status: "Active",
    joined: "2023-02-15",
    role: "user",
  },
  {
    id: "3",
    username: "newuser",
    email: "newuser@example.com",
    password: "newuser123",
    balance: 50,
    isAdmin: false,
    vipLevel: 0,
    avatar: "/placeholder.svg",
    isVerified: false,
    name: "New User",
    status: "Pending",
    joined: "2023-04-10",
    role: "user",
  },
  {
    id: "4",
    username: "demouser",
    email: "demo@example.com",
    password: "password123",
    balance: 1000,
    isAdmin: false,
    vipLevel: 3,
    avatar: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    isVerified: true,
    name: "Demo User",
    status: "Active",
    joined: "2023-03-01",
    role: "user",
  }
];

// Initialize the default admin account for the security page
const initialAdminAccounts = [
  {
    username: "admin",
    email: "admin@thunderwin.com",
    password: "admin",
    role: "Super Admin",
    lastLogin: new Date().toISOString(),
    twoFactorEnabled: false
  }
];

// Initial transaction data
const initialTransactions = [
  {
    id: "TX-1001",
    userId: "4",
    type: "deposit",
    method: "Credit Card",
    amount: 1000,
    currency: "EUR",
    status: "completed",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
  },
  {
    id: "TX-1002",
    userId: "2",
    type: "deposit",
    method: "Bank Transfer",
    amount: 500,
    currency: "EUR",
    status: "completed",
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
  },
  {
    id: "TX-1003",
    userId: "4",
    type: "withdrawal",
    method: "Bank Transfer",
    amount: 200,
    currency: "EUR",
    status: "completed",
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString() // 1 day ago
  }
];

// Import mockGames as a default import if needed
import mockGames from "@/data/mock-games";

const initializeDatabase = () => {
  try {
    // Initialize users
    if (!localStorage.getItem("users")) {
      localStorage.setItem("users", JSON.stringify(users));
    }

    // Initialize mockUsers for authentication
    if (!localStorage.getItem("mockUsers")) {
      localStorage.setItem("mockUsers", JSON.stringify(users));
    }

    // Initialize the admin accounts for the Security page
    if (!localStorage.getItem("adminAccounts")) {
      localStorage.setItem("adminAccounts", JSON.stringify(initialAdminAccounts));
    }

    // Initialize games
    if (!localStorage.getItem("games")) {
      localStorage.setItem("games", JSON.stringify(mockGames));
    }

    // Initialize transactions
    if (!localStorage.getItem("transactions")) {
      localStorage.setItem("transactions", JSON.stringify(initialTransactions));
    }
    
    // Initialize payment methods
    if (!localStorage.getItem("paymentMethods")) {
      localStorage.setItem("paymentMethods", JSON.stringify([
        { id: "card", name: "Credit Card", enabled: true, logo: "/payment/visa.svg" },
        { id: "bank", name: "Bank Transfer", enabled: true, logo: "/payment/bank.svg" },
        { id: "crypto", name: "Cryptocurrency", enabled: true, logo: "/payment/crypto.svg" },
        { id: "paypal", name: "PayPal", enabled: true, logo: "/payment/paypal.svg" }
      ]));
    }
    
    console.log("Browser database initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing browser database:", error);
    return false;
  }
};

export default initializeDatabase;

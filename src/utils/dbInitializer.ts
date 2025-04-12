import { User } from "@/types";

const users: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@thunderwin.com",
    password: "admin123", // This is now allowed by the User type
    balance: 10000,
    isAdmin: true,
    vipLevel: 10,
    avatar: "/placeholder.svg",
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
];

// Import mockGames as a default import if needed
import mockGames from "@/data/mock-games";

const initializeDatabase = () => {
  // Initialize users
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  // Initialize mockUsers for authentication
  if (!localStorage.getItem("mockUsers")) {
    localStorage.setItem("mockUsers", JSON.stringify(users));
  }

    // Initialize games
    if (!localStorage.getItem("games")) {
      localStorage.setItem("games", JSON.stringify(mockGames));
    }
};

export default initializeDatabase;

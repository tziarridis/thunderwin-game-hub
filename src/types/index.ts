
// Game Types
export interface Game {
  id: string;
  title: string;
  provider: string;
  category: string;
  image?: string;
  rtp: number;
  volatility: string;
  minBet: number;
  maxBet: number;
  isPopular: boolean;
  isNew: boolean;
  isFavorite: boolean;
  releaseDate: string;
  jackpot: boolean;
  description?: string;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  isAdmin?: boolean;
  avatar?: string;
  vipLevel?: number;
  createdAt?: string;
  lastLoginAt?: string;
  isVerified?: boolean;
  country?: string;
  fullName?: string;
  phoneNumber?: string;
}

// Transaction Types
export type TransactionType = "deposit" | "withdraw" | "bonus" | "bet" | "win";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt?: string;
  paymentMethod?: string;
  description?: string;
  gameId?: string;
}

// Bet Types
export interface Bet {
  id: string;
  userId: string;
  gameId: string;
  amount: number;
  winAmount: number | null;
  outcome: "win" | "loss" | "pending";
  timestamp: string;
}

// Promotion Types
export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  promotionType: "welcome" | "deposit" | "noDeposit" | "cashback" | "tournament";
  terms: string;
}

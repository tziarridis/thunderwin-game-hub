export interface Game {
  id: string;
  name: string;
  provider: string;
  category: string;
  image: string;
  rtp: number;
  volatility: string;
  minBet: number;
  maxBet: number;
  features: string[];
  tags: string[];
  isFavorite?: boolean;
  url?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  avatar?: string;
  vipLevel: number;
  isVerified: boolean;
  status: "Active" | "Pending" | "Inactive";
  joined: string;
  role: "admin" | "user";
  favoriteGames: string[];
  phone?: string;
  referralCode?: string;
  referredBy?: string;
  ipAddress?: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  avatarUrl?: string;
  vipLevel: number;
  isVerified: boolean;
}


export interface User {
  id: string;
  name?: string;
  username?: string;
  email: string;
  balance?: number;
  isAdmin?: boolean;
  avatarUrl?: string;
  vipLevel?: number;
  isVerified?: boolean;
  status?: "Active" | "Pending" | "Inactive";
  joined?: string;
  role?: "admin" | "user";
  favoriteGames?: string[];
  phone?: string;
  lastLogin?: string;
  createdAt?: string;
}

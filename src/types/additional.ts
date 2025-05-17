
import { Game } from "."; // Assuming Game type is in src/types/index.ts

export interface GameLaunchOptions {
  providerId?: string;
  mode?: 'real' | 'demo';
  playerId?: string;
  language?: string;
  currency?: string;
  platform?: "web" | "mobile";
  returnUrl?: string;
  // Add any other relevant options
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | string; // Allow for other types
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | string;
  date: string; // ISO date string
  gameId?: string;
  gameName?: string;
  provider?: string;
  description?: string;
  balance_before?: number;
  balance_after?: number;
  round_id?: string;
  session_id?: string;
}

export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  show_home?: boolean;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  games?: Game[]; // Optional: if you want to nest games under categories
}

export interface GameProvider {
    id: string;
    name: string;
    logo?: string;
    description?: string;
    status: 'active' | 'inactive';
    api_endpoint?: string;
    api_key?: string; // Sensitive, handle with care
    api_secret?: string; // Sensitive, handle with care
    created_at?: string;
    updated_at?: string;
}

// Extend existing Game type if isLive is a valid property
declare module "." {
  interface Game {
    isLive?: boolean;
  }
}



// Main data types for the casino application

export interface User {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Pending' | 'Inactive';
  balance: number;
  joined: string;
  favoriteGames?: string[];
  role?: 'user' | 'admin';  // Add role property
}

export interface Game {
  id: string;
  title: string;
  image: string;
  provider: string;
  category: 'slots' | 'live' | 'table' | 'crash' | 'jackpot';
  isPopular?: boolean;
  isNew?: boolean;
  rtp: number;
  minBet: number;
  maxBet: number;
  volatility: 'Low' | 'Medium' | 'High';
  releaseDate: string;
  description?: string;
  features?: string[];
  isFavorite?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  method: string;
  date: string;
  gameId?: string;
  gameName?: string;
}

export interface GameBet {
  id: string;
  gameId: string;
  userId: string;
  amount: number;
  result: 'win' | 'loss';
  winAmount: number;
  date: string;
}

// Game provider integration interface
export interface GameProvider {
  id: string;
  name: string;
  logo: string;
  gamesCount: number;
  isActive: boolean;
}

// Database schemas (simulated for LocalStorage)
export interface DatabaseSchemas {
  users: User[];
  games: Game[];
  transactions: Transaction[];
  bets: GameBet[];
  providers: GameProvider[];
}

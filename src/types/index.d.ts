
export * from './user';
export * from './game';
export * from './transaction';
export * from './wallet';
export * from './affiliate';
export * from './promotion';
export * from './kyc';
export * from './vip'; // Added VIP export
export * from './bonus'; // Added Bonus export

// General API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

// LoadingStatus
export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

// DisplayGame can extend the Game from game.ts if needed
export interface DisplayGame extends Game { // Game is now imported from './game'
  isFavorite?: boolean; 
}

// WalletType to be used in AppHeader (ensure this is defined or imported if used)
export interface WalletType {
  id: string; // Added from AppHeader's WalletState
  userId: string; // Added from AppHeader's WalletState
  balance: number;
  currency: string;
  symbol: string; // Added from AppHeader's WalletState
  vipLevel: number;
  vipPoints: number;
  bonusBalance: number; // Added from AppHeader's WalletState
  cryptoBalance: number; // Added from AppHeader's WalletState
  demoBalance: number; // Added from AppHeader's WalletState
  isActive: boolean; // Added from AppHeader's WalletState
  lastTransactionDate: Date | null; // Added from AppHeader's WalletState
  hide_balance: boolean; // Added from AppHeader's WalletState
  active: boolean; // Added from AppHeader's WalletState
  total_bet: number; // Added from AppHeader's WalletState
  total_won: number; // Added from AppHeader's WalletState
  total_lose: number; // Added from AppHeader's WalletState
  user_id: string; // Added from AppHeader's WalletState
}

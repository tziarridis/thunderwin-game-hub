

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

// WalletType has been moved to src/types/wallet.ts
// Ensure components import it from there or via re-export from src/types/index.ts


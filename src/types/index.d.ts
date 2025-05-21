
export * from './user';
export * from './game'; // Game type, DbGame, GameLaunchOptions are now primarily defined and exported from game.ts
export * from './transaction'; // Ensure this exports TransactionStatus from transaction.ts
export * from './wallet';
export * from './affiliate';
export * from './promotion';
export * from './kyc'; // Added KYC export

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

// The WalletType interface that was here has been removed.
// Components should use the main Wallet type from src/types/wallet.ts

// The DbGame interface that was here is removed.
// The authoritative DbGame is in src/types/game.ts and re-exported via `export * from './game';`


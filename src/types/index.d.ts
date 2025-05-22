
export * from './user';
export * from './game';
export * from './transaction';
export * from './wallet'; // WalletType will be exported from here
export * from './affiliate';
export * from './promotion';
export * from './kyc'; // KycStatus, KycDocumentTypeEnum will be exported from here
export * from './vip';
export * from './bonus'; // Bonus will be exported from here

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

// WalletType is exported from src/types/wallet.ts and re-exported above.
// KycStatus, KycDocumentTypeEnum from src/types/kyc.ts
// Bonus from src/types/bonus.ts


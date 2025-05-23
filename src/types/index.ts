
// src/types/index.ts

// Re-export all types from game.ts
export * from './game';

// Re-export all types from kyc.ts
export * from './kyc';

// Re-export all types from affiliate.ts
export * from './affiliate';

// Re-export types from user.ts.
export type { 
  UserProfile, 
  User, // Ensure 'User' is exported as 'User'
  AppUser, // Export AppUser
  UserSettings,
  LoginCredentials,
  RegisterCredentials,
  UserRole,
  DisplayUser,
  SupabaseAuthUser
} from './user';


// Re-export types AND enums from promotion.ts
export * from './promotion';

// Re-export types AND enums from bonus.ts
export * from './bonus'; // Add this line

// Add any other general types here if they don't fit elsewhere,
// or re-export from other specific type files.

// Example of a truly shared/generic type if needed:
// export interface AppConfig {
//   theme: 'dark' | 'light';
// }

// Define Transaction type if not defined elsewhere, or re-export
// This is a basic example, adjust based on your actual transaction data model
export interface Transaction {
  id: string;
  user_id: string; // Make sure this exists if used in PPTransactions
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'adjustment';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  provider?: string; // e.g., 'stripe', 'paypal', 'game_provider_slug'
  description?: string;
  reference_id?: string; // External transaction ID
  game_id?: string;
  round_id?: string;
  created_at: string;
  updated_at: string;
  // Add any other fields like payment_method, fee, etc.
}


// Re-export all types from game.ts
export * from './game';

// Re-export all types from kyc.ts
export * from './kyc';

// Re-export all types from affiliate.ts
export * from './affiliate';

// Re-export types from user.ts.
export type { 
  UserProfile, 
  User,
  AppUser,
  UserSettings,
  LoginCredentials,
  RegisterCredentials,
  DisplayUser,
  SupabaseAuthUser
} from './user';

// Re-export UserRole enum
export { UserRole } from './user';

// Re-export types AND enums from promotion.ts
export * from './promotion';

// Re-export types AND enums from bonus.ts
export * from './bonus';

// Re-export VIP types
export * from './vip';

// Re-export wallet types
export * from './wallet';

// Define Transaction type with all required fields
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'adjustment' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'approved' | 'rejected' | 'processing';
  created_at: string;
  updated_at: string;
  provider_transaction_id?: string;
  provider?: string;
  description?: string;
  game_id?: string;
  round_id?: string;
  date?: string; // For backward compatibility
  player_id?: string; // For backward compatibility
}

// Export DateRange type
export interface DateRange {
  from?: Date;
  to?: Date;
}

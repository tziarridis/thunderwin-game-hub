
// Create this file if it doesn't exist, or update it.
// This defines the Transaction type based on Supabase schema.

export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund' | string;
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | string;

export interface Transaction {
  id: string; // uuid
  player_id: string; // Corresponds to user_id in your app, but is 'player_id' in 'transactions' table
  amount: number; // numeric
  currency: string;
  type: TransactionType; // string for flexibility
  status: TransactionStatus;
  provider?: string | null; // e.g., 'stripe', 'paypal', game provider for bet/win
  provider_transaction_id?: string | null; // Added from MetaMaskDeposit usage
  game_id?: string | null;
  round_id?: string | null;
  session_id?: string | null;
  balance_before?: number | null;
  balance_after?: number | null;
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
  metadata?: Record<string, any> | null; // Added from MetaMaskDeposit usage
}


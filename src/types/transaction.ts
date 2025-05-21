// Create this file if it doesn't exist, or update it.
// This defines the Transaction type based on Supabase schema.

export interface Transaction {
  id: string; // uuid
  player_id: string; // Corresponds to user_id in your app, but is 'player_id' in 'transactions' table
  amount: number; // numeric
  currency: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund' | string; // string for flexibility
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | string;
  provider?: string | null; // e.g., 'stripe', 'paypal', game provider for bet/win
  game_id?: string | null;
  round_id?: string | null;
  session_id?: string | null;
  balance_before?: number | null;
  balance_after?: number | null;
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
  // Any other relevant fields like metadata, payment_method, etc.
  // user_id?: string; // If you decide to add this to the transactions table later
}

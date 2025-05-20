
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'approved' | 'rejected';
export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'adjustment' | 'refund';

// This type should align with your `transactions` table in Supabase
export interface Transaction {
  id: string; // UUID
  user_id: string; // Foreign key to your public 'users' table (or 'profiles')
  player_id?: string; // Alternative if you use 'player_id' from a game provider context
  amount: number;
  currency: string; // e.g., 'USD', 'EUR', 'ETH'
  type: TransactionType;
  status: TransactionStatus;
  provider?: string; // e.g., 'Stripe', 'MetaMask', 'GameProviderName'
  game_id?: string; // If transaction is related to a specific game
  gameName?: string; // Denormalized game name for easier display
  round_id?: string; // For game transactions
  balance_before?: number;
  balance_after?: number;
  payment_method_details?: any; // JSONB for payment provider specifics
  notes?: string; // Admin notes or transaction details
  created_at: string | Date; // ISO string or Date object
  updated_at: string | Date; // ISO string or Date object
  metadata?: Record<string, any>; // For any other custom data
}

// For creating a new transaction, some fields are optional or auto-generated
export type NewTransactionData = Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'balance_before' | 'balance_after'> & {
  balance_before?: number;
  balance_after?: number;
};

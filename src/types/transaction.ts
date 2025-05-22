
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'expired' | 'refunded';
export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'adjustment' | 'commission' | 'jackpot_win' | 'tournament_win';

export interface Transaction {
  id: string; // UUID or unique transaction ID
  player_id: string; // Corresponds to User ID
  created_at: string; // ISO Date string
  updated_at: string; // ISO Date string
  type: TransactionType;
  amount: number;
  currency: string; // e.g., 'USD', 'EUR', 'BTC'
  status: TransactionStatus;
  
  // Optional fields depending on transaction type
  provider?: string; // e.g., 'stripe', 'paypal', 'game_provider_slug', 'system'
  provider_transaction_id?: string | null; // ID from external payment provider
  
  game_id?: string | null; // Slug or ID of the game related to bet/win
  round_id?: string | null; // Specific game round ID
  
  balance_before?: number | null;
  balance_after?: number | null;
  
  description?: string | null; // User-friendly description or admin notes
  metadata?: Record<string, any> | null; // For any other specific data
  
  // Fields for deposits/withdrawals
  payment_method?: string | null; // e.g., 'credit_card', 'bitcoin_address'
  fee?: number | null;
  
  // Fields for related transactions (e.g. refund original tx)
  related_transaction_id?: string | null; 
}

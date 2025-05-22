
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'approved' | 'rejected';
export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund' | 'adjustment'; // Added 'adjustment'

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  currency: string;
  provider: string; // general provider (e.g. payment gateway, game provider)
  provider_transaction_id?: string; // ID from the external provider
  game_id?: string;
  round_id?: string;
  session_id?: string;
  player_id: string; // This should be user_id from your users table
  balance_before?: number;
  balance_after?: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  notes?: string; // Admin notes, was in ExtendedTransaction
}


export type TransactionType = 
  | 'deposit' 
  | 'withdrawal' 
  | 'bet' 
  | 'win' 
  | 'bonus_credit' 
  | 'bonus_debit'
  | 'commission'
  | 'refund'
  | 'adjustment_credit'
  | 'adjustment_debit'
  | 'tournament_buy_in'
  | 'tournament_payout';

export const TRANSACTION_TYPES_ARRAY: TransactionType[] = [
  'deposit', 'withdrawal', 'bet', 'win', 'bonus_credit', 'bonus_debit', 
  'commission', 'refund', 'adjustment_credit', 'adjustment_debit',
  'tournament_buy_in', 'tournament_payout'
];

export type TransactionStatus = 
  | 'pending' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'requires_action'
  | 'processing'
  | 'refunded';

export const TRANSACTION_STATUS_ARRAY: TransactionStatus[] = [
  'pending', 'completed', 'failed', 'cancelled', 'requires_action', 'processing', 'refunded'
];

export interface Transaction {
  id: string;
  user_id: string; // Standardize to user_id
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  provider?: string; // e.g., 'stripe', 'metamask', 'game_provider_x'
  provider_transaction_id?: string; // ID from the external provider
  game_id?: string; // If related to a game
  round_id?: string; // If related to a game round
  session_id?: string; // If related to a game session
  description?: string; // Optional details
  balance_before?: number; // User balance before this transaction
  balance_after?: number; // User balance after this transaction
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  metadata?: Record<string, any>; // For any additional provider-specific data
}

export interface TransactionFilters {
  user_id?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  minAmount?: number;
  maxAmount?: number;
  provider?: string;
  game_id?: string;
  page?: number;
  limit?: number;
}

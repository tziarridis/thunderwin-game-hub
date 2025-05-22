
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing' | 'requires_action';
export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund' | 'adjustment' | 'fee';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'crypto' | 'paypal' | 'skrill' | 'neteller' | 'internal';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string; // e.g., 'USD', 'EUR', 'BTC'
  type: TransactionType;
  status: TransactionStatus;
  payment_method?: PaymentMethod; // Optional, relevant for deposits/withdrawals
  provider_transaction_id?: string; // External ID from payment gateway or game provider
  description?: string; // Optional, more details about the transaction
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  
  // Optional game-related fields (for bet/win transactions)
  game_id?: string;
  round_id?: string;
  
  // Optional bonus-related fields
  bonus_id?: string;

  // Metadata for additional details
  metadata?: Record<string, any>;

  // For display purposes, user object might be joined
  user?: { // Simplified user object for display
    username?: string;
    email?: string;
  };
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

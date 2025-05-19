
export interface Wallet {
  id?: string;
  user_id?: string;
  balance: number;
  currency: string;
  bonus_balance?: number;
  demo_balance?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
  total_bets?: number;
  total_wins?: number;
  vipLevel?: number;
  vipPoints?: number;
  transactions?: WalletTransaction[];
  symbol?: string;
  wagering_requirement?: number;
}

export interface WalletTransaction {
  id?: string;
  wallet_id?: string;
  user_id?: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  created_at?: Date | string;
  updated_at?: Date | string;
  game_id?: string;
  game_name?: string;
  provider?: string;
  provider_transaction_id?: string;
  balance_before?: number;
  balance_after?: number;
  currency?: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund' | 'adjustment';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface WalletSummary {
  balance: number;
  bonus_balance: number;
  currency: string;
  symbol: string;
}

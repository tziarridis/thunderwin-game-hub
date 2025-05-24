
export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'adjustment' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'approved' | 'rejected' | 'processing';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  provider?: string;
  provider_transaction_id?: string;
  game_id?: string;
  round_id?: string;
  date: string;
  created_at: string;
  updated_at: string;
  player_id?: string;
}

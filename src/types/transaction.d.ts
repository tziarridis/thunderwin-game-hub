
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'approved' | 'rejected';
export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund' | 'adjustment';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  currency: string;
  provider: string;
  game_id?: string;
  round_id?: string;
  session_id?: string;
  player_id: string;
  balance_before?: number;
  balance_after?: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

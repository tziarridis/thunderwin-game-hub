
export interface Transaction {
  id: string;
  player_id: string;
  session_id?: string;
  game_id?: string;
  round_id?: string;
  provider: string;
  type: 'bet' | 'win' | 'deposit' | 'withdraw';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  balance_before?: number;
  balance_after?: number;
  created_at: string;
  updated_at: string;
  
  // Additional properties for UI components
  transactionId?: string;
  userId?: string;
  userName?: string; // For displaying user's name
  gameId?: string;
  roundId?: string;
  timestamp?: string;
  date?: string; // For date display
  method?: string; // For payment method display
}

export interface TransactionFilter {
  player_id?: string;
  provider?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface TransactionQueryOptions {
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface CreateTransactionParams {
  playerId: string;
  type: 'bet' | 'win' | 'deposit' | 'withdraw';
  amount: number;
  currency: string;
  provider: string;
  sessionId?: string;
  gameId?: string;
  roundId?: string;
  balanceBefore?: number;
  balanceAfter?: number;
}

export type UpdateTransactionStatusParams = {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  balanceAfter?: number;
};

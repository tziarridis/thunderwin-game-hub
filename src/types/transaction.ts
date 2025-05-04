
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus';
  status: 'pending' | 'completed' | 'failed';
  date: string;
  provider?: string;
  gameId?: string;
  roundId?: string;
  description?: string;
  paymentMethod?: string;
  bonusId?: string;
  referenceId?: string;
}

// Interface for transaction filters
export interface TransactionFilter {
  player_id?: string;
  type?: string;
  status?: string;
  provider?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

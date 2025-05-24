
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  BET = 'bet',
  WIN = 'win',
  BONUS = 'bonus',
  REFUND = 'refund'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description?: string;
  reference?: string;
  provider?: string;
  method?: string;
  created_at: string;
  updated_at: string;
  
  // Additional properties used by components
  balance_before?: number;
  balance_after?: number;
  metadata?: Record<string, any>;
  external_id?: string;
  fee?: number;
  processed_at?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  totalBets: number;
  totalWins: number;
  netAmount: number;
  transactionCount: number;
}

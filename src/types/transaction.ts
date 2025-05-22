export interface Transaction {
  id: string; // uuid
  amount: number; // numeric
  balance_before?: number | null; // numeric
  balance_after?: number | null; // numeric
  created_at: string; // timestamp with time zone
  updated_at?: string | null; // timestamp with time zone
  player_id: string; // character varying, likely user_id
  session_id?: string | null; // character varying
  game_id?: string | null; // character varying
  round_id?: string | null; // character varying
  provider: string; // character varying
  type: string; // character varying (e.g., 'bet', 'win', 'deposit', 'withdrawal')
  currency: string; // character varying
  status: string; // character varying (e.g., 'pending', 'completed', 'failed')
  
  // Optional transformed fields if needed by UI, but prefer to keep type close to DB
  // date?: string; // Often a formatted version of created_at
  // user_id?: string; // If player_id is not the user_id directly
  description?: string; // For UI display, might be constructed
}

// Enum for transaction types, if you want to enforce specific values
export enum TransactionTypeEnum {
  DEPOSIT = "deposit",
  WITHDRAWAL = "withdrawal",
  BET = "bet",
  WIN = "win",
  BONUS = "bonus",
  REFUND = "refund",
  ADJUSTMENT = "adjustment",
}
export type TransactionType = `${TransactionTypeEnum}`;
export const AllTransactionTypes = Object.values(TransactionTypeEnum);

// Enum for transaction statuses
export enum TransactionStatusEnum {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  PROCESSING = "processing",
}
export type TransactionStatus = `${TransactionStatusEnum}`;
export const AllTransactionStatuses = Object.values(TransactionStatusEnum);

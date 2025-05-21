
// This file might already contain other transaction-related types.
// We are adding/ensuring TransactionStatus is defined and exported.

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing' | 'approved' | 'rejected';

export interface Transaction {
  id: string;
  player_id: string; // Changed from user_id to player_id
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund';
  amount: number;
  currency: string;
  status: TransactionStatus;
  provider_transaction_id?: string;
  game_id?: string;
  round_id?: string; // Added round_id
  provider?: string; // Added provider
  created_at: string;
  updated_at: string;
  description?: string;
  balance_before?: number;
  balance_after?: number;
}

// Example: If you have specific deposit or withdrawal types
export interface DepositTransaction extends Transaction {
  type: 'deposit';
  payment_method?: string;
}

export interface WithdrawalTransaction extends Transaction {
  type: 'withdrawal';
  payout_address?: string;
}

export type TransactionType = Transaction['type']; // Added for MetaMaskDeposit compatibility

// Re-export anything from transaction.d.ts if needed and not conflicting
// export * from './transaction.d'; // Be cautious with this if transaction.d.ts also defines TransactionStatus

// Assuming other wallet related types might be here, or can be added.

export interface Wallet {
  id: string;
  user_id: string; 
  balance: number;
  currency: string;
  symbol?: string;
  vip_level?: number;
  vip_points?: number;
  balance_bonus?: number;
  balance_cryptocurrency?: number;
  balance_demo?: number;
  active?: boolean;
  last_transaction_date?: Date | string | null; 
  hide_balance?: boolean;
  total_bet?: number;
  total_won?: number;
  total_lose?: number;
  // Add other existing fields from your DB or app logic
}

// Moved WalletType from index.d.ts to here for proper export
export interface WalletType {
  id: string; 
  userId: string; // Note: often user_id in DB, ensure mapping if needed
  balance: number;
  currency: string;
  symbol: string; 
  vipLevel: number;
  vipPoints: number;
  bonusBalance: number; 
  cryptoBalance: number; 
  demoBalance: number; 
  isActive: boolean; 
  lastTransactionDate: Date | null; 
  hide_balance: boolean; 
  active: boolean; 
  total_bet: number; 
  total_won: number; 
  total_lose: number; 
  user_id: string; 
}

// You might also have other wallet-related types like:
export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  // ... other transaction details
}

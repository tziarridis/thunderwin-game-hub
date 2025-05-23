
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
}

// WalletType used in MobileWalletSummary component
export interface WalletType {
  id: string; 
  userId: string;
  user_id: string;
  balance: number;
  currency: string;
  symbol: string; 
  vipLevel: number;
  vipPoints?: number;
  bonusBalance?: number; 
  cryptoBalance?: number; 
  demoBalance?: number; 
  isActive: boolean; 
  lastTransactionDate?: Date; 
  hide_balance: boolean; 
  total_bet: number; 
  total_won: number; 
  total_lose: number; 
}

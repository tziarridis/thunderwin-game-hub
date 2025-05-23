
export interface WalletType {
  id: string;
  user_id?: string;
  userId?: string;
  balance: number;
  currency: string;
  symbol: string;
  vipLevel?: number;
  vipPoints?: number;
  bonusBalance?: number;
  cryptoBalance?: number;
  demoBalance?: number;
  isActive?: boolean;
  lastTransactionDate?: Date;
  hide_balance?: boolean;
  total_bet?: number;
  total_won?: number;
  total_lose?: number;
}

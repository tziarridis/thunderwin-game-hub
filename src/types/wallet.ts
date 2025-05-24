
export interface WalletType {
  id: string;
  userId: string;
  user_id: string;
  balance: number;
  currency: string;
  symbol: string;
  vipLevel?: number;
  vipPoints?: number;
  bonusBalance?: number;
  cryptoBalance?: number;
  demoBalance?: number;
  isActive: boolean;
  lastTransactionDate?: Date;
  hide_balance?: boolean;
  total_bet?: number;
  total_won?: number;
  total_lose?: number;
}

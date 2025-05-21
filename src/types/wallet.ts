
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  symbol: string;
  vipLevel?: number;
  vipPoints?: number;
  bonusBalance?: number;
  cryptoBalance?: number;
  demoBalance?: number;
  isActive?: boolean;
  lastTransactionDate?: Date | null;
}


export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  symbol: string;
  vipLevel: number;
  bonusBalance: number;
  cryptoBalance: number;
  demoBalance: number;
  isActive: boolean;
}

export interface WalletResponse {
  data: {
    id: string;
    user_id: string;
    balance: number;
    currency: string;
    symbol: string;
    vip_level: number;
    balance_bonus: number;
    balance_cryptocurrency: number;
    balance_demo: number;
    active: boolean;
    [key: string]: any;
  };
  error: any;
}

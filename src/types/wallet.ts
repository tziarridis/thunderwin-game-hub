
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

export interface WalletTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  gameId?: string;
  gameName?: string;
  provider?: string;
}

export interface WalletFilter {
  type?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  logo: string;
  minAmount: number;
  maxAmount: number;
  fee: number | string;
  processingTime: string;
  currency: string[];
  isActive: boolean;
}

export interface WalletResponse {
  data: any;
  error: any;
}

export interface WalletDeposit {
  userId: string;
  amount: number;
  method: string;
  currency: string;
  status: string;
  transactionId?: string;
}

export interface WalletWithdrawal {
  userId: string;
  amount: number;
  method: string;
  currency: string;
  status: string;
  address?: string;
  transactionId?: string;
}

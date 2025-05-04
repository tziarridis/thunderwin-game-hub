export interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  description?: string;
  paymentMethod?: string;
  gameId?: string;
  bonusId?: string;
  balance?: number;
  referenceId?: string;
}

export enum BonusType {
  WELCOME = "WELCOME",
  DEPOSIT = "DEPOSIT",
  RELOAD = "RELOAD",
  CASHBACK = "CASHBACK",
  FREE_SPINS = "FREE_SPINS",
  VIP = "VIP",
  REFERRAL = "REFERRAL"
}

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  E_WALLET = "E_WALLET",
  CRYPTO = "CRYPTO",
  PREPAID_CARD = "PREPAID_CARD"
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  endDate: string;
  category: string;
  isActive: boolean;
  terms?: string;
}

export interface AnalyticsData {
  revenue: number;
  activeUsers: number;
  newRegistrations: number;
  conversionRate: number;
  transactions: number;
  averageBet: number;
  retention: number;
  churnRate: number;
}

export interface AnalyticsTimeframe {
  day: AnalyticsData[];
  week: AnalyticsData[];
  month: AnalyticsData[];
  year: AnalyticsData[];
}

export interface GameAnalytics {
  gameId: string;
  gameName: string;
  provider: string;
  totalBets: number;
  totalWins: number;
  netGamingRevenue: number;
  playerCount: number;
  averageBet: number;
  rtp: number;
}


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

export interface AnalyticsData {
  date: string;
  revenue: number;
  activeUsers: number;
  newUsers: number;
  deposits: number;
  withdrawals: number;
  bets: number;
  wins: number;
  totalUsers?: number;
}

export interface GameAnalytics {
  gameName: string;
  totalBets: number;
  totalWins: number;
  uniquePlayers: number;
  avgBetSize: number;
  profitMargin: number;
}

export interface UserBonus {
  id: string;
  userId: string;
  bonusId: string;
  status: 'active' | 'used' | 'expired';
  dateIssued: string;
  expiryDate: string;
  amount: number;
  wageringRequirement: number;
  wageringCompleted: number;
  type: string;
}

export interface BonusTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  value: number;
  minDeposit: number;
  wageringRequirement: number;
  durationDays: number;
  forVipLevels: number[];
  isActive: boolean;
}

export type BonusType = 'deposit' | 'free_spins' | 'cashback' | 'loyalty' | 'welcome';

export interface MetaMaskDepositProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

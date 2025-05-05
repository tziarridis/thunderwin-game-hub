
export type BonusType = 'deposit' | 'free_spins' | 'cashback' | 'loyalty' | 'welcome';

export interface UserBonus {
  id: string;
  userId: string;
  bonusId: string;
  type: BonusType;
  amount: number;
  status: 'active' | 'used' | 'expired';
  dateIssued: string;
  expiryDate: string;
  wageringRequirement: number;
  wageringCompleted: number;
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

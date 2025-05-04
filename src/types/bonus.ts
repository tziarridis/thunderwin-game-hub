
export type BonusType = 'deposit' | 'free_spins' | 'cashback' | 'loyalty' | 'welcome';

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

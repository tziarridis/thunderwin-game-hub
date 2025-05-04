
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

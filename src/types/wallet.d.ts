
export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  symbol: string;
  active: boolean;
  vip_level: number;
  vip_points: number;
  created_at: string;
  updated_at: string;
  total_bet?: number;
  total_won?: number;
  total_lose?: number;
  balance_bonus?: number;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  provider: string;
  game_id: string;
  round_id: string;
  description?: string;
  payment_method?: string;
  bonus_id?: string;
  reference_id?: string;
}

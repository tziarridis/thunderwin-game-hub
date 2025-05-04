
export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  symbol: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
  balance_bonus?: number;
  total_won?: number;
  total_bet?: number;
  total_lose?: number;
  vip_level: number | null;
  vip_points?: number | null;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  provider?: string;
  game_id?: string;
  round_id?: string;
  description?: string;
  payment_method?: string;
  bonus_id?: string;
  reference_id?: string;
}

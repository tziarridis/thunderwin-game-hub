
export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  balance_bonus?: number;
  balance_bonus_rollover?: number;
  balance_deposit_rollover?: number;
  balance_withdrawal?: number;
  balance_cryptocurrency?: number;
  balance_demo?: number;
  hide_balance: boolean;
  active: boolean;
  total_bet: number;
  total_won: number;
  total_lose: number;
  vipLevel?: number;
  vipPoints?: number;
  currency: string;
  symbol?: string;
  vip_level?: number;
  vip_points?: number;
  created_at?: string;
  updated_at?: string;
  deposit_limit_daily?: number;
  deposit_limit_weekly?: number;
  deposit_limit_monthly?: number;
  exclusion_until?: string | null;
  time_reminder_enabled?: boolean;
  reminder_interval_minutes?: number;
  exclusion_period?: string;
}

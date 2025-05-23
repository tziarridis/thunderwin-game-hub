
export interface VipLevel {
  id: string;
  level: number;
  name: string;
  points_required: number;
  cashback_rate: number;
  weekly_bonus: number;
  monthly_bonus: number;
  birthday_bonus: number;
  personal_manager: boolean;
  withdrawal_limit: number;
  icon?: string;
  created_at: string;
  updated_at: string;
  required_points?: number;
  benefits?: VipBenefit[];
}

export interface VipProgression {
  user_id: string;
  current_level: number;
  current_level_name: string;
  points: number;
  points_to_next_level: number;
  next_level: number;
  next_level_name: string;
  progress_percentage: number;
}

export interface VipBenefit {
  id: string;
  name: string;
  description: string;
  icon: string;
  vip_level_id: string;
}

// Type alias for backward compatibility
export type VIPLevel = VipLevel;


export interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  terms_conditions?: string;
  bonus_amount?: number;
  bonus_percent?: number;
  min_deposit?: number;
  wagering_requirement?: number;
  max_bonus?: number;
  game_restrictions?: string[];
  user_groups?: string[];
}

export interface PromotionResponse {
  data: Promotion[];
  count: number;
}

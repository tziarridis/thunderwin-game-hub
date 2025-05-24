
export enum PromotionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  DRAFT = 'draft',
  PENDING = 'pending'
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  status: PromotionStatus;
  type: string;
  value: number;
  currency?: string;
  min_deposit?: number;
  max_bonus?: number;
  wagering_requirement?: number;
  valid_from: string;
  valid_until: string;
  terms_conditions?: string;
  image_url?: string;
  banner_url?: string;
  created_at: string;
  updated_at: string;
  is_featured?: boolean;
  target_audience?: string;
  promo_code?: string;
  usage_limit?: number;
  used_count?: number;
}

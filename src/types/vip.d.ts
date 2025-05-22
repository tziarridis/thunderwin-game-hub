
export interface VipLevel {
  id: string | number; // Use string if UUID, number if auto-increment
  level: number;
  name: string;
  min_points: number;
  cashback_percentage?: number | null;
  bonus_percentage?: number | null;
  benefits_description?: string | null;
  created_at?: string;
  updated_at?: string;
}

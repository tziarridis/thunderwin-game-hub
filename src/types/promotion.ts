
export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  type?: 'bonus' | 'tournament' | 'free_spins' | 'cashback';
  terms?: string;
  isActive?: boolean;
  priority?: number; // For ordering
  tags?: string[];
  games?: string[]; // Array of game slugs or IDs related to the promotion
  wageringRequirement?: number;
  minDeposit?: number;
  maxBonusAmount?: number;
}

export interface PromotionBanner {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    mobileImageUrl?: string;
    linkUrl?: string;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    order?: number;
}


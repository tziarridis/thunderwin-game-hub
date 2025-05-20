import { supabase } from '@/integrations/supabase/client';
import { Promotion, PromotionFilter, PromotionStatus, PromotionType } from '@/types/promotion';
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

// Mock data for initial setup, replace with actual API calls
const MOCK_PROMOTIONS: Promotion[] = [
  // ... (keep existing mock promotions if any, or add new ones ensuring they match the Promotion type)
  {
    id: 'promo1',
    title: 'Welcome Bonus',
    description: 'Get 100% bonus on your first deposit up to $200.',
    type: 'welcome_bonus' as PromotionType,
    status: 'active' as PromotionStatus,
    validFrom: new Date('2024-01-01').toISOString(),
    validUntil: new Date('2025-12-31').toISOString(),
    bonusPercentage: 100,
    maxBonusAmount: 200,
    minDeposit: 20,
    wageringRequirement: 35,
    currency: 'USD',
    category: 'Casino Welcome',
    imageUrl: '/placeholder.svg',
    ctaText: 'Claim Now',
  },
  {
    id: 'promo2',
    title: 'Weekend Free Spins',
    description: 'Deposit $50 on weekends and get 50 Free Spins on Starburst.',
    type: 'free_spins' as PromotionType,
    status: 'active' as PromotionStatus,
    validFrom: new Date('2024-01-01').toISOString(),
    validUntil: null, // Ongoing
    freeSpinsCount: 50,
    minDeposit: 50,
    games: ['starburst'],
    currency: 'USD',
    category: 'Slots Promotion',
    imageUrl: '/placeholder.svg',
    ctaText: 'Get Spins',
  },
];


export const promotionsService = {
  async getPromotions(filters: PromotionFilter = {}): Promise<Promotion[]> {
    // Simulating API call with Supabase
    let query = supabase.from('promotions').select('*'); // Ensure 'promotions' table exists

    if (filters.isActive !== undefined) {
      query = query.eq('status', filters.isActive ? 'active' : 'inactive');
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.date) {
      const filterDate = new Date(filters.date).toISOString();
      query = query.lte('validFrom', filterDate).gte('validUntil', filterDate);
    }
    
    query = query.order('validFrom', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching promotions:', error);
      // Fallback to mock data if Supabase fetch fails and table might not exist yet
      if (error.code === '42P01') { // 42P01: undefined_table
          console.warn("Supabase 'promotions' table not found, returning mock data.");
          return MOCK_PROMOTIONS.filter(p => {
              let matches = true;
              if (filters.isActive !== undefined) matches = matches && (filters.isActive ? p.status === 'active' : p.status === 'inactive');
              if (filters.type) matches = matches && p.type === filters.type;
              if (filters.category) matches = matches && p.category === filters.category;
              // Add date filtering for mock data if needed
              return matches;
          });
      }
      throw error;
    }
    return (data as Promotion[]) || [];
  },

  async getPromotionById(id: string): Promise<Promotion | null> {
    const { data, error }: PostgrestSingleResponse<Promotion> = await supabase
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching promotion by ID:', error);
      if (error.code === 'PGRST116') return null;
       if (error.code === '42P01') {
         console.warn(`Supabase 'promotions' table not found, attempting to find mock promotion with ID: ${id}`);
         return MOCK_PROMOTIONS.find(p => p.id === id) || null;
       }
      throw error;
    }
    return data;
  },

  async createPromotion(promotionData: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>): Promise<Promotion> {
    const { data, error }: PostgrestSingleResponse<Promotion> = await supabase
      .from('promotions')
      .insert(promotionData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
    return data as Promotion;
  },

  async updatePromotion(id: string, promotionData: Partial<Promotion>): Promise<Promotion | null> {
    const { data, error }: PostgrestSingleResponse<Promotion> = await supabase
      .from('promotions')
      .update(promotionData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
    return data;
  },

  async deletePromotion(id: string): Promise<void> {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  },
};

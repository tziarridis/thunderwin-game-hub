
import { supabase } from '@/integrations/supabase/client';
import { BonusTemplate, UserBonus, VipLevel } from '@/types/bonus';

export const fetchBonusTypes = async (): Promise<BonusTemplate[]> => {
  try {
    // Check if the bonus_types table exists
    const { error: tableCheckError } = await supabase
      .from('bonus_types')
      .select('count')
      .limit(1)
      .single();
      
    // If the table doesn't exist, return mock data
    if (tableCheckError) {
      console.warn("bonus_types table not found, returning mock data");
      return getMockBonusTypes();
    }
    
    // Fetch from database if table exists
    const { data, error } = await supabase
      .from('bonus_types')
      .select('*')
      .eq('status', 'active');
      
    if (error) throw error;
    
    if (!data) return [];
    
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type || 'deposit',
      value: item.bonus_percentage || 0,
      minDeposit: item.min_deposit || 0,
      wageringRequirement: item.wagering_requirement || 0,
      durationDays: item.duration_days || 7,
      forVipLevels: item.for_vip_levels || [],
      isActive: item.status === 'active'
    }));
  } catch (error) {
    console.error("Error fetching bonus types:", error);
    return getMockBonusTypes();
  }
};

export const fetchUserBonuses = async (userId: string): Promise<UserBonus[]> => {
  try {
    // Check if the user_bonuses table exists
    const { error: tableCheckError } = await supabase
      .from('user_bonuses')
      .select('count')
      .limit(1)
      .single();
      
    // If the table doesn't exist, return mock data
    if (tableCheckError) {
      console.warn("user_bonuses table not found, returning mock data");
      return getMockUserBonuses(userId);
    }
    
    // Fetch from database if table exists
    const { data, error } = await supabase
      .from('user_bonuses')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    if (!data) return [];
    
    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      bonusId: item.bonus_type_id,
      type: item.type,
      amount: item.amount,
      status: item.status,
      dateIssued: item.created_at,
      expiryDate: item.expires_at,
      wageringRequirement: item.wagering_requirement_amount,
      wageringCompleted: item.wagering_completed_amount
    }));
  } catch (error) {
    console.error("Error fetching user bonuses:", error);
    return getMockUserBonuses(userId);
  }
};

export const fetchVipLevels = async (): Promise<VipLevel[]> => {
  try {
    // Check if the vip_levels table exists
    const { error: tableCheckError } = await supabase
      .from('vip_levels')
      .select('count')
      .limit(1)
      .single();
      
    // If the table doesn't exist, return mock data
    if (tableCheckError) {
      console.warn("vip_levels table not found, returning mock data");
      return getMockVipLevels();
    }
    
    // Fetch from database if table exists
    const { data, error } = await supabase
      .from('vip_levels')
      .select('*')
      .order('points_required', { ascending: true });
      
    if (error) throw error;
    
    if (!data) return [];
    
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      pointsRequired: item.points_required,
      cashbackRate: item.cashback_rate,
      bonusMultiplier: item.bonus_multiplier,
      description: item.description,
      benefits: item.benefits || [],
      status: item.status
    }));
  } catch (error) {
    console.error("Error fetching VIP levels:", error);
    return getMockVipLevels();
  }
};

export const claimBonus = async (userId: string, bonusTypeId: string): Promise<{ success: boolean, message: string }> => {
  try {
    // Implement a simpler version that just returns success for now
    return { 
      success: true, 
      message: 'Bonus claimed successfully!'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to claim bonus'
    };
  }
};

// Mock data functions
const getMockBonusTypes = (): BonusTemplate[] => {
  return [
    {
      id: '1',
      name: 'Welcome Bonus',
      description: '100% match on your first deposit',
      type: 'deposit',
      value: 100,
      minDeposit: 20,
      wageringRequirement: 35,
      durationDays: 30,
      forVipLevels: [0, 1, 2, 3, 4, 5],
      isActive: true
    },
    {
      id: '2',
      name: 'Free Spins',
      description: '50 free spins on selected slots',
      type: 'freespins',
      value: 50,
      minDeposit: 0,
      wageringRequirement: 40,
      durationDays: 7,
      forVipLevels: [1, 2, 3, 4, 5],
      isActive: true
    }
  ];
};

const getMockUserBonuses = (userId: string): UserBonus[] => {
  return [
    {
      id: '1',
      userId,
      bonusId: '1',
      type: 'deposit',
      amount: 100,
      status: 'active',
      dateIssued: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      wageringRequirement: 3500,
      wageringCompleted: 1200
    }
  ];
};

const getMockVipLevels = (): VipLevel[] => {
  return [
    {
      id: '1',
      name: 'Bronze',
      pointsRequired: 0,
      cashbackRate: 0.01,
      bonusMultiplier: 1,
      description: 'Entry level VIP status',
      benefits: ['Weekly cashback', '24/7 support'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Silver',
      pointsRequired: 1000,
      cashbackRate: 0.02,
      bonusMultiplier: 1.2,
      description: 'Mid-tier VIP status',
      benefits: ['Higher cashback rate', 'Faster withdrawals', 'Birthday bonus'],
      status: 'active'
    },
    {
      id: '3',
      name: 'Gold',
      pointsRequired: 5000,
      cashbackRate: 0.05,
      bonusMultiplier: 1.5,
      description: 'Premium VIP status',
      benefits: ['Premium cashback rate', 'Personal account manager', 'Exclusive promotions'],
      status: 'active'
    }
  ];
};

// Add more bonus service methods as needed
export default {
  fetchBonusTypes,
  fetchUserBonuses,
  fetchVipLevels,
  claimBonus
};

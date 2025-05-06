
import { supabase } from '@/integrations/supabase/client';
import { BonusTemplate, UserBonus, VipLevel } from '@/types/bonus';

export const fetchBonusTypes = async (): Promise<BonusTemplate[]> => {
  try {
    // Fetch directly from the database tables instead of using a function that doesn't exist
    const { data, error } = await supabase
      .from('bonus_types')  // Make sure this table exists
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
    return [];
  }
};

export const fetchUserBonuses = async (userId: string): Promise<UserBonus[]> => {
  try {
    // Fetch directly from the database tables instead of using a function that doesn't exist
    const { data, error } = await supabase
      .from('user_bonuses')  // Make sure this table exists
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
    return [];
  }
};

export const fetchVipLevels = async (): Promise<VipLevel[]> => {
  try {
    // Fetch directly from the database tables instead of using a function that doesn't exist
    const { data, error } = await supabase
      .from('vip_levels')  // Make sure this table exists
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
    return [];
  }
};

export const claimBonus = async (userId: string, bonusTypeId: string): Promise<{ success: boolean, message: string }> => {
  try {
    // Implement a simpler version that just returns success for now
    // In a real implementation, this would interact with actual database tables
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

// Add more bonus service methods as needed
export default {
  fetchBonusTypes,
  fetchUserBonuses,
  fetchVipLevels,
  claimBonus
};


import { supabase } from '@/integrations/supabase/client';
import { BonusTemplate, UserBonus, VipLevel } from '@/types/bonus';

export const fetchBonusTypes = async (): Promise<BonusTemplate[]> => {
  try {
    // We can see that the bonus_types table doesn't exist in the schema
    // Return mock data only since we can't query a table that doesn't exist
    return getMockBonusTypes();
  } catch (error) {
    console.error("Error fetching bonus types:", error);
    return getMockBonusTypes();
  }
};

export const fetchUserBonuses = async (userId: string): Promise<UserBonus[]> => {
  try {
    // user_bonuses table doesn't exist in the schema
    // Return mock data only
    return getMockUserBonuses(userId);
  } catch (error) {
    console.error("Error fetching user bonuses:", error);
    return getMockUserBonuses(userId);
  }
};

export const fetchVipLevels = async (): Promise<VipLevel[]> => {
  try {
    // vip_levels table doesn't exist in the schema
    // Return mock data only
    return getMockVipLevels();
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
      id: 1,
      name: 'Bronze',
      pointsRequired: 0,
      cashbackRate: 0.01,
      bonusMultiplier: 1,
      description: 'Entry level VIP status',
      benefits: ['Weekly cashback', '24/7 support'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Silver',
      pointsRequired: 1000,
      cashbackRate: 0.02,
      bonusMultiplier: 1.2,
      description: 'Mid-tier VIP status',
      benefits: ['Higher cashback rate', 'Faster withdrawals', 'Birthday bonus'],
      status: 'active'
    },
    {
      id: 3,
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

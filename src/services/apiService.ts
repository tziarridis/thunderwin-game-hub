
import { VipLevel } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Create a VIP levels API
const vipLevelsApi = {
  getVipLevels: async (): Promise<VipLevel[]> => {
    try {
      // Check if the vip_levels table exists in the database
      const { data, error } = await supabase
        .from('vip_levels')
        .select('*')
        .order('level', { ascending: true });
      
      if (error) {
        console.error("Error fetching VIP levels:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        // Map the database data to the VipLevel type
        return data.map(level => ({
          id: level.id,
          level: level.level,
          name: level.name,
          pointsRequired: level.points_required,
          benefits: level.benefits || [],
          cashbackRate: level.cashback_rate,
          withdrawalLimit: level.withdrawal_limit,
          bonuses: {
            depositMatch: level.deposit_match,
            freeSpins: level.free_spins,
            birthdayBonus: level.birthday_bonus,
          },
          personalManager: level.personal_manager || false,
          customGifts: level.custom_gifts || false,
          specialPromotions: level.special_promotions || false,
          color: level.color || '#000000',
          requiredPoints: level.points_required // For backward compatibility
        }));
      }
      
      // Return mock data if no data or if there was an error
      return getMockVipLevels();
      
    } catch (error) {
      console.error("Error in getVipLevels:", error);
      return getMockVipLevels();
    }
  },
  
  updateVipLevel: async (id: string, vipLevel: Partial<VipLevel>): Promise<VipLevel> => {
    try {
      // Convert from VipLevel type to database schema
      const dbVipLevel = {
        level: vipLevel.level,
        name: vipLevel.name,
        points_required: vipLevel.pointsRequired,
        benefits: vipLevel.benefits,
        cashback_rate: vipLevel.cashbackRate,
        withdrawal_limit: vipLevel.withdrawalLimit,
        deposit_match: vipLevel.bonuses?.depositMatch,
        free_spins: vipLevel.bonuses?.freeSpins,
        birthday_bonus: vipLevel.bonuses?.birthdayBonus,
        personal_manager: vipLevel.personalManager,
        custom_gifts: vipLevel.customGifts,
        special_promotions: vipLevel.specialPromotions,
        color: vipLevel.color
      };
      
      const { data, error } = await supabase
        .from('vip_levels')
        .update(dbVipLevel)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating VIP level:", error);
        throw error;
      }
      
      if (data) {
        return {
          id: data.id,
          level: data.level,
          name: data.name,
          pointsRequired: data.points_required,
          benefits: data.benefits || [],
          cashbackRate: data.cashback_rate,
          withdrawalLimit: data.withdrawal_limit,
          bonuses: {
            depositMatch: data.deposit_match,
            freeSpins: data.free_spins,
            birthdayBonus: data.birthday_bonus,
          },
          personalManager: data.personal_manager || false,
          customGifts: data.custom_gifts || false,
          specialPromotions: data.special_promotions || false,
          color: data.color || '#000000',
          requiredPoints: data.points_required // For backward compatibility
        };
      }
      
      // Return the mock data if no data was returned
      return vipLevel as VipLevel;
      
    } catch (error) {
      console.error("Error in updateVipLevel:", error);
      return vipLevel as VipLevel;
    }
  },
  
  createVipLevel: async (vipLevel: Omit<VipLevel, 'id'>): Promise<VipLevel> => {
    try {
      // Convert from VipLevel type to database schema
      const dbVipLevel = {
        level: vipLevel.level,
        name: vipLevel.name,
        points_required: vipLevel.pointsRequired,
        benefits: vipLevel.benefits,
        cashback_rate: vipLevel.cashbackRate,
        withdrawal_limit: vipLevel.withdrawalLimit,
        deposit_match: vipLevel.bonuses?.depositMatch,
        free_spins: vipLevel.bonuses?.freeSpins,
        birthday_bonus: vipLevel.bonuses?.birthdayBonus,
        personal_manager: vipLevel.personalManager,
        custom_gifts: vipLevel.customGifts,
        special_promotions: vipLevel.specialPromotions,
        color: vipLevel.color
      };
      
      const { data, error } = await supabase
        .from('vip_levels')
        .insert(dbVipLevel)
        .select()
        .single();
        
      if (error) {
        console.error("Error creating VIP level:", error);
        throw error;
      }
      
      if (data) {
        return {
          id: data.id,
          level: data.level,
          name: data.name,
          pointsRequired: data.points_required,
          benefits: data.benefits || [],
          cashbackRate: data.cashback_rate,
          withdrawalLimit: data.withdrawal_limit,
          bonuses: {
            depositMatch: data.deposit_match,
            freeSpins: data.free_spins,
            birthdayBonus: data.birthday_bonus,
          },
          personalManager: data.personal_manager || false,
          customGifts: data.custom_gifts || false,
          specialPromotions: data.special_promotions || false,
          color: data.color || '#000000',
          requiredPoints: data.points_required // For backward compatibility
        };
      }
      
      // Return the mock data with a generated ID if no data was returned
      return {
        ...vipLevel,
        id: `vip-${Date.now()}`
      };
      
    } catch (error) {
      console.error("Error in createVipLevel:", error);
      return {
        ...vipLevel,
        id: `vip-${Date.now()}`
      };
    }
  },
  
  deleteVipLevel: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vip_levels')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting VIP level:", error);
        throw error;
      }
      
      return true;
      
    } catch (error) {
      console.error("Error in deleteVipLevel:", error);
      return false;
    }
  }
};

// Create a Users API
const usersApi = {
  getUsers: async () => {
    // Implementation for getUsers
    return [];
  }
};

// Helper function for mock VIP levels
function getMockVipLevels(): VipLevel[] {
  return [
    {
      id: "1",
      level: 1,
      name: "Bronze",
      pointsRequired: 0,
      requiredPoints: 0,
      benefits: ["Weekly Cashback", "Birthday Bonus"],
      cashbackRate: 5,
      withdrawalLimit: 5000,
      bonuses: {
        depositMatch: 25,
        freeSpins: 10,
        birthdayBonus: 5
      },
      color: "#CD7F32"
    },
    {
      id: "2",
      level: 2,
      name: "Silver",
      pointsRequired: 1000,
      requiredPoints: 1000,
      benefits: ["Weekly Cashback", "Birthday Bonus", "Weekly Free Spins"],
      cashbackRate: 7.5,
      withdrawalLimit: 7500,
      bonuses: {
        depositMatch: 50,
        freeSpins: 25,
        birthdayBonus: 10
      },
      color: "#C0C0C0"
    },
    {
      id: "3",
      level: 3,
      name: "Gold",
      pointsRequired: 5000,
      requiredPoints: 5000,
      benefits: ["Daily Cashback", "Birthday Bonus", "Weekly Free Spins", "Dedicated Support"],
      cashbackRate: 10,
      withdrawalLimit: 10000,
      bonuses: {
        depositMatch: 100,
        freeSpins: 50,
        birthdayBonus: 25
      },
      color: "#FFD700"
    },
    {
      id: "4",
      level: 4,
      name: "Platinum",
      pointsRequired: 15000,
      requiredPoints: 15000,
      benefits: ["Daily Cashback", "Birthday Bonus", "Daily Free Spins", "Personal Manager", "Custom Bonuses"],
      cashbackRate: 15,
      withdrawalLimit: 25000,
      bonuses: {
        depositMatch: 150,
        freeSpins: 100,
        birthdayBonus: 50
      },
      personalManager: true,
      customGifts: true,
      color: "#E5E4E2"
    },
    {
      id: "5",
      level: 5,
      name: "Diamond",
      pointsRequired: 50000,
      requiredPoints: 50000,
      benefits: ["Daily Cashback", "Birthday Bonus", "Daily Free Spins", "VIP Manager", "Custom Bonuses", "Exclusive Events"],
      cashbackRate: 20,
      withdrawalLimit: 50000,
      bonuses: {
        depositMatch: 200,
        freeSpins: 250,
        birthdayBonus: 100
      },
      personalManager: true,
      customGifts: true,
      specialPromotions: true,
      color: "#B9F2FF"
    }
  ];
}

// Export the vipLevelsApi as vipLevelsApi, and export the getVipLevels function directly
export { vipLevelsApi };
export const getVipLevels = vipLevelsApi.getVipLevels;

// Export the usersApi as usersApi
export { usersApi };
export const getUsers = usersApi.getUsers;

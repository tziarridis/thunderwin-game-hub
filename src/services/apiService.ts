import { VipLevel, Transaction, Bonus, BonusType, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Mock API service for VIP levels
export const getVipLevels = async (): Promise<VipLevel[]> => {
  // First try to fetch from Supabase
  const { data, error } = await supabase
    .from('vip_levels')
    .select('*');
  
  if (!error && data && data.length > 0) {
    return data.map(level => ({
      ...level,
      pointsRequired: level.points_required,
      cashbackRate: level.cashback_rate,
      withdrawalLimit: level.withdrawal_limit,
      bonuses: {
        depositMatch: level.deposit_match || 0,
        freeSpins: level.free_spins || 0,
        birthdayBonus: level.birthday_bonus || 0
      }
    }));
  }
  
  // Fall back to mock data if nothing in Supabase
  const vipLevels: VipLevel[] = [
    {
      id: 1,
      level: 1,
      name: "Bronze",
      pointsRequired: 0,
      benefits: [
        "Welcome Bonus",
        "Weekly Cashback 5%",
        "Fast Withdrawals"
      ],
      cashbackRate: 0.05,
      withdrawalLimit: 5000,
      bonuses: {
        depositMatch: 50,
        freeSpins: 10,
        birthdayBonus: 10
      },
      color: "#CD7F32",
    },
    {
      id: 2,
      level: 2,
      name: "Silver",
      pointsRequired: 1000,
      benefits: [
        "Weekly Cashback 7%",
        "Higher Withdrawal Limits",
        "Enhanced Bonuses",
        "Faster Withdrawals"
      ],
      cashbackRate: 0.07,
      withdrawalLimit: 10000,
      bonuses: {
        depositMatch: 100,
        freeSpins: 25,
        birthdayBonus: 25
      },
      color: "#C0C0C0",
    },
    {
      id: 3,
      level: 3,
      name: "Gold",
      pointsRequired: 5000,
      benefits: [
        "Weekly Cashback 10%", 
        "Personal Account Manager",
        "Custom Bonuses",
        "Priority Withdrawals",
        "Special Promotions"
      ],
      cashbackRate: 0.1,
      withdrawalLimit: 25000,
      personalManager: true,
      specialPromotions: true,
      bonuses: {
        depositMatch: 150,
        freeSpins: 50,
        birthdayBonus: 50
      },
      color: "#FFD700",
    },
    {
      id: 4,
      level: 4,
      name: "Platinum",
      pointsRequired: 20000,
      benefits: [
        "Weekly Cashback 15%",
        "VIP Only Tournaments",
        "Custom Gifts",
        "Luxury Holiday Packages",
        "Personal Account Manager",
        "Unlimited Withdrawals"
      ],
      cashbackRate: 0.15,
      withdrawalLimit: 50000,
      personalManager: true,
      customGifts: true,
      specialPromotions: true,
      bonuses: {
        depositMatch: 200,
        freeSpins: 100,
        birthdayBonus: 100
      },
      color: "#E5E4E2",
    },
    {
      id: 5,
      level: 5,
      name: "Diamond",
      pointsRequired: 50000,
      benefits: [
        "Weekly Cashback 20%",
        "Exclusive VIP Events",
        "Custom Gifts",
        "Luxury Holiday Packages",
        "Personal Account Manager",
        "Unlimited Withdrawals",
        "Custom Withdrawal Limits"
      ],
      cashbackRate: 0.2,
      withdrawalLimit: 100000,
      personalManager: true,
      customGifts: true,
      specialPromotions: true,
      bonuses: {
        depositMatch: 300,
        freeSpins: 200,
        birthdayBonus: 200
      },
      color: "#B9F2FF",
    }
  ];

  return vipLevels;
};

export const createVipLevel = async (newLevel: Omit<VipLevel, "id">): Promise<VipLevel> => {
  try {
    const { data, error } = await supabase
      .from('vip_levels')
      .insert({
        level: newLevel.level,
        name: newLevel.name,
        points_required: newLevel.pointsRequired,
        benefits: newLevel.benefits,
        cashback_rate: newLevel.cashbackRate,
        withdrawal_limit: newLevel.withdrawalLimit,
        deposit_match: newLevel.bonuses.depositMatch,
        free_spins: newLevel.bonuses.freeSpins,
        birthday_bonus: newLevel.bonuses.birthdayBonus,
        color: newLevel.color,
        personal_manager: newLevel.personalManager,
        custom_gifts: newLevel.customGifts,
        special_promotions: newLevel.specialPromotions
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Transform the response to match our VipLevel interface
    return {
      id: data.id,
      level: data.level,
      name: data.name,
      pointsRequired: data.points_required,
      benefits: data.benefits,
      cashbackRate: data.cashback_rate,
      withdrawalLimit: data.withdrawal_limit,
      bonuses: {
        depositMatch: data.deposit_match,
        freeSpins: data.free_spins,
        birthdayBonus: data.birthday_bonus
      },
      color: data.color,
      personalManager: data.personal_manager,
      customGifts: data.custom_gifts,
      specialPromotions: data.special_promotions
    };
  } catch (error) {
    console.error("Error creating VIP level:", error);
    // Fallback to mock implementation
    const id = Date.now();
    return { ...newLevel, id };
  }
};

export const updateVipLevel = async (updatedLevel: VipLevel): Promise<VipLevel> => {
  try {
    const { data, error } = await supabase
      .from('vip_levels')
      .update({
        level: updatedLevel.level,
        name: updatedLevel.name,
        points_required: updatedLevel.pointsRequired,
        benefits: updatedLevel.benefits,
        cashback_rate: updatedLevel.cashbackRate,
        withdrawal_limit: updatedLevel.withdrawalLimit,
        deposit_match: updatedLevel.bonuses.depositMatch,
        free_spins: updatedLevel.bonuses.freeSpins,
        birthday_bonus: updatedLevel.bonuses.birthdayBonus,
        color: updatedLevel.color,
        personal_manager: updatedLevel.personalManager,
        custom_gifts: updatedLevel.customGifts,
        special_promotions: updatedLevel.specialPromotions
      })
      .eq('id', updatedLevel.id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Transform the response to match our VipLevel interface
    return {
      id: data.id,
      level: data.level,
      name: data.name,
      pointsRequired: data.points_required,
      benefits: data.benefits,
      cashbackRate: data.cashback_rate,
      withdrawalLimit: data.withdrawal_limit,
      bonuses: {
        depositMatch: data.deposit_match,
        freeSpins: data.free_spins,
        birthdayBonus: data.birthday_bonus
      },
      color: data.color,
      personalManager: data.personal_manager,
      customGifts: data.custom_gifts,
      specialPromotions: data.special_promotions
    };
  } catch (error) {
    console.error("Error updating VIP level:", error);
    // Fallback to mock implementation
    return updatedLevel;
  }
};

export const deleteVipLevel = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('vip_levels')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting VIP level:", error);
  }
};

// Mock API service for transactions
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('player_id', userId);
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map(transaction => ({
        id: transaction.id,
        userId: transaction.player_id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        date: transaction.created_at,
        description: transaction.description || undefined,
        paymentMethod: transaction.payment_method || undefined,
        gameId: transaction.game_id || undefined,
        bonusId: transaction.bonus_id || undefined,
        balance: transaction.balance_after || undefined,
        referenceId: transaction.reference_id || undefined
      }));
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
  
  // Fall back to mock data
  const transactions: Transaction[] = [
    {
      id: "1",
      userId: userId,
      type: "deposit",
      amount: 100,
      currency: "USD",
      status: "completed",
      date: "2023-07-27T10:00:00Z",
      description: "Initial deposit",
      paymentMethod: "credit_card"
    },
    {
      id: "2",
      userId: userId,
      type: "withdrawal",
      amount: 50,
      currency: "USD",
      status: "pending",
      date: "2023-07-26T15:30:00Z",
      description: "Withdrawal request",
      paymentMethod: "bank_transfer"
    },
    {
      id: "3",
      userId: userId,
      type: "bet",
      amount: 10,
      currency: "USD",
      status: "completed",
      date: "2023-07-25T18:45:00Z",
      gameId: "slot-123",
    },
    {
      id: "4",
      userId: userId,
      type: "win",
      amount: 20,
      currency: "USD",
      status: "completed",
      date: "2023-07-25T19:00:00Z",
      gameId: "slot-123",
    },
    {
      id: "5",
      userId: userId,
      type: "bonus",
      amount: 25,
      currency: "USD",
      status: "completed",
      date: "2023-07-24T20:00:00Z",
      bonusId: "welcome-bonus",
    },
  ];

  return transactions;
};

// Mock API service for bonuses
export const getBonuses = async (userId: string): Promise<Bonus[]> => {
  try {
    const { data, error } = await supabase
      .from('bonuses')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map(bonus => ({
        id: bonus.id,
        userId: bonus.user_id,
        type: bonus.type as BonusType,
        amount: bonus.amount,
        status: bonus.status as "active" | "used" | "expired",
        expiryDate: bonus.expiry_date,
        createdAt: bonus.created_at,
        wageringRequirement: bonus.wagering_requirement,
        progress: bonus.progress,
        description: bonus.description || undefined,
        code: bonus.code || undefined
      }));
    }
  } catch (error) {
    console.error("Error fetching bonuses:", error);
  }
  
  // Fall back to mock data
  const bonuses: Bonus[] = [
    {
      id: "1",
      userId: userId,
      type: BonusType.WELCOME,
      amount: 100,
      status: "active",
      expiryDate: "2023-08-15T00:00:00Z",
      createdAt: "2023-07-15T14:30:00Z",
      wageringRequirement: 35,
      progress: 0,
      description: "Welcome bonus for new users - 100% match up to $100",
      code: "WELCOME100"
    },
    {
      id: "2",
      userId: userId,
      type: BonusType.FREE_SPINS,
      amount: 50,
      status: "active",
      expiryDate: "2023-08-10T00:00:00Z",
      createdAt: "2023-07-10T09:45:00Z",
      wageringRequirement: 20,
      progress: 0,
      description: "50 free spins on Starburst",
      code: "SPIN50"
    },
    {
      id: "3",
      userId: userId,
      type: BonusType.DEPOSIT,
      amount: 75,
      status: "active",
      expiryDate: "2023-08-05T00:00:00Z",
      createdAt: "2023-07-05T16:15:00Z",
      wageringRequirement: 30,
      progress: 45,
      description: "Weekly reload bonus - 50% match up to $75",
      code: "RELOAD50"
    },
    {
      id: "4",
      userId: userId,
      type: BonusType.CASHBACK,
      amount: 25,
      status: "used",
      expiryDate: "2023-06-30T00:00:00Z",
      createdAt: "2023-06-20T11:30:00Z",
      wageringRequirement: 10,
      progress: 100,
      description: "10% cashback on losses",
      code: "CASH10"
    },
    {
      id: "5",
      userId: userId,
      type: BonusType.FREE_SPINS,
      amount: 20,
      status: "expired",
      expiryDate: "2023-06-25T00:00:00Z",
      createdAt: "2023-06-15T14:30:00Z",
      wageringRequirement: 15,
      progress: 60,
      description: "20 free spins on Book of Dead",
      code: "BOOK20"
    },
  ];

  return bonuses;
};

// Users API
export const usersApi = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          wallets (*)
        `);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data.map(user => ({
          id: user.id,
          name: user.username, // Using username as name if available
          username: user.username,
          email: user.email,
          balance: user.wallets?.[0]?.balance || 0,
          isAdmin: user.role_id === 1, // Assuming role_id 1 is admin
          vipLevel: user.wallets?.[0]?.vip_level || 0,
          isVerified: true, // Default to true
          status: user.status as "Active" | "Pending" | "Inactive",
          joined: user.created_at,
          avatar: user.avatar || undefined,
          role: user.role_id === 1 ? "admin" : "user",
          favoriteGames: [],
          phone: user.phone || undefined,
          referralCode: user.inviter_code || undefined,
          referredBy: user.inviter_id || undefined,
          lastLogin: user.updated_at || undefined,
          createdAt: user.created_at || undefined
        }));
      }
      
      // Return mock data if no users
      return mockUsers;
    } catch (error) {
      console.error("Error fetching users:", error);
      return mockUsers;
    }
  },

  // Add new user
  addUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    try {
      // First create the user in auth
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: 'tempPassword123', // Set a temporary password
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });
      
      if (authError) throw authError;
      
      // Wallet will be created automatically via trigger when user is created
      
      // Return the created user
      return {
        id: authUser.user?.id || 'new-id',
        ...userData
      };
    } catch (error) {
      console.error("Error adding user:", error);
      // Mock response
      return {
        id: `user-${Date.now()}`,
        ...userData
      };
    }
  },

  // Update user
  updateUser: async (userData: User): Promise<User> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar,
          phone: userData.phone,
          status: userData.status
        })
        .eq('id', userData.id);
        
      if (error) throw error;
      
      // Update wallet balance if needed
      if (userData.balance !== undefined) {
        await supabase
          .from('wallets')
          .update({ balance: userData.balance })
          .eq('user_id', userData.id);
      }
      
      return userData;
    } catch (error) {
      console.error("Error updating user:", error);
      return userData;
    }
  },

  // Get user by id
  getUserById: async (id: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          wallets (*)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        return {
          id: data.id,
          name: data.username,
          username: data.username,
          email: data.email,
          balance: data.wallets?.[0]?.balance || 0,
          isAdmin: data.role_id === 1,
          vipLevel: data.wallets?.[0]?.vip_level || 0,
          isVerified: true,
          status: data.status as "Active" | "Pending" | "Inactive",
          joined: data.created_at,
          avatar: data.avatar || undefined,
          role: data.role_id === 1 ? "admin" : "user",
          favoriteGames: [],
          phone: data.phone || undefined,
          referralCode: data.inviter_code || undefined,
          referredBy: data.inviter_id || undefined,
          lastLogin: data.updated_at || undefined,
          createdAt: data.created_at || undefined
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }
};

// Mock users data for fallback
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    balance: 1500,
    isAdmin: false,
    vipLevel: 2,
    isVerified: true,
    status: "Active",
    joined: "2023-01-15",
    role: "user",
    favoriteGames: ["game-1", "game-2"]
  },
  {
    id: "2",
    name: "Jane Smith",
    username: "janesmith",
    email: "jane@example.com",
    balance: 2500,
    isAdmin: false,
    vipLevel: 3,
    isVerified: true,
    status: "Active",
    joined: "2023-02-10",
    role: "user",
    favoriteGames: ["game-3"]
  },
  {
    id: "3",
    name: "Admin User",
    username: "admin",
    email: "admin@example.com",
    balance: 10000,
    isAdmin: true,
    vipLevel: 5,
    isVerified: true,
    status: "Active",
    joined: "2022-12-01",
    role: "admin",
    favoriteGames: []
  }
];

// Export the usersApi and getUsers specifically
export { usersApi as usersApi };
export const getUsers = usersApi.getUsers;

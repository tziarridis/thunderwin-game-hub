import axios from 'axios';
import { User, Game, Transaction, VipLevel, Bonus, GameProvider, GameCategory, Wallet, DbGame } from '@/types'; // Ensure DbGame is used for game creation/updates
import { supabase } from '@/integrations/supabase/client'; // Assuming supabase client is configured


// This is a MOCK API service. In a real app, these would be actual API calls.
// For now, it mainly interacts with Supabase for demo purposes.

const API_BASE_URL = '/api'; // Example, adjust if you have a backend

// Helper for Supabase calls
const handleSupabaseResponse = async (promise: Promise<{ data: any; error: any }>) => {
  const { data, error } = await promise;
  if (error) throw error;
  return data;
};


export const apiService = {
  // User Management
  getUsers: async (): Promise<User[]> => {
    return handleSupabaseResponse(supabase.from('users').select('*'));
  },
  getUserById: async (id: string): Promise<User | null> => {
    return handleSupabaseResponse(supabase.from('users').select('*').eq('id', id).single());
  },
  createUser: async (userData: Partial<User>): Promise<User> => {
    // For Supabase, user creation is typically handled by auth.signUp.
    // This might be for creating a profile in 'users' table after auth.
    // Ensure userData matches the 'users' table schema.
    const { email, username, ...otherData } = userData; // Separate auth fields if needed
    const profileData = {
        email, // Assuming email is also in your users table and unique
        username: username || email, // Default username to email
        ...otherData // Spread other valid fields for the 'users' table
    };
    return handleSupabaseResponse(supabase.from('users').insert(profileData).select().single());
  },
  updateUser: async (id: string, userData: Partial<User>): Promise<User | null> => {
    // Ensure userData only contains fields present in the 'users' table and User type.
    // Remove or correctly type fields like 'isAdmin' if not part of the DB schema or User type.
    const { isAdmin, ...validUserData } = userData as any; // Temporary cast to avoid TS error, fix User type or remove isAdmin
    return handleSupabaseResponse(supabase.from('users').update(validUserData).eq('id', id).select().single());
  },
  deleteUser: async (id: string): Promise<void> => {
    return handleSupabaseResponse(supabase.from('users').delete().eq('id', id));
  },

  // Game Management (using DbGame for data consistency with DB schema)
  getGames: async (): Promise<DbGame[]> => {
    return handleSupabaseResponse(supabase.from('games').select(`
      *,
      provider:providers (id, name, slug),
      categories:game_categories (id, name, slug)
    `));
  },
  getGameById: async (id: string): Promise<DbGame | null> => {
    return handleSupabaseResponse(supabase.from('games').select(`
      *,
      provider:providers (id, name, slug),
      categories:game_categories (id, name, slug)
    `).eq('id', id).single());
  },
  createGame: async (gameData: Partial<DbGame>): Promise<DbGame> => {
    // Ensure gameData conforms to DbGame and your 'games' table schema
    return handleSupabaseResponse(supabase.from('games').insert(gameData).select().single());
  },
  updateGame: async (id: string, gameData: Partial<DbGame>): Promise<DbGame | null> => {
    // Ensure gameData conforms to DbGame and your 'games' table schema
    return handleSupabaseResponse(supabase.from('games').update(gameData).eq('id', id).select().single());
  },
  deleteGame: async (id: string): Promise<void> => {
    return handleSupabaseResponse(supabase.from('games').delete().eq('id', id));
  },
  
  // Game Providers
  getProviders: async (): Promise<GameProvider[]> => {
    return handleSupabaseResponse(supabase.from('providers').select('*'));
  },
  createProvider: async (providerData: Partial<GameProvider>): Promise<GameProvider> => {
    return handleSupabaseResponse(supabase.from('providers').insert(providerData).select().single());
  },
  updateProvider: async (id: string, providerData: Partial<GameProvider>): Promise<GameProvider | null> => {
    return handleSupabaseResponse(supabase.from('providers').update(providerData).eq('id', id).select().single());
  },

  // Game Categories
  getCategories: async (): Promise<GameCategory[]> => {
    return handleSupabaseResponse(supabase.from('game_categories').select('*'));
  },
  createCategory: async (categoryData: Partial<GameCategory>): Promise<GameCategory> => {
    return handleSupabaseResponse(supabase.from('game_categories').insert(categoryData).select().single());
  },
  updateCategory: async (id: string, categoryData: Partial<GameCategory>): Promise<GameCategory | null> => {
    return handleSupabaseResponse(supabase.from('game_categories').update(categoryData).eq('id', id).select().single());
  },


  // Transaction Management
  getTransactions: async (): Promise<Transaction[]> => {
    return handleSupabaseResponse(supabase.from('transactions').select('*').order('created_at', { ascending: false }));
  },
  createTransaction: async (transactionData: Partial<Transaction>): Promise<Transaction> => {
    return handleSupabaseResponse(supabase.from('transactions').insert(transactionData).select().single());
  },

  // Wallet Management
  getWallets: async (): Promise<Wallet[]> => {
    return handleSupabaseResponse(supabase.from('wallets').select('*'));
  },
  getWalletByUserId: async (userId: string): Promise<Wallet | null> => {
     // Assuming a user has one primary wallet or you fetch the first one.
    const wallets = await handleSupabaseResponse(supabase.from('wallets').select('*').eq('user_id', userId));
    return wallets && wallets.length > 0 ? wallets[0] : null;
  },
  updateWallet: async (walletId: string, walletData: Partial<Wallet>): Promise<Wallet | null> => {
    return handleSupabaseResponse(supabase.from('wallets').update(walletData).eq('id', walletId).select().single());
  },


  // VIP Levels
  getVipLevels: async (): Promise<VipLevel[]> => {
    return handleSupabaseResponse(supabase.from('vip_levels').select('*').order('required_points', { ascending: true }));
  },
  createVipLevel: async (levelData: Omit<VipLevel, 'id'>): Promise<VipLevel> => {
    // Omit 'id' as it's auto-generated. Ensure levelData matches VipLevel structure minus id.
    // Remove 'requiredPoints' if it's not part of the type or schema for creation this way
    const { requiredPoints, ...data } = levelData as any; // Adjust based on actual type
    const validData = { ...data, required_points: requiredPoints }; // Map to DB column name
    return handleSupabaseResponse(supabase.from('vip_levels').insert(validData).select().single());
  },
  updateVipLevel: async (id: string, levelData: Partial<VipLevel>): Promise<VipLevel | null> => {
    // Remove 'requiredPoints' if it's not part of the type or schema for update this way
    const { requiredPoints, ...data } = levelData as any; // Adjust based on actual type
    const validData = { ...data, required_points: requiredPoints }; // Map to DB column name
    return handleSupabaseResponse(supabase.from('vip_levels').update(validData).eq('id', id).select().single());
  },
  deleteVipLevel: async (id: string): Promise<void> => {
    return handleSupabaseResponse(supabase.from('vip_levels').delete().eq('id', id));
  },

  // Bonuses
  getBonuses: async (): Promise<Bonus[]> => {
    return handleSupabaseResponse(supabase.from('bonuses').select('*'));
  },
  createBonus: async (bonusData: Omit<Bonus, 'id'>): Promise<Bonus> => {
    // Omit 'id'. Ensure bonusData matches Bonus type structure.
    return handleSupabaseResponse(supabase.from('bonuses').insert(bonusData).select().single());
  },
  updateBonus: async (id: string, bonusData: Partial<Bonus>): Promise<Bonus | null> => {
    return handleSupabaseResponse(supabase.from('bonuses').update(bonusData).eq('id', id).select().single());
  },
  deleteBonus: async (id: string): Promise<void> => {
    return handleSupabaseResponse(supabase.from('bonuses').delete().eq('id', id));
  },
  assignBonusToUser: async (userId: string, bonusId: string): Promise<any> => { // Define a proper return type
    // This would typically involve creating a record in a user_bonuses join table.
    // Example:
    // return handleSupabaseResponse(supabase.from('user_bonuses').insert({ user_id: userId, bonus_id: bonusId, claimed_at: new Date().toISOString() }).select().single());
    console.log(`Assigning bonus ${bonusId} to user ${userId}`);
    return Promise.resolve({ success: true, message: "Bonus assigned (mock)." }); // Mock response
  },
};

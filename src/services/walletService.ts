
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface Wallet {
  id: string;
  user_id: string;
  currency: string;
  symbol: string;
  balance: number;
  balance_bonus?: number;
  balance_cryptocurrency?: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Additional properties for UI components
  userName?: string;
  userEmail?: string;
  lastTransaction?: string;
  vipLevel?: number;
  vipPoints?: number;
}

/**
 * Get wallet by user ID
 */
export const getWalletByUserId = async (userId: string): Promise<Wallet | null> => {
  const { data, error } = await supabase
    .from('wallets')
    .select()
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error getting wallet:', error);
    return null;
  }

  return data as Wallet;
};

/**
 * Get all wallets, optionally filtered
 */
export const getWallets = async (filter: { active?: boolean } = {}): Promise<Wallet[]> => {
  let query = supabase
    .from('wallets')
    .select(`
      *,
      users!wallets_user_id_fkey (
        email,
        username
      )
    `);
  
  if (filter.active !== undefined) {
    query = query.eq('active', filter.active);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error getting wallets:', error);
    return [];
  }

  // Process data to include UI-friendly properties
  return data.map(item => ({
    ...item,
    userName: item.users?.username || 'Unknown',
    userEmail: item.users?.email,
    lastTransaction: item.updated_at
  })) as Wallet[];
};

/**
 * Update wallet balance
 */
export const updateWalletBalance = async (
  userId: string, 
  newBalance: number
): Promise<Wallet | null> => {
  const { data, error } = await supabase
    .from('wallets')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating wallet balance:', error);
    return null;
  }

  return data as Wallet;
};

/**
 * Create wallet for user
 */
export const createWallet = async (
  userId: string,
  currency: string = 'USD',
  symbol: string = '$',
  initialBalance: number = 0
): Promise<Wallet | null> => {
  // Check if wallet already exists
  const existingWallet = await getWalletByUserId(userId);
  if (existingWallet) {
    console.log('Wallet already exists for user', userId);
    return existingWallet;
  }

  const { data, error } = await supabase
    .from('wallets')
    .insert({
      user_id: userId,
      currency,
      symbol,
      balance: initialBalance,
      balance_bonus: 0,
      balance_cryptocurrency: 0,
      active: true
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating wallet:', error);
    return null;
  }

  return data as Wallet;
};

export default {
  getWalletByUserId,
  getWallets,
  updateWalletBalance,
  createWallet
};

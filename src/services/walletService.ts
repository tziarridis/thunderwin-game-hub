
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Wallet, WalletTransaction } from '@/types/wallet';

/**
 * Wallet Service
 * Handles all wallet-related operations for the casino
 */

/**
 * Get a user's wallet or create if it doesn't exist
 * @param userId User ID
 * @returns The user's wallet
 */
export const getWalletByUserId = async (userId: string): Promise<Wallet | null> => {
  try {
    // Try to get the existing wallet
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no wallet exists, create one
      if (error.code === 'PGRST116') {
        return await createWallet(userId);
      }
      throw error;
    }
    
    return data as Wallet;
  } catch (error) {
    console.error(`Error getting wallet for user ${userId}:`, error);
    return null;
  }
};

/**
 * Create a new wallet for a user
 * @param userId User ID
 * @param currency Currency code (default: USD)
 * @returns The newly created wallet
 */
export const createWallet = async (userId: string, currency = 'USD'): Promise<Wallet | null> => {
  try {
    const symbol = currency === 'USD' ? '$' : 
                   currency === 'EUR' ? '€' : 
                   currency === 'GBP' ? '£' : 
                   currency;
    
    const newWallet = {
      user_id: userId,
      balance: 0,
      currency,
      symbol,
      active: true,
      vip_level: 0,
      vip_points: 0
    };
    
    const { data, error } = await supabase
      .from('wallets')
      .insert(newWallet)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Wallet created successfully');
    return data as Wallet;
  } catch (error) {
    console.error(`Error creating wallet for user ${userId}:`, error);
    toast.error('Failed to create wallet');
    return null;
  }
};

/**
 * Update a wallet's balance
 * @param userId User ID
 * @param newBalance New balance value
 * @returns Success status
 */
export const updateWalletBalance = async (userId: string, newBalance: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wallets')
      .update({ 
        balance: newBalance, 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error updating wallet balance for user ${userId}:`, error);
    return false;
  }
};

/**
 * Credit (deposit) funds to a wallet
 * @param userId User ID
 * @param amount Amount to credit
 * @param type Transaction type
 * @param provider Provider name
 * @returns Success status
 */
export const creditWallet = async (
  userId: string, 
  amount: number, 
  type: 'deposit' | 'win' | 'bonus',
  provider: string = 'system'
): Promise<boolean> => {
  try {
    // Get current wallet
    const wallet = await getWalletByUserId(userId);
    if (!wallet) throw new Error('Wallet not found');
    
    // Start a Supabase transaction
    const { data, error } = await supabase.rpc('credit_wallet', {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_provider: provider,
      p_currency: wallet.currency || 'USD'
    });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error crediting wallet for user ${userId}:`, error);
    return false;
  }
};

/**
 * Debit (withdraw) funds from a wallet
 * @param userId User ID
 * @param amount Amount to debit
 * @param type Transaction type
 * @param provider Provider name
 * @returns Success status
 */
export const debitWallet = async (
  userId: string, 
  amount: number, 
  type: 'withdraw' | 'bet',
  provider: string = 'system'
): Promise<boolean> => {
  try {
    // Get current wallet
    const wallet = await getWalletByUserId(userId);
    if (!wallet) throw new Error('Wallet not found');
    
    // Check if sufficient funds
    if (wallet.balance < amount) {
      toast.error('Insufficient funds');
      return false;
    }
    
    // Start a Supabase transaction
    const { data, error } = await supabase.rpc('debit_wallet', {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_provider: provider,
      p_currency: wallet.currency || 'USD'
    });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error debiting wallet for user ${userId}:`, error);
    return false;
  }
};

/**
 * Get wallet transactions for a user
 * @param userId User ID
 * @param limit Maximum number of transactions to return
 * @returns List of transactions
 */
export const getWalletTransactions = async (userId: string, limit = 20): Promise<WalletTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('player_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Transform the data to match WalletTransaction interface
    const transactions: WalletTransaction[] = (data || []).map(item => ({
      id: item.id,
      user_id: item.player_id,
      amount: item.amount,
      currency: item.currency,
      type: item.type as 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus',
      status: item.status as 'pending' | 'completed' | 'failed',
      created_at: item.created_at,
      provider: item.provider,
      game_id: item.game_id,
      round_id: item.round_id,
      description: item.description, 
      payment_method: item.payment_method,
      bonus_id: item.bonus_id,
      reference_id: item.reference_id
    }));
    
    return transactions;
  } catch (error) {
    console.error(`Error getting transactions for user ${userId}:`, error);
    return [];
  }
};

export const walletService = {
  getWalletByUserId,
  createWallet,
  updateWalletBalance,
  creditWallet,
  debitWallet,
  getWalletTransactions
};

export default walletService;

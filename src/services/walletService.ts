
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Wallet Service
 * Handles all wallet-related operations for the casino
 */
export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  symbol: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  balance_bonus?: number;
  total_won?: number;
  total_bet?: number;
  total_lose?: number;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  provider?: string;
  game_id?: string;
  round_id?: string;
}

export const walletService = {
  /**
   * Get a user's wallet or create if it doesn't exist
   * @param userId User ID
   * @returns The user's wallet
   */
  getWalletByUserId: async (userId: string): Promise<Wallet | null> => {
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
          return await walletService.createWallet(userId);
        }
        throw error;
      }
      
      return data as Wallet;
    } catch (error) {
      console.error(`Error getting wallet for user ${userId}:`, error);
      return null;
    }
  },
  
  /**
   * Create a new wallet for a user
   * @param userId User ID
   * @param currency Currency code (default: USD)
   * @returns The newly created wallet
   */
  createWallet: async (userId: string, currency = 'USD'): Promise<Wallet | null> => {
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
        active: true
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
  },
  
  /**
   * Update a wallet's balance
   * @param userId User ID
   * @param newBalance New balance value
   * @returns Success status
   */
  updateWalletBalance: async (userId: string, newBalance: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error(`Error updating wallet balance for user ${userId}:`, error);
      return false;
    }
  },
  
  /**
   * Credit (deposit) funds to a wallet
   * @param userId User ID
   * @param amount Amount to credit
   * @param type Transaction type
   * @param provider Provider name
   * @returns Success status
   */
  creditWallet: async (
    userId: string, 
    amount: number, 
    type: 'deposit' | 'win' | 'bonus' = 'deposit',
    provider = 'system'
  ): Promise<boolean> => {
    try {
      // Get current wallet
      const wallet = await walletService.getWalletByUserId(userId);
      if (!wallet) throw new Error('Wallet not found');
      
      // Calculate new balance
      const newBalance = wallet.balance + amount;
      
      // Update wallet balance
      const updated = await walletService.updateWalletBalance(userId, newBalance);
      if (!updated) throw new Error('Failed to update wallet balance');
      
      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          player_id: userId,
          amount,
          currency: wallet.currency,
          type,
          provider,
          status: 'completed',
          balance_before: wallet.balance,
          balance_after: newBalance
        });
      
      if (txError) throw txError;
      
      return true;
    } catch (error) {
      console.error(`Error crediting wallet for user ${userId}:`, error);
      return false;
    }
  },
  
  /**
   * Debit (withdraw) funds from a wallet
   * @param userId User ID
   * @param amount Amount to debit
   * @param type Transaction type
   * @param provider Provider name
   * @returns Success status
   */
  debitWallet: async (
    userId: string, 
    amount: number, 
    type: 'withdraw' | 'bet' = 'withdraw',
    provider = 'system'
  ): Promise<boolean> => {
    try {
      // Get current wallet
      const wallet = await walletService.getWalletByUserId(userId);
      if (!wallet) throw new Error('Wallet not found');
      
      // Check if sufficient funds
      if (wallet.balance < amount) {
        toast.error('Insufficient funds');
        return false;
      }
      
      // Calculate new balance
      const newBalance = wallet.balance - amount;
      
      // Update wallet balance
      const updated = await walletService.updateWalletBalance(userId, newBalance);
      if (!updated) throw new Error('Failed to update wallet balance');
      
      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          player_id: userId,
          amount,
          currency: wallet.currency,
          type,
          provider,
          status: 'completed',
          balance_before: wallet.balance,
          balance_after: newBalance
        });
      
      if (txError) throw txError;
      
      return true;
    } catch (error) {
      console.error(`Error debiting wallet for user ${userId}:`, error);
      return false;
    }
  },
  
  /**
   * Get wallet transactions for a user
   * @param userId User ID
   * @param limit Maximum number of transactions to return
   * @returns List of transactions
   */
  getWalletTransactions: async (userId: string, limit = 20): Promise<WalletTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('player_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data as WalletTransaction[];
    } catch (error) {
      console.error(`Error getting transactions for user ${userId}:`, error);
      return [];
    }
  }
};

export default walletService;

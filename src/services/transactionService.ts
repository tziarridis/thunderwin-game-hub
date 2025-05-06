
import { supabase } from '@/integrations/supabase/client';

export type TransactionData = {
  user_id: string;
  player_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  reference_id?: string;
  game_id?: string;
  round_id?: string;
  provider: string;
  balance_before?: number;
  balance_after?: number;
  metadata?: any;
};

/**
 * Transaction service for handling financial transactions
 */
export const transactionService = {
  /**
   * Add a new transaction to the database
   */
  addTransaction: async (transactionData: TransactionData) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([transactionData]);
        
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Get transactions for a specific user
   */
  getUserTransactions: async (userId: string, limit = 10, offset = 0) => {
    try {
      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('player_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      if (error) throw error;
      
      return { 
        success: true, 
        data: data || [], 
        total: count || 0 
      };
    } catch (error: any) {
      console.error('Error getting user transactions:', error);
      return { success: false, error: error.message, data: [], total: 0 };
    }
  },
  
  /**
   * Get game-related transactions
   */
  getGameTransactions: async (gameId: string, limit = 10, offset = 0) => {
    try {
      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      if (error) throw error;
      
      return { 
        success: true, 
        data: data || [], 
        total: count || 0 
      };
    } catch (error: any) {
      console.error('Error getting game transactions:', error);
      return { success: false, error: error.message, data: [], total: 0 };
    }
  }
};

// Export a standalone function for backward compatibility
export const addTransaction = transactionService.addTransaction;

export default transactionService;

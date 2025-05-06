
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
  getUserTransactions: async (userId: string, filters: any = {}, limit = 10, offset = 0) => {
    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('player_id', userId);
      
      // Apply additional filters if provided
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.startDate && filters.endDate) {
        query = query.gte('created_at', filters.startDate)
                     .lte('created_at', filters.endDate);
      }
      
      // Apply limit and offset for pagination
      const limitToUse = filters.limit || limit;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limitToUse - 1);
        
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
  },

  /**
   * Get Pragmatic Play transactions
   */
  getPragmaticPlayTransactions: async (limit = 50, offset = 0) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('provider', 'PragmaticPlay')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching Pragmatic Play transactions:', error);
      throw error;
    }
  }
};

// Export individual functions for backward compatibility
export const { 
  addTransaction, 
  getUserTransactions, 
  getGameTransactions,
  getPragmaticPlayTransactions 
} = transactionService;

export default transactionService;

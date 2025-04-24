
import { supabase } from "@/integrations/supabase/client";
import { TransactionFilter } from "./transactionService";
import { transactionEnrichService } from "./transactionEnrichService";

/**
 * Transaction Query Service
 * Responsible for querying transactions with various filters
 */
export const transactionQueryService = {
  /**
   * Get transactions with filters
   * @param filters Filter parameters
   * @returns Array of transactions
   */
  getTransactionsWithFilters: async (filters: TransactionFilter) => {
    let query = supabase
      .from('transactions')
      .select();
    
    if (filters.player_id) {
      query = query.eq('player_id', filters.player_id);
    }
    
    if (filters.provider) {
      query = query.eq('provider', filters.provider);
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;

    if (error) {
      console.error('Error getting transactions:', error);
      return [];
    }

    // Process the data to include UI-friendly properties
    return await transactionEnrichService.enrichTransactions(data);
  },

  /**
   * Get transactions by provider
   * @param provider Provider name
   * @param limit Maximum number of transactions to return
   * @returns Array of transactions
   */
  getTransactionsByProvider: async (provider: string, limit = 100) => {
    const { data, error } = await supabase
      .from('transactions')
      .select()
      .eq('provider', provider)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`Error getting ${provider} transactions:`, error);
      return [];
    }

    // Process the data to include UI-friendly properties
    return await transactionEnrichService.enrichTransactions(data);
  },

  /**
   * Get transactions by user
   * @param userId User ID
   * @param limit Maximum number of transactions to return
   * @returns Array of transactions
   */
  getTransactionsByUser: async (userId: string, limit = 100) => {
    const { data, error } = await supabase
      .from('transactions')
      .select()
      .eq('player_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`Error getting transactions for user ${userId}:`, error);
      return [];
    }

    // Process the data to include UI-friendly properties
    return await transactionEnrichService.enrichTransactions(data);
  }
};

export default transactionQueryService;

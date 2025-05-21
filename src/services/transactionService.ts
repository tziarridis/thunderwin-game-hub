
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionFilters, TransactionSort } from '@/types/transaction'; // Ensure TransactionSort is defined if used

const transactionService = {
  // Get transactions for a specific player, with pagination and filtering
  getPlayerTransactions: async (
    playerId: string,
    options?: {
      page?: number;
      limit?: number;
      filters?: TransactionFilters; // Use TransactionFilters from types
      sort?: TransactionSort;     // Use TransactionSort from types
      type?: string; // Added for specific type filter
      status?: string; // Added for specific status filter
      startDate?: string; // Added for date range
      endDate?: string;   // Added for date range
    }
  ): Promise<{ transactions: Transaction[]; count: number }> => {
    const { 
        page = 1, 
        limit = 10, 
        filters = {}, 
        sort = { field: 'created_at', order: 'desc' },
        type, status, startDate, endDate // Destructure new filters
    } = options || {};
    
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('player_id', playerId);

    // Apply general filters from TransactionFilters type
    if (filters.type && filters.type !== 'all') query = query.eq('type', filters.type);
    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters.minAmount) query = query.gte('amount', filters.minAmount);
    if (filters.maxAmount) query = query.lte('amount', filters.maxAmount);
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

    // Apply specific filters from options
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate + 'T23:59:59.999Z'); // Ensure end of day

    // Apply sorting
    query = query.order(sort.field, { ascending: sort.order === 'asc' });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching player transactions:', error);
      throw error;
    }
    return { transactions: data || [], count: count || 0 };
  },

  // Get a single transaction by its ID
  getTransactionById: async (transactionId: string): Promise<Transaction | null> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .maybeSingle(); // Use maybeSingle to handle not found gracefully

    if (error) {
      console.error('Error fetching transaction by ID:', error);
      throw error;
    }
    return data;
  },

  // Create a new transaction (e.g., manual adjustment by admin)
  // Note: Most transactions (deposits, bets, wins) should be created by specific services or game providers
  createTransaction: async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> => {
    // Ensure player_id is part of transactionData as it's required by schema
    if (!transactionData.player_id) {
        throw new Error("player_id is required to create a transaction.");
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
    return data;
  },

  // Update an existing transaction (e.g., change status from pending to completed)
  updateTransactionStatus: async (transactionId: string, status: string, metadata?: Record<string, any>): Promise<Transaction> => {
    const updatePayload: Partial<Transaction> = { status };
    if (metadata) updatePayload.metadata = metadata;
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updatePayload)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
    return data;
  },
  
  // Additional methods for more complex queries or admin actions can be added here
  // For example, fetching all transactions for admin panel with more advanced filtering.
};

export { transactionService }; // Export as named export

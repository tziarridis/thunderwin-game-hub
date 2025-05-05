
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Transaction, TransactionFilter } from '@/types/transaction';

/**
 * Get transactions for a user with filtering options
 * @param userId User ID
 * @param filters Optional filters
 * @returns Transactions data and count
 */
export const getUserTransactions = async (
  userId: string,
  filters: TransactionFilter = {}
): Promise<{ data: Transaction[]; total: number }> => {
  try {
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('player_id', userId);
    
    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.provider) {
      query = query.eq('provider', filters.provider);
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    // Execute query
    const { data, error, count } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match Transaction interface
    const transactions: Transaction[] = (data || []).map(item => ({
      id: item.id,
      userId: item.player_id,
      amount: item.amount,
      currency: item.currency,
      type: item.type as 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus',
      status: item.status as 'pending' | 'completed' | 'failed',
      date: item.created_at,
      provider: item.provider,
      gameId: item.game_id,
      roundId: item.round_id,
      description: item.description || undefined,
      paymentMethod: item.payment_method || undefined,
      bonusId: item.bonus_id || undefined,
      referenceId: item.reference_id || undefined
    }));
    
    return {
      data: transactions,
      total: count || 0
    };
  } catch (error) {
    console.error(`Error getting transactions for user ${userId}:`, error);
    return {
      data: [],
      total: 0
    };
  }
};

/**
 * Get all transactions with filtering options (for admin)
 * @param filters Optional filters
 * @returns Transactions data and count
 */
export const getAllTransactions = async (
  filters: TransactionFilter = {}
): Promise<{ data: Transaction[]; total: number }> => {
  try {
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (filters.player_id) {
      query = query.eq('player_id', filters.player_id);
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.provider) {
      query = query.eq('provider', filters.provider);
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    // Execute query
    const { data, error, count } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match Transaction interface
    const transactions: Transaction[] = (data || []).map(item => ({
      id: item.id,
      userId: item.player_id,
      amount: item.amount,
      currency: item.currency,
      type: item.type as 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus',
      status: item.status as 'pending' | 'completed' | 'failed',
      date: item.created_at,
      provider: item.provider,
      gameId: item.game_id,
      roundId: item.round_id,
      description: item.description || undefined,
      paymentMethod: item.payment_method || undefined,
      bonusId: item.bonus_id || undefined,
      referenceId: item.reference_id || undefined
    }));
    
    return {
      data: transactions,
      total: count || 0
    };
  } catch (error) {
    console.error('Error getting all transactions:', error);
    return {
      data: [],
      total: 0
    };
  }
};

/**
 * Get Pragmatic Play transactions
 * @param filters Optional filters
 * @returns Transactions data
 */
export const getPragmaticPlayTransactions = async (
  filters: TransactionFilter = {}
): Promise<Transaction[]> => {
  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('provider', 'pragmatic');
    
    // Apply filters
    if (filters.player_id) {
      query = query.eq('player_id', filters.player_id);
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
    
    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    // Execute query
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform to Transaction type
    const transactions: Transaction[] = (data || []).map(item => ({
      id: item.id,
      userId: item.player_id,
      amount: item.amount,
      currency: item.currency,
      type: item.type as 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus',
      status: item.status as 'pending' | 'completed' | 'failed',
      date: item.created_at,
      provider: item.provider,
      gameId: item.game_id,
      roundId: item.round_id,
      description: item.description || undefined,
      paymentMethod: item.payment_method || undefined,
      bonusId: item.bonus_id || undefined,
      referenceId: item.reference_id || undefined
    }));
    
    return transactions;
  } catch (error) {
    console.error('Error getting Pragmatic Play transactions:', error);
    return [];
  }
};

/**
 * Add a new transaction
 * @param transaction Transaction data
 * @returns The created transaction or null on error
 */
export const addTransaction = async (transactionData: {
  userId: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus';
  amount: number;
  currency: string;
  status?: 'pending' | 'completed' | 'failed';
  description?: string;
  paymentMethod?: string;
  referenceId?: string;
}): Promise<Transaction | null> => {
  try {
    // Convert to database field names
    const dbData = {
      player_id: transactionData.userId,
      type: transactionData.type,
      amount: transactionData.amount,
      currency: transactionData.currency,
      status: transactionData.status || 'completed',
      provider: 'system',
      created_at: new Date().toISOString()
    };

    // Add optional fields only if they exist
    if (transactionData.description) {
      Object.assign(dbData, { description: transactionData.description });
    }
    if (transactionData.paymentMethod) {
      Object.assign(dbData, { payment_method: transactionData.paymentMethod });
    }
    if (transactionData.referenceId) {
      Object.assign(dbData, { reference_id: transactionData.referenceId });
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(dbData)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.player_id,
      amount: data.amount,
      currency: data.currency,
      type: data.type,
      status: data.status,
      date: data.created_at,
      description: data.description,
      paymentMethod: data.payment_method,
      provider: data.provider,
      gameId: data.game_id,
      roundId: data.round_id,
      bonusId: data.bonus_id,
      referenceId: data.reference_id
    };
  } catch (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
};

// For backwards compatibility with existing code
export const getTransactions = getUserTransactions;

// Export the service as default and named
const transactionService = {
  getUserTransactions,
  getAllTransactions,
  getPragmaticPlayTransactions,
  getTransactions,
  addTransaction
};

export default transactionService;

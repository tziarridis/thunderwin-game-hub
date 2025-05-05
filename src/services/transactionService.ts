
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Transaction, TransactionFilter } from '@/types/transaction';
import { WalletTransaction } from '@/types/wallet';

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
      description: item.description,
      paymentMethod: item.payment_method,
      bonusId: item.bonus_id,
      referenceId: item.reference_id
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
      description: item.description,
      paymentMethod: item.payment_method,
      bonusId: item.bonus_id,
      referenceId: item.reference_id
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
 * @returns Transactions data and count
 */
export const getPragmaticPlayTransactions = async (
  filters: TransactionFilter = {}
): Promise<WalletTransaction[]> => {
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
    
    // Transform to WalletTransaction type
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
    console.error('Error getting Pragmatic Play transactions:', error);
    return [];
  }
};

// For backwards compatibility with existing code
export const getTransactions = getUserTransactions;

// Export all functions
const transactionService = {
  getUserTransactions,
  getAllTransactions,
  getPragmaticPlayTransactions,
  getTransactions
};

export default transactionService;

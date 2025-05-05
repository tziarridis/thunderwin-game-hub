
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Transaction, TransactionFilter } from '@/types/transaction';

// Define the database transaction type to match what's in the database
interface DbTransaction {
  id: string;
  player_id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  provider: string;
  game_id: string;
  round_id: string;
  session_id: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
  updated_at: string;
  description?: string;
  payment_method?: string;
  bonus_id?: string;
  reference_id?: string;
}

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
    const transactions: Transaction[] = (data || []).map((item: DbTransaction) => ({
      id: item.id,
      userId: item.player_id,
      amount: item.amount,
      currency: item.currency,
      type: item.type as 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus',
      status: item.status as 'pending' | 'completed' | 'failed',
      date: item.created_at,
      provider: item.provider || '',
      gameId: item.game_id || '',
      roundId: item.round_id || '',
      // Safely handle optional fields that might not exist in the database
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
    const transactions: Transaction[] = (data || []).map((item: DbTransaction) => ({
      id: item.id,
      userId: item.player_id,
      amount: item.amount,
      currency: item.currency,
      type: item.type as 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus',
      status: item.status as 'pending' | 'completed' | 'failed',
      date: item.created_at,
      provider: item.provider || '',
      gameId: item.game_id || '',
      roundId: item.round_id || '',
      // Safely handle optional fields that might not exist
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
    const transactions: Transaction[] = (data || []).map((item: DbTransaction) => ({
      id: item.id,
      userId: item.player_id,
      amount: item.amount,
      currency: item.currency,
      type: item.type as 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus',
      status: item.status as 'pending' | 'completed' | 'failed',
      date: item.created_at,
      provider: item.provider || '',
      gameId: item.game_id || '',
      roundId: item.round_id || '',
      // Safely handle optional fields
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
  provider?: string;
  gameId?: string;
  roundId?: string;
}): Promise<Transaction | null> => {
  try {
    // Convert to database field names
    const dbData = {
      player_id: transactionData.userId,
      type: transactionData.type,
      amount: transactionData.amount,
      currency: transactionData.currency,
      status: transactionData.status || 'completed',
      provider: transactionData.provider || 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Record<string, any>;

    // Add optional fields only if they exist
    if (transactionData.description) {
      dbData.description = transactionData.description;
    }
    if (transactionData.paymentMethod) {
      dbData.payment_method = transactionData.paymentMethod;
    }
    if (transactionData.referenceId) {
      dbData.reference_id = transactionData.referenceId;
    }
    if (transactionData.gameId) {
      dbData.game_id = transactionData.gameId;
    }
    if (transactionData.roundId) {
      dbData.round_id = transactionData.roundId;
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(dbData)
      .select()
      .single();
    
    if (error) throw error;
    
    const transaction = data as DbTransaction;
    
    return {
      id: transaction.id,
      userId: transaction.player_id,
      amount: transaction.amount,
      currency: transaction.currency,
      type: transaction.type as 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus',
      status: transaction.status as 'pending' | 'completed' | 'failed',
      date: transaction.created_at,
      description: transaction.description,
      paymentMethod: transaction.payment_method,
      provider: transaction.provider,
      gameId: transaction.game_id,
      roundId: transaction.round_id,
      bonusId: transaction.bonus_id,
      referenceId: transaction.reference_id
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

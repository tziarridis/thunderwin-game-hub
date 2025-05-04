
// Import the necessary types
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WalletTransaction } from "@/types/wallet";

export interface TransactionInput {
  userId: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus';
  amount: number;
  currency?: string;
  status?: 'pending' | 'completed' | 'failed';
  description?: string;
  paymentMethod?: string;
  gameId?: string;
  roundId?: string;
  sessionId?: string;
  provider?: string;
  bonusId?: string;
  referenceId?: string;
}

export interface TransactionFilter {
  player_id?: string;
  type?: string;
  status?: string;
  provider?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * Add a transaction record to the database
 * @param transaction Transaction details
 * @returns Created transaction or null on error
 */
export const addTransaction = async (transaction: TransactionInput): Promise<WalletTransaction | null> => {
  try {
    const { userId, type, amount, currency = 'USD', status = 'completed', ...rest } = transaction;

    // Add default values to handle missing properties
    const insertData = {
      player_id: userId,
      type,
      amount,
      currency,
      status,
      provider: rest.provider || rest.paymentMethod || 'system',
      game_id: rest.gameId || null,
      round_id: rest.roundId || null,
      session_id: rest.sessionId || null,
      description: rest.description || null,
      payment_method: rest.paymentMethod || null,
      bonus_id: rest.bonusId || null,
      reference_id: rest.referenceId || null
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    // Transform the data to match WalletTransaction interface
    const transactionRecord: WalletTransaction = {
      id: data.id,
      user_id: data.player_id,
      amount: data.amount,
      currency: data.currency,
      type: data.type as 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus',
      status: data.status as 'pending' | 'completed' | 'failed',
      created_at: data.created_at,
      provider: data.provider,
      game_id: data.game_id,
      round_id: data.round_id,
      description: data.description || undefined,
      payment_method: data.payment_method || undefined,
      bonus_id: data.bonus_id || undefined,
      reference_id: data.reference_id || undefined
    };

    return transactionRecord;
  } catch (error) {
    console.error("Error adding transaction:", error);
    return null;
  }
};

/**
 * Fetch transaction details by id
 * @param transactionId Transaction ID
 * @returns Transaction object or null if not found
 */
export const getTransactionById = async (transactionId: string): Promise<WalletTransaction | null> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (error) throw error;
    
    // Transform the data to match WalletTransaction interface
    const transaction: WalletTransaction = {
      id: data.id,
      user_id: data.player_id, // Map player_id to user_id
      amount: data.amount,
      currency: data.currency,
      type: data.type as 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus',
      status: data.status as 'pending' | 'completed' | 'failed',
      created_at: data.created_at,
      provider: data.provider,
      game_id: data.game_id,
      round_id: data.round_id,
      description: data.description || undefined,
      payment_method: data.payment_method || undefined,
      bonus_id: data.bonus_id || undefined,
      reference_id: data.reference_id || undefined
    };
    
    return transaction;
  } catch (error) {
    console.error(`Error fetching transaction ${transactionId}:`, error);
    return null;
  }
};

/**
 * Get user transaction history
 * @param userId User ID
 * @param limit Max number of records to fetch
 * @param offset Number of records to skip
 * @returns List of transactions
 */
export const getUserTransactions = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ data: WalletTransaction[], total: number }> => {
  try {
    // Get transactions
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('player_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // Get total count
    const countRes = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', userId);
    
    // Transform the data to match WalletTransaction interface
    const transactions: WalletTransaction[] = (data || []).map(item => ({
      id: item.id,
      user_id: item.player_id, // Map player_id to user_id
      amount: item.amount,
      currency: item.currency,
      type: item.type as 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus',
      status: item.status as 'pending' | 'completed' | 'failed',
      created_at: item.created_at,
      provider: item.provider,
      game_id: item.game_id,
      round_id: item.round_id,
      description: item.description || undefined,
      payment_method: item.payment_method || undefined,
      bonus_id: item.bonus_id || undefined,
      reference_id: item.reference_id || undefined
    }));
    
    return {
      data: transactions,
      total: countRes.count || 0
    };
  } catch (error) {
    console.error(`Error fetching transactions for user ${userId}:`, error);
    return {
      data: [],
      total: 0
    };
  }
};

/**
 * Get transactions for Pragmatic Play provider
 * @param filter Optional filter parameters
 * @returns List of transactions
 */
export const getPragmaticPlayTransactions = async (
  filter?: TransactionFilter
): Promise<WalletTransaction[]> => {
  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('provider', 'pragmaticplay');
    
    if (filter?.player_id) {
      query = query.eq('player_id', filter.player_id);
    }
    
    if (filter?.status) {
      query = query.eq('status', filter.status);
    }
    
    if (filter?.startDate) {
      query = query.gte('created_at', filter.startDate);
    }
    
    if (filter?.endDate) {
      query = query.lte('created_at', filter.endDate);
    }
    
    query = query.order('created_at', { ascending: false });
    
    if (filter?.limit) {
      query = query.limit(filter.limit);
    } else {
      query = query.limit(100);
    }
    
    const { data, error } = await query;
    
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
      description: item.description || undefined,
      payment_method: item.payment_method || undefined,
      bonus_id: item.bonus_id || undefined,
      reference_id: item.reference_id || undefined
    }));
    
    return transactions;
  } catch (error) {
    console.error("Error fetching Pragmatic Play transactions:", error);
    return [];
  }
};

// Alias function to maintain compatibility with existing code
export const getTransactions = getUserTransactions;

export const transactionService = {
  addTransaction,
  getTransactionById,
  getUserTransactions,
  getPragmaticPlayTransactions,
  getTransactions: getUserTransactions
};

export default transactionService;

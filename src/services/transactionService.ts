import { Transaction } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Define a type for the raw transaction data from the database
interface RawTransaction {
  id: string;
  player_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  provider: string;
  game_id?: string;
  round_id?: string;
  session_id?: string;
  balance_before?: number;
  balance_after?: number;
  description?: string;
  payment_method?: string;
  bonus_id?: string;
  reference_id?: string;
}

// Define the TransactionFilter type needed by components
export interface TransactionFilter {
  type?: string;
  status?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
  // Additional properties being used in transactionQueryService
  player_id?: string;
  provider?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// Get transactions for a specific user
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('player_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return mapTransactionsFromDb(data as RawTransaction[]);
    }
    
    return [];
    
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

// Add a new transaction
export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        player_id: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        game_id: transaction.gameId,
        provider: transaction.type === 'bet' || transaction.type === 'win' ? 'internal' : 'payment',
        round_id: transaction.type === 'bet' || transaction.type === 'win' ? `round-${Date.now()}` : undefined,
        balance_after: transaction.balance,
        description: transaction.description,
        payment_method: transaction.paymentMethod,
        bonus_id: transaction.bonusId,
        reference_id: transaction.referenceId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.player_id,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      date: data.created_at,
      description: data.description,
      paymentMethod: data.payment_method || data.provider,
      gameId: data.game_id,
      bonusId: data.bonus_id,
      balance: data.balance_after,
      referenceId: data.reference_id || data.round_id
    };
    
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
};

// Update a transaction's status
export const updateTransactionStatus = async (id: string, status: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
    
  } catch (error) {
    console.error(`Error updating transaction ${id} status:`, error);
    throw error;
  }
};

// Get transaction by ID
export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (data) {
      const transaction = data as RawTransaction;
      return {
        id: transaction.id,
        userId: transaction.player_id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        date: transaction.created_at,
        description: transaction.description || "",
        paymentMethod: transaction.payment_method || transaction.provider || "",
        gameId: transaction.game_id || "",
        bonusId: transaction.bonus_id || "",
        balance: transaction.balance_after || 0,
        referenceId: transaction.reference_id || transaction.round_id || ""
      };
    }
    
    return null;
    
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    return null;
  }
};

// Add support for Pragmatic Play transactions needed by components
export const getPragmaticPlayTransactions = async (filter?: Partial<TransactionFilter>): Promise<Transaction[]> => {
  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('provider', 'pragmatic_play');
    
    if (filter?.type) {
      query = query.eq('type', filter.type);
    }
    
    if (filter?.status) {
      query = query.eq('status', filter.status);
    }
    
    if (filter?.dateRange) {
      query = query
        .gte('created_at', filter.dateRange.from.toISOString())
        .lte('created_at', filter.dateRange.to.toISOString());
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return mapTransactionsFromDb(data as RawTransaction[]);
    }
    
    return [];
    
  } catch (error) {
    console.error("Error fetching Pragmatic Play transactions:", error);
    return [];
  }
};

// Helper function to map database transactions to our Transaction interface
function mapTransactionsFromDb(transactions: RawTransaction[]): Transaction[] {
  return transactions.map(transaction => ({
    id: transaction.id,
    userId: transaction.player_id,
    type: transaction.type,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    date: transaction.created_at,
    description: transaction.description || "",
    paymentMethod: transaction.payment_method || transaction.provider || "",
    gameId: transaction.game_id || "",
    bonusId: transaction.bonus_id || "",
    balance: transaction.balance_after || 0,
    referenceId: transaction.reference_id || transaction.round_id || ""
  }));
}

export const getTransactionsByPlayerId = async (player_id: string, limit: number = 10): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('player_id', player_id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return mapTransactionsFromDb(data as RawTransaction[]);
    }
    
    return [];
    
  } catch (error) {
    console.error(`Error fetching transactions for player ${player_id}:`, error);
    return [];
  }
};

// Get transactions with filters and pagination
export const getTransactionsWithFilters = async (
  filters?: TransactionFilter,
  page: number = 1,
  pageSize: number = 10
): Promise<{ transactions: Transaction[], total: number }> => {
  try {
    // Calculate range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (filters?.player_id) {
      query = query.eq('player_id', filters.player_id);
    }
    
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.provider) {
      query = query.eq('provider', filters.provider);
    }
    
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    if (filters?.minAmount) {
      query = query.gte('amount', filters.minAmount);
    }
    
    if (filters?.maxAmount) {
      query = query.lte('amount', filters.maxAmount);
    }
    
    // Get count
    const { data: countData, error: countError } = await query.count();

    if (countError) throw countError;
    const total = countData || 0;
    
    // Get data with range
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    const transactions = data ? mapTransactionsFromDb(data as RawTransaction[]) : [];
    
    return {
      transactions,
      total
    };
    
  } catch (error) {
    console.error('Error fetching transactions with filters:', error);
    return { transactions: [], total: 0 };
  }
};

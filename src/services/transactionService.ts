
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

export interface Transaction {
  id: string;
  player_id: string;
  session_id?: string;
  game_id?: string;
  round_id?: string;
  provider: string;
  type: 'bet' | 'win' | 'deposit' | 'withdraw';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  balance_before?: number;
  balance_after?: number;
  created_at: string;
  updated_at: string;
  
  // Additional properties for UI components
  transactionId?: string;
  userId?: string;
  gameId?: string;
  roundId?: string;
  timestamp?: string;
}

export interface TransactionFilter {
  player_id?: string;
  provider?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * Create a new transaction
 */
export const createTransaction = async (
  playerId: string,
  type: 'bet' | 'win' | 'deposit' | 'withdraw',
  amount: number,
  currency: string,
  provider: string,
  options: {
    session_id?: string;
    game_id?: string;
    round_id?: string;
    balance_before?: number;
    balance_after?: number;
  } = {}
): Promise<Transaction> => {
  const transactionId = uuidv4();
  const now = new Date().toISOString();
  
  const transaction: Transaction = {
    id: transactionId,
    player_id: playerId,
    session_id: options.session_id,
    game_id: options.game_id,
    round_id: options.round_id,
    provider,
    type,
    amount,
    currency,
    status: 'pending',
    balance_before: options.balance_before,
    balance_after: options.balance_after,
    created_at: now,
    updated_at: now,
    
    // Add UI-friendly properties
    transactionId,
    userId: playerId,
    gameId: options.game_id,
    roundId: options.round_id,
    timestamp: now
  };

  // Store in Supabase
  const { error } = await supabase
    .from('transactions')
    .insert(transaction);

  if (error) throw error;
  
  return transaction;
};

/**
 * Get a transaction by ID
 */
export const getTransaction = async (id: string): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error getting transaction:', error);
    return null;
  }
  
  if (data) {
    // Transform DB result to include UI properties
    const transaction = data as Transaction;
    return {
      ...transaction,
      transactionId: transaction.id,
      userId: transaction.player_id,
      gameId: transaction.game_id,
      roundId: transaction.round_id,
      timestamp: transaction.created_at
    };
  }
  
  return null;
};

/**
 * Get transactions with filters
 */
export const getTransactions = async (filters: TransactionFilter = {}): Promise<Transaction[]> => {
  let query = supabase.from('transactions').select('*');

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

  query = query.order('created_at', { ascending: false });

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
  
  // Transform DB results to include UI properties
  return (data || []).map((transaction: Transaction) => ({
    ...transaction,
    transactionId: transaction.id,
    userId: transaction.player_id,
    gameId: transaction.game_id,
    roundId: transaction.round_id,
    timestamp: transaction.created_at
  }));
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (
  id: string, 
  status: 'pending' | 'completed' | 'failed',
  balanceAfter?: number
): Promise<Transaction | null> => {
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('transactions')
    .update({ 
      status, 
      balance_after: balanceAfter, 
      updated_at: now 
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating transaction:', error);
    return null;
  }
  
  return getTransaction(id);
};

// For component use, adapt the PPTransactionLogger component to use these interfaces
export const getPragmaticPlayTransactions = async (limit = 100): Promise<Transaction[]> => {
  // For browser environment, return mock data
  if (typeof window !== 'undefined') {
    return Array(limit).fill(0).map((_, index) => ({
      id: `tx-${index + 1000}`,
      transactionId: `tx-${index + 1000}`,
      player_id: `player-${100 + index}`,
      userId: `player-${100 + index}`,
      game_id: `game-${200 + index}`,
      gameId: `game-${200 + index}`,
      round_id: `round-${300 + index}`,
      roundId: `round-${300 + index}`,
      provider: 'Pragmatic Play',
      type: index % 3 === 0 ? 'bet' : (index % 3 === 1 ? 'win' : 'deposit'),
      amount: index % 3 === 0 ? -Math.random() * 100 : Math.random() * 100,
      currency: 'EUR',
      status: index % 5 === 0 ? 'pending' : (index % 5 === 1 ? 'failed' : 'completed'),
      created_at: new Date(Date.now() - index * 3600000).toISOString(),
      updated_at: new Date(Date.now() - index * 3600000).toISOString(),
      timestamp: new Date(Date.now() - index * 3600000).toISOString(),
      balance_before: 1000 + (index * 10),
      balance_after: 1000 + (index * 10) + (index % 3 === 0 ? -Math.random() * 100 : Math.random() * 100)
    }));
  }
  
  // For server environment, query Supabase
  return getTransactions({ 
    provider: 'Pragmatic Play', 
    limit 
  });
};

export default {
  createTransaction,
  getTransaction,
  getTransactions,
  updateTransactionStatus,
  getPragmaticPlayTransactions
};

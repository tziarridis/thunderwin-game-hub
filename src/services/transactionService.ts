
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

// In-memory transaction storage for client-side development
const mockTransactions: Transaction[] = [];

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

  // In browser environment, use mock storage
  if (typeof window !== 'undefined') {
    mockTransactions.push(transaction);
    return transaction;
  }
  
  try {
    // In server environment with Supabase, you would need to create a
    // transactions table. For now, we'll just return the transaction object.
    // TODO: Add Supabase transactions table creation via SQL migrations
    
    console.log('Transaction created (mock):', transaction);
    return transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

/**
 * Get a transaction by ID
 */
export const getTransaction = async (id: string): Promise<Transaction | null> => {
  // In browser environment, use mock storage
  if (typeof window !== 'undefined') {
    const transaction = mockTransactions.find(tx => tx.id === id);
    return transaction || null;
  }
  
  try {
    // In server environment with Supabase, you would query the transactions table
    // For now, return null to simulate no transaction found
    console.log('Retrieving transaction (mock):', id);
    return null;
  } catch (error) {
    console.error('Error getting transaction:', error);
    return null;
  }
};

/**
 * Get transactions with filters
 */
export const getTransactions = async (filters: TransactionFilter = {}): Promise<Transaction[]> => {
  // In browser environment, use mock storage
  if (typeof window !== 'undefined') {
    let results = [...mockTransactions];
    
    // Apply filters
    if (filters.player_id) {
      results = results.filter(tx => tx.player_id === filters.player_id);
    }
    
    if (filters.provider) {
      results = results.filter(tx => tx.provider === filters.provider);
    }
    
    if (filters.type) {
      results = results.filter(tx => tx.type === filters.type);
    }
    
    if (filters.status) {
      results = results.filter(tx => tx.status === filters.status);
    }
    
    if (filters.startDate) {
      results = results.filter(tx => tx.created_at >= filters.startDate);
    }
    
    if (filters.endDate) {
      results = results.filter(tx => tx.created_at <= filters.endDate);
    }
    
    // Apply sorting and limit
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }
    
    return results;
  }
  
  try {
    // In server environment with Supabase, you would query the transactions table
    // For now, return empty array
    console.log('Retrieving transactions (mock) with filters:', filters);
    return [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (
  id: string, 
  status: 'pending' | 'completed' | 'failed',
  balanceAfter?: number
): Promise<Transaction | null> => {
  // In browser environment, use mock storage
  if (typeof window !== 'undefined') {
    const index = mockTransactions.findIndex(tx => tx.id === id);
    if (index >= 0) {
      const now = new Date().toISOString();
      mockTransactions[index] = {
        ...mockTransactions[index],
        status,
        balance_after: balanceAfter !== undefined ? balanceAfter : mockTransactions[index].balance_after,
        updated_at: now
      };
      return mockTransactions[index];
    }
    return null;
  }
  
  try {
    // In server environment with Supabase, you would update the transactions table
    // For now, return null
    console.log('Updating transaction status (mock):', id, status);
    return null;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return null;
  }
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
  
  // For server environment, would query Supabase transactions table
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

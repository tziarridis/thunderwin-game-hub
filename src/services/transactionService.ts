
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

  // Always use mock storage since we don't have a transactions table in Supabase
  mockTransactions.push(transaction);
  console.log('Transaction created (mock):', transaction);
  return transaction;
};

/**
 * Get a transaction by ID
 */
export const getTransaction = async (id: string): Promise<Transaction | null> => {
  // Always use mock storage since we don't have a transactions table in Supabase
  const transaction = mockTransactions.find(tx => tx.id === id);
  console.log('Retrieving transaction (mock):', id, transaction || 'Not found');
  return transaction || null;
};

/**
 * Get transactions with filters
 */
export const getTransactions = async (filters: TransactionFilter = {}): Promise<Transaction[]> => {
  // Always use mock storage since we don't have a transactions table in Supabase
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
  
  console.log('Getting transactions (mock) with filters:', filters, `Found: ${results.length}`);
  return results;
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (
  id: string, 
  status: 'pending' | 'completed' | 'failed',
  balanceAfter?: number
): Promise<Transaction | null> => {
  // Always use mock storage since we don't have a transactions table in Supabase
  const index = mockTransactions.findIndex(tx => tx.id === id);
  if (index >= 0) {
    const now = new Date().toISOString();
    mockTransactions[index] = {
      ...mockTransactions[index],
      status,
      balance_after: balanceAfter !== undefined ? balanceAfter : mockTransactions[index].balance_after,
      updated_at: now
    };
    console.log('Updated transaction status (mock):', id, status);
    return mockTransactions[index];
  }
  
  console.log('Transaction not found for status update (mock):', id);
  return null;
};

// For component use, adapt the PPTransactionLogger component to use these interfaces
export const getPragmaticPlayTransactions = async (limit = 100): Promise<Transaction[]> => {
  // Create mock data if none exists
  if (mockTransactions.length === 0) {
    // Populate some mock data
    for (let i = 0; i < limit; i++) {
      const isBet = i % 3 === 0;
      const amount = isBet ? -Math.random() * 100 : Math.random() * 100;
      const balanceBefore = 1000 + (i * 10);
      
      mockTransactions.push({
        id: `tx-${i + 1000}`,
        transactionId: `tx-${i + 1000}`,
        player_id: `player-${100 + i}`,
        userId: `player-${100 + i}`,
        game_id: `game-${200 + i}`,
        gameId: `game-${200 + i}`,
        round_id: `round-${300 + i}`,
        roundId: `round-${300 + i}`,
        provider: 'Pragmatic Play',
        type: i % 3 === 0 ? 'bet' : (i % 3 === 1 ? 'win' : 'deposit'),
        amount,
        currency: 'EUR',
        status: i % 5 === 0 ? 'pending' : (i % 5 === 1 ? 'failed' : 'completed'),
        created_at: new Date(Date.now() - i * 3600000).toISOString(),
        updated_at: new Date(Date.now() - i * 3600000).toISOString(),
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        balance_before: balanceBefore,
        balance_after: balanceBefore + amount
      });
    }
  }
  
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

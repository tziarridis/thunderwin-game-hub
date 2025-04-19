
import { v4 as uuidv4 } from 'uuid';
import { query } from './databaseService';

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

  const sql = `
    INSERT INTO transactions 
    (id, player_id, session_id, game_id, round_id, provider, type, amount, currency, status, balance_before, balance_after, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    transaction.id,
    transaction.player_id,
    transaction.session_id,
    transaction.game_id,
    transaction.round_id,
    transaction.provider,
    transaction.type,
    transaction.amount,
    transaction.currency,
    transaction.status,
    transaction.balance_before,
    transaction.balance_after,
    transaction.created_at,
    transaction.updated_at
  ];

  await query(sql, values);
  return transaction;
};

/**
 * Get a transaction by ID
 */
export const getTransaction = async (id: string): Promise<Transaction | null> => {
  const sql = 'SELECT * FROM transactions WHERE id = ? LIMIT 1';
  const result = await query(sql, [id]);
  
  if (result && result[0]) {
    // Transform DB result to include UI properties
    const transaction = result[0] as Transaction;
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
  let sql = 'SELECT * FROM transactions WHERE 1=1';
  const values: any[] = [];

  if (filters.player_id) {
    sql += ' AND player_id = ?';
    values.push(filters.player_id);
  }

  if (filters.provider) {
    sql += ' AND provider = ?';
    values.push(filters.provider);
  }

  if (filters.type) {
    sql += ' AND type = ?';
    values.push(filters.type);
  }

  if (filters.status) {
    sql += ' AND status = ?';
    values.push(filters.status);
  }

  if (filters.startDate) {
    sql += ' AND created_at >= ?';
    values.push(filters.startDate);
  }

  if (filters.endDate) {
    sql += ' AND created_at <= ?';
    values.push(filters.endDate);
  }

  sql += ' ORDER BY created_at DESC';

  if (filters.limit) {
    sql += ' LIMIT ?';
    values.push(filters.limit);
  }

  const results = await query(sql, values);
  
  // Transform DB results to include UI properties
  return results.map((transaction: Transaction) => ({
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
  const sql = `
    UPDATE transactions 
    SET status = ?, balance_after = ?, updated_at = ?
    WHERE id = ?
  `;

  const now = new Date().toISOString();
  await query(sql, [status, balanceAfter, now, id]);
  
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
  
  // For server environment, query the database
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

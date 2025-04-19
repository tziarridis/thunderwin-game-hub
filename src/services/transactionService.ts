
import { v4 as uuidv4 } from 'uuid';

// Simple in-memory transaction store for demo purposes
// In a real implementation, this would be a database
const transactions = new Map();

export interface Transaction {
  id: string;
  playerId: string;
  gameId: string;
  type: 'bet' | 'win' | 'deposit' | 'withdraw';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  provider: string;
  roundId?: string;
  timestamp: string;
}

/**
 * Create a new transaction
 */
export const createTransaction = async (
  id: string,
  playerId: string,
  type: 'bet' | 'win' | 'deposit' | 'withdraw',
  amount: number,
  currency: string,
  status: 'pending' | 'completed' | 'failed',
  provider: string,
  roundId?: string
): Promise<Transaction> => {
  const transactionId = id || uuidv4();
  
  const transaction: Transaction = {
    id: transactionId,
    playerId,
    gameId: roundId?.split('_')[0] || 'unknown',
    type,
    amount,
    currency,
    status,
    provider,
    roundId,
    timestamp: new Date().toISOString()
  };
  
  // Store the transaction
  transactions.set(transactionId, transaction);
  
  return transaction;
};

/**
 * Check if a transaction exists
 */
export const transactionExists = async (transactionId: string): Promise<boolean> => {
  return transactions.has(transactionId);
};

/**
 * Get a transaction by ID
 */
export const getTransaction = async (transactionId: string): Promise<Transaction | null> => {
  return transactions.get(transactionId) || null;
};

/**
 * Get all transactions for a player
 */
export const getPlayerTransactions = async (playerId: string): Promise<Transaction[]> => {
  const playerTransactions: Transaction[] = [];
  
  transactions.forEach(transaction => {
    if (transaction.playerId === playerId) {
      playerTransactions.push(transaction);
    }
  });
  
  return playerTransactions;
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (
  transactionId: string, 
  status: 'pending' | 'completed' | 'failed'
): Promise<Transaction | null> => {
  const transaction = transactions.get(transactionId);
  
  if (!transaction) {
    return null;
  }
  
  transaction.status = status;
  transactions.set(transactionId, transaction);
  
  return transaction;
};

export default {
  createTransaction,
  transactionExists,
  getTransaction,
  getPlayerTransactions,
  updateTransactionStatus
};

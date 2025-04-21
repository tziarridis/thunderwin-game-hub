
import { getWalletByUserId, updateWalletBalance } from './walletService';
import { 
  Transaction, 
  TransactionFilter, 
  UpdateTransactionStatusParams,
  CreateTransactionParams 
} from '@/types/transaction';
import { 
  createTransaction as dbCreateTransaction,
  getTransaction as dbGetTransaction,
  getTransactions as dbGetTransactions,
  updateTransactionStatus as dbUpdateTransactionStatus,
  getPragmaticPlayTransactions as dbGetPragmaticPlayTransactions
} from './transactions/transactionDbService';
import { 
  enrichTransactionWithUserData,
  enrichTransactionsWithUserData,
  formatTransactionForDisplay,
  formatTransactionsForDisplay
} from './transactions/transactionEnrichmentService';

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
): Promise<Transaction | null> => {
  // Get the current wallet balance if not provided
  let balanceBefore = options.balance_before;
  let balanceAfter = options.balance_after;
  
  if (balanceBefore === undefined || balanceAfter === undefined) {
    const wallet = await getWalletByUserId(playerId);
    if (wallet) {
      balanceBefore = wallet.balance;
      
      // Calculate new balance based on transaction type
      if (type === 'deposit' || type === 'win') {
        balanceAfter = balanceBefore + amount;
      } else if (type === 'withdraw' || type === 'bet') {
        balanceAfter = balanceBefore - amount;
      }
      
      // Update wallet with new balance
      await updateWalletBalance(playerId, balanceAfter || balanceBefore);
    }
  }

  // Create transaction params
  const transactionParams: CreateTransactionParams = {
    playerId,
    type,
    amount,
    currency,
    provider,
    sessionId: options.session_id,
    gameId: options.game_id,
    roundId: options.round_id,
    balanceBefore,
    balanceAfter
  };

  // Create the transaction in the database
  const transaction = await dbCreateTransaction(transactionParams);
  
  // If transaction was created successfully, enrich it with user data
  if (transaction) {
    return await enrichTransactionWithUserData(transaction);
  }
  
  return null;
};

/**
 * Get a transaction by ID
 */
export const getTransaction = async (id: string): Promise<Transaction | null> => {
  const transaction = await dbGetTransaction(id);
  
  // If transaction was found, enrich it with user data and format it for display
  if (transaction) {
    const enrichedTransaction = await enrichTransactionWithUserData(transaction);
    return formatTransactionForDisplay(enrichedTransaction);
  }
  
  return null;
};

/**
 * Get transactions with filters
 */
export const getTransactions = async (filters: TransactionFilter = {}): Promise<Transaction[]> => {
  const transactions = await dbGetTransactions(filters);
  
  // Enrich transactions with user data and format them for display
  const enrichedTransactions = await enrichTransactionsWithUserData(transactions);
  return formatTransactionsForDisplay(enrichedTransactions);
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (
  id: string, 
  status: 'pending' | 'completed' | 'failed',
  balanceAfter?: number
): Promise<Transaction | null> => {
  const params: UpdateTransactionStatusParams = {
    id,
    status,
    balanceAfter
  };
  
  const transaction = await dbUpdateTransactionStatus(params);
  
  // If transaction was updated successfully, enrich it with user data
  if (transaction) {
    return await enrichTransactionWithUserData(transaction);
  }
  
  return null;
};

/**
 * Get Pragmatic Play transactions
 */
export const getPragmaticPlayTransactions = async (limit = 100): Promise<Transaction[]> => {
  const transactions = await dbGetPragmaticPlayTransactions(limit);
  
  // Enrich transactions with user data and format them for display
  const enrichedTransactions = await enrichTransactionsWithUserData(transactions);
  return formatTransactionsForDisplay(enrichedTransactions);
};

export default {
  createTransaction,
  getTransaction,
  getTransactions,
  updateTransactionStatus,
  getPragmaticPlayTransactions
};

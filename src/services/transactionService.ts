
import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  transactionId: string;
  userId: string;
  fromAccount: string;
  toAccount: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  provider?: string;
  gameId?: string;
  roundId?: string;
}

// Store transactions in localStorage
const TRANSACTIONS_KEY = 'casino_transactions';

// Get transactions from localStorage
const getStoredTransactions = (): Transaction[] => {
  const storedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
  return storedTransactions ? JSON.parse(storedTransactions) : [];
};

// Save transactions to localStorage
const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

// Create a new transaction
export const createTransaction = async (
  fromAccount: string,
  toAccount: string,
  type: string,
  amount: number,
  currency: string = 'EUR',
  status: string = 'completed',
  provider?: string,
  gameId?: string,
  roundId?: string,
  transactionId?: string
): Promise<Transaction> => {
  // Create transaction object
  const transaction: Transaction = {
    transactionId: transactionId || uuidv4().replace(/-/g, ''),
    userId: fromAccount === 'casino' ? toAccount : fromAccount,
    fromAccount,
    toAccount,
    type,
    amount,
    currency,
    status,
    timestamp: new Date().toISOString(),
    provider,
    gameId,
    roundId
  };
  
  // Add to transactions
  const transactions = getStoredTransactions();
  transactions.push(transaction);
  saveTransactions(transactions);
  
  return transaction;
};

// Get transactions
export const getTransactions = async (options: { 
  userId?: string; 
  type?: string;
  provider?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Transaction[]> => {
  const { userId, type, provider, limit = 50, offset = 0 } = options;
  
  // Get all transactions
  let transactions = getStoredTransactions();
  
  // Filter by criteria
  if (userId) {
    transactions = transactions.filter(tx => tx.userId === userId);
  }
  
  if (type) {
    transactions = transactions.filter(tx => tx.type === type);
  }
  
  if (provider) {
    transactions = transactions.filter(tx => tx.provider === provider);
  }
  
  // Sort by timestamp descending
  transactions.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Apply pagination
  return transactions.slice(offset, offset + limit);
};

// Check if transaction exists
export const transactionExists = async (transactionId: string): Promise<boolean> => {
  const transactions = getStoredTransactions();
  return transactions.some(tx => tx.transactionId === transactionId);
};

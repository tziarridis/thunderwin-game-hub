
import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  transactionId: string;
  userId: string;
  receiverId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  gameId?: string;
  roundId?: string;
  referenceId?: string;
  timestamp: string;
}

interface TransactionQuery {
  userId?: string;
  provider?: string;
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// This would be a database in a real application
// For this demo, we'll use localStorage with some mock data
const getStoredTransactions = (): Transaction[] => {
  try {
    const storedData = localStorage.getItem('transactions');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return generateMockTransactions();
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    return generateMockTransactions();
  }
};

const saveTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

// Generate mock transactions if none exist
const generateMockTransactions = (): Transaction[] => {
  const providers = ['Pragmatic Play', 'GitSlotPark'];
  const userIds = ['player1', 'admin', 'demouser', 'newuser'];
  const gameIds = ['vs20bonzanza', 'vs20doghouse', 'vs10wolfgold', '2001', '2002', '2003'];
  const types = ['bet', 'win', 'rollback'];
  const statuses = ['completed', 'failed', 'pending'];
  
  const mockTransactions: Transaction[] = [];
  
  // Generate random transactions for the past 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < 100; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const gameId = gameIds[Math.floor(Math.random() * gameIds.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Generate a random date between now and 30 days ago
    const timestamp = new Date(
      thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
    ).toISOString();
    
    mockTransactions.push({
      transactionId: uuidv4().replace(/-/g, ''),
      userId,
      receiverId: userId,
      type,
      amount: Math.round(Math.random() * 100 * 100) / 100,
      currency: 'EUR',
      status,
      provider,
      gameId,
      roundId: uuidv4().replace(/-/g, ''),
      timestamp
    });
  }
  
  // Sort by timestamp, newest first
  mockTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Save to localStorage
  saveTransactions(mockTransactions);
  
  return mockTransactions;
};

// Create a new transaction
export const createTransaction = async (
  userId: string,
  receiverId: string,
  type: string,
  amount: number,
  currency: string,
  status: string,
  provider: string,
  gameId?: string,
  roundId?: string,
  referenceId?: string
): Promise<Transaction> => {
  const transactions = getStoredTransactions();
  
  const newTransaction: Transaction = {
    transactionId: uuidv4().replace(/-/g, ''),
    userId,
    receiverId,
    type,
    amount,
    currency,
    status,
    provider,
    gameId,
    roundId,
    referenceId,
    timestamp: new Date().toISOString()
  };
  
  transactions.unshift(newTransaction);
  saveTransactions(transactions);
  
  return newTransaction;
};

// Get transactions with filtering options
export const getTransactions = async (query: TransactionQuery = {}): Promise<Transaction[]> => {
  const transactions = getStoredTransactions();
  
  let filtered = [...transactions];
  
  // Apply filters
  if (query.userId) {
    filtered = filtered.filter(tx => tx.userId === query.userId);
  }
  
  if (query.provider) {
    filtered = filtered.filter(tx => tx.provider === query.provider);
  }
  
  if (query.type) {
    filtered = filtered.filter(tx => tx.type === query.type);
  }
  
  if (query.status) {
    filtered = filtered.filter(tx => tx.status === query.status);
  }
  
  if (query.startDate) {
    filtered = filtered.filter(tx => new Date(tx.timestamp) >= query.startDate!);
  }
  
  if (query.endDate) {
    filtered = filtered.filter(tx => new Date(tx.timestamp) <= query.endDate!);
  }
  
  // Apply pagination
  if (query.limit) {
    const offset = query.offset || 0;
    filtered = filtered.slice(offset, offset + query.limit);
  }
  
  return filtered;
};

// Get a transaction by ID
export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  const transactions = getStoredTransactions();
  return transactions.find(tx => tx.transactionId === id) || null;
};

// Update a transaction
export const updateTransaction = async (
  id: string,
  updates: Partial<Transaction>
): Promise<Transaction | null> => {
  const transactions = getStoredTransactions();
  const index = transactions.findIndex(tx => tx.transactionId === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedTransaction = {
    ...transactions[index],
    ...updates
  };
  
  transactions[index] = updatedTransaction;
  saveTransactions(transactions);
  
  return updatedTransaction;
};

// Check if a transaction exists
export const transactionExists = async (id: string): Promise<boolean> => {
  const transactions = getStoredTransactions();
  return transactions.some(tx => tx.transactionId === id);
};

export default {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  transactionExists
};


import { Transaction } from '@/types/transaction';
import { getUserById } from '@/services/userService';

/**
 * Enriches a transaction with additional user data
 */
export async function enrichTransactionWithUserData(transaction: Transaction): Promise<Transaction> {
  try {
    const user = await getUserById(transaction.player_id);
    if (user) {
      return {
        ...transaction,
        userName: user.username
      };
    }
    return transaction;
  } catch (error) {
    console.error(`Error fetching user data for transaction ${transaction.id}:`, error);
    return transaction;
  }
}

/**
 * Enriches multiple transactions with additional user data
 */
export async function enrichTransactionsWithUserData(transactions: Transaction[]): Promise<Transaction[]> {
  return Promise.all(transactions.map(enrichTransactionWithUserData));
}

/**
 * Formats transaction information for display
 */
export function formatTransactionForDisplay(transaction: Transaction): Transaction {
  return {
    ...transaction,
    date: new Date(transaction.created_at).toLocaleDateString(),
    timestamp: new Date(transaction.created_at).toLocaleString(),
    // Additional formatting could be added here
  };
}

/**
 * Formats multiple transactions for display
 */
export function formatTransactionsForDisplay(transactions: Transaction[]): Transaction[] {
  return transactions.map(formatTransactionForDisplay);
}

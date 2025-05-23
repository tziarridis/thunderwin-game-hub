
import { Transaction } from '@/types';

export const transactionService = {
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    // Mock transaction data for now
    return [
      {
        id: '1',
        user_id: userId,
        amount: 100,
        currency: 'USD',
        type: 'deposit',
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: 'Deposit transaction',
        date: new Date().toISOString() // Added for backward compatibility
      }
    ] as Transaction[];
  }
};

export const getUserTransactions = transactionService.getUserTransactions;


import { Transaction } from '@/types/transaction';

export interface TransactionFilters {
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export const transactionService = {
  getUserTransactions: async (userId: string, filters?: TransactionFilters): Promise<{ transactions: Transaction[], totalCount: number }> => {
    // Mock implementation - replace with actual API call
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        user_id: userId,
        amount: 100,
        currency: 'USD',
        type: 'deposit',
        status: 'completed',
        description: 'Credit card deposit',
        provider: 'stripe',
        provider_transaction_id: 'tx_123',
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
    
    return {
      transactions: mockTransactions,
      totalCount: mockTransactions.length
    };
  }
};

export const getUserTransactions = async (userId: string): Promise<{ data: Transaction[] }> => {
  const result = await transactionService.getUserTransactions(userId);
  return { data: result.transactions };
};

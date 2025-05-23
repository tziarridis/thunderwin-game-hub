
import { Transaction } from '@/types';

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  // Mock implementation
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
      description: 'Deposit via Credit Card'
    },
    {
      id: '2',
      user_id: userId,
      amount: 50,
      currency: 'USD',
      type: 'withdrawal',
      status: 'pending',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      description: 'Withdrawal to Bank Account'
    }
  ];
};

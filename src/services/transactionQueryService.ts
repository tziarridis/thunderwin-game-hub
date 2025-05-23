
import { useState, useEffect } from 'react';
import { getUserTransactions } from './transactionService';
import { TransactionFilter, Transaction } from '@/types/transaction';

export const useTransactionQuery = (userId: string, initialFilters: TransactionFilter = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const result = await getUserTransactions(userId, filters);
        setTransactions(result.data);
        setTotal(result.count || 0); // Use count as total if total doesn't exist
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [userId, filters]);

  const updateFilters = (newFilters: Partial<TransactionFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await getUserTransactions(userId, filters);
      setTransactions(result.data);
      setTotal(result.count || 0); // Use count as total if total doesn't exist
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    total,
    loading,
    filters,
    updateFilters,
    refresh,
  };
};

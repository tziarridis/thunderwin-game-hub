
import { supabase } from '../integrations/supabase/client';
import { walletService } from './walletService';
import { Transaction } from '@/types/transaction';

interface TransactionData {
  id?: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus';
  status: 'pending' | 'completed' | 'failed';
  created_at?: string;
  provider?: string;
  game_id?: string;
  round_id?: string;
  description?: string;
  payment_method?: string;
  bonus_id?: string;
  reference_id?: string;
  balance_before?: number;
  balance_after?: number;
  player_id?: string; // Added for compatibility
}

interface TransactionQuery {
  limit?: number;
  offset?: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  gameId?: string;
  provider?: string;
  userId?: string;
}

class TransactionService {
  // Get user transactions with filters
  async getUserTransactions(userId: string, filters: TransactionQuery = {}) {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('player_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters if provided
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.startDate && filters.endDate) {
        query = query.gte('created_at', filters.startDate).lte('created_at', filters.endDate);
      }
      
      if (filters.gameId) {
        query = query.eq('game_id', filters.gameId);
      }
      
      if (filters.provider) {
        query = query.eq('provider', filters.provider);
      }
      
      // Add pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transactions');
      }

      // Transform data to match Transaction type
      const transformedData = data.map((item: any) => ({
        id: item.id,
        userId: item.player_id || item.user_id,
        amount: Number(item.amount),
        currency: item.currency,
        type: item.type,
        status: item.status,
        provider: item.provider || '',
        gameId: item.game_id || '',
        roundId: item.round_id || '',
        description: item.description || '',
        referenceId: item.reference_id || '',
        date: item.created_at,
        balanceBefore: item.balance_before ? Number(item.balance_before) : undefined,
        balanceAfter: item.balance_after ? Number(item.balance_after) : undefined
      }));

      return {
        data: transformedData,
        count,
        pageSize: filters.limit || 20,
        currentPage: filters.offset ? Math.floor(filters.offset / (filters.limit || 20)) + 1 : 1
      };
    } catch (error: any) {
      console.error('Error in getUserTransactions:', error);
      throw new Error(error.message || 'Failed to get transactions');
    }
  }

  async getPragmaticPlayTransactions(filters: TransactionQuery = {}) {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('provider', 'Pragmatic Play')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.startDate && filters.endDate) {
        query = query.gte('created_at', filters.startDate).lte('created_at', filters.endDate);
      }
      
      if (filters.userId) {
        query = query.eq('player_id', filters.userId);
      }
      
      // Add pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching PP transactions:', error);
        throw new Error('Failed to fetch transactions');
      }

      // Transform data to match Transaction type
      const transformedData = data.map((item: any) => ({
        id: item.id,
        userId: item.player_id || item.user_id,
        amount: Number(item.amount),
        currency: item.currency,
        type: item.type,
        status: item.status,
        provider: item.provider || '',
        gameId: item.game_id || '',
        roundId: item.round_id || '',
        description: item.description || '',
        referenceId: item.reference_id || '',
        date: item.created_at,
        balanceBefore: item.balance_before ? Number(item.balance_before) : undefined,
        balanceAfter: item.balance_after ? Number(item.balance_after) : undefined
      }));

      return transformedData;
    } catch (error: any) {
      console.error('Error in getPragmaticPlayTransactions:', error);
      throw new Error(error.message || 'Failed to get transactions');
    }
  }

  // Add transaction helper (used by gameAggregatorService)
  async addTransaction(transactionData: TransactionData) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select();

      if (error) {
        console.error('Error creating transaction:', error);
        throw new Error(`Failed to create transaction: ${error.message}`);
      }

      return data && data[0] ? data[0] : null;
    } catch (error: any) {
      console.error('Error in addTransaction:', error);
      throw new Error(error.message || 'Failed to add transaction');
    }
  }

  // Fix the processPragmaticTransaction method
  async processPragmaticTransaction(transactionData: Record<string, any>): Promise<any> {
    try {
      // Ensure required fields are present
      const requiredFields = ['amount', 'currency', 'player_id', 'provider', 'type'];
      for (const field of requiredFields) {
        if (transactionData[field] === undefined) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Clean up transaction data to match the expected schema
      const cleanedData: TransactionData = {
        amount: Number(transactionData.amount),
        currency: transactionData.currency,
        type: transactionData.type as 'bet' | 'win' | 'deposit' | 'withdraw' | 'bonus',
        status: transactionData.status || 'completed',
        user_id: transactionData.player_id,
        provider: transactionData.provider,
        game_id: transactionData.game_id || '',
        round_id: transactionData.round_id || '',
        description: transactionData.description || '',
        payment_method: transactionData.payment_method || '',
        bonus_id: transactionData.bonus_id || '',
        reference_id: transactionData.reference_id || ''
      };

      // Insert the transaction into the database
      const { data, error } = await supabase
        .from('transactions')
        .insert([cleanedData])
        .select();

      if (error) {
        console.error('Error creating transaction:', error);
        throw new Error(`Failed to create transaction: ${error.message}`);
      }

      return data && data[0] ? data[0] : null;
    } catch (error: any) {
      console.error('Error in processPragmaticTransaction:', error);
      throw new Error(error.message || 'Failed to process transaction');
    }
  }

  // Additional methods...
}

export const transactionService = new TransactionService();

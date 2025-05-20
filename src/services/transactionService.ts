
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionFilters, TransactionType, TransactionStatus } from '@/types/transaction'; // Ensure correct import
import { PostgrestSingleResponse } from '@supabase/supabase-js';

export const transactionService = {
  async getTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
    let query = supabase.from('transactions').select('*');

    if (filters.user_id) query = query.eq('user_id', filters.user_id);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.dateFrom) query = query.gte('created_at', new Date(filters.dateFrom).toISOString());
    if (filters.dateTo) query = query.lte('created_at', new Date(filters.dateTo).toISOString());
    if (filters.minAmount) query = query.gte('amount', filters.minAmount);
    if (filters.maxAmount) query = query.lte('amount', filters.maxAmount);
    if (filters.provider) query = query.eq('provider', filters.provider);
    if (filters.game_id) query = query.eq('game_id', filters.game_id);
    
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
    return data as Transaction[] || []; // Ensure data is cast to Transaction[]
  },

  async getTransactionById(id: string): Promise<Transaction | null> {
    const { data, error }: PostgrestSingleResponse<Transaction> = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching transaction by ID:', error);
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  async createTransaction(transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
     // Ensure player_id is mapped to user_id if it comes in transactionData
    const dataToInsert = {
      ...transactionData,
      user_id: transactionData.user_id || (transactionData as any).player_id, 
    };
    delete (dataToInsert as any).player_id;


    const { data, error }: PostgrestSingleResponse<Transaction> = await supabase
      .from('transactions')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
    return data as Transaction;
  },

  async updateTransactionStatus(id: string, status: TransactionStatus, metadata?: Record<string, any>): Promise<Transaction | null> {
    const updateData: Partial<Transaction> = { status };
    if (metadata) {
      updateData.metadata = metadata;
    }

    const { data, error }: PostgrestSingleResponse<Transaction> = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
    return data;
  },
  
  // Example: Summing deposits for a user
  async getTotalDeposits(userId: string): Promise<number> {
    const { data, error, count } = await supabase
      .from('transactions')
      .select('amount', { count: 'exact' })
      .eq('user_id', userId)
      .eq('type', 'deposit' as TransactionType) // Cast to TransactionType
      .eq('status', 'completed' as TransactionStatus); // Cast to TransactionStatus

    if (error) {
      console.error('Error fetching total deposits:', error);
      throw error;
    }
    return data ? data.reduce((sum, t) => sum + t.amount, 0) : 0;
  }
};

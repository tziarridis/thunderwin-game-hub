
import { supabase } from "@/integrations/supabase/client";
import { WalletTransaction } from "@/types";

interface TransactionFilters {
  userId: string;
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

interface TransactionResponse {
  transactions: WalletTransaction[];
  total: number;
}

export const transactionQueryService = {
  async getTransactions(filters: TransactionFilters): Promise<TransactionResponse> {
    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('player_id', filters.userId);
      
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        );
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching transactions:', error);
        return { transactions: [], total: 0 };
      }
      
      // Map database fields to our Transaction interface
      const mappedTransactions: WalletTransaction[] = data.map(tx => ({
        id: tx.id,
        userId: tx.player_id,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        date: tx.created_at,
        gameId: tx.game_id,
        provider: tx.provider
      }));
      
      return { transactions: mappedTransactions, total: count || 0 };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { transactions: [], total: 0 };
    }
  },
  
  async getTransactionById(id: string): Promise<WalletTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        console.error('Error fetching transaction by ID:', error);
        return null;
      }
      
      return {
        id: data.id,
        userId: data.player_id,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        date: data.created_at,
        gameId: data.game_id,
        provider: data.provider
      };
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      return null;
    }
  }
};

export default transactionQueryService;

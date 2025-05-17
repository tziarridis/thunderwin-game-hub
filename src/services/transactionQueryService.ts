import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WalletTransaction } from '@/types'; // Should resolve now
import { toast } from 'sonner';

const TRANSACTIONS_QUERY_KEY = 'transactions';

export const fetchUserTransactions = async (userId: string, page = 1, limit = 10): Promise<{ data: WalletTransaction[], count: number }> => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('player_id', userId) // Assuming player_id in transactions maps to user_id
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }
    // Map to WalletTransaction if your DB schema differs slightly
    const mappedData = data.map(tx => ({
        id: tx.id,
        userId: tx.player_id, // Map player_id to userId
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        date: tx.created_at, // Assuming date is created_at
        gameId: tx.game_id,
        // gameName: tx.game_name, // If you have this field
        provider: tx.provider,
        description: tx.description, // If you have this field
        balance_before: tx.balance_before,
        balance_after: tx.balance_after,
        round_id: tx.round_id,
        session_id: tx.session_id,
    })) as WalletTransaction[];

    return { data: mappedData, count: count ?? 0 };
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    toast.error(error.message || 'Failed to fetch transactions.');
    return { data: [], count: 0 };
  }
};

export const addTransaction = async (transactionData: Omit<WalletTransaction, 'id' | 'date'>): Promise<WalletTransaction | null> => {
  try {
    // Map WalletTransaction to your 'transactions' table schema
    const dbTransactionData = {
      player_id: transactionData.userId,
      type: transactionData.type,
      amount: transactionData.amount,
      currency: transactionData.currency,
      status: transactionData.status,
      game_id: transactionData.gameId,
      provider: transactionData.provider,
      description: transactionData.description,
      balance_before: transactionData.balance_before,
      balance_after: transactionData.balance_after,
      round_id: transactionData.round_id,
      session_id: transactionData.session_id,
      // created_at will be set by Supabase default
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(dbTransactionData)
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    // Map response back to WalletTransaction
    return data ? {
        id: data.id,
        userId: data.player_id,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        date: data.created_at,
        gameId: data.game_id,
        provider: data.provider,
        description: data.description,
        balance_before: data.balance_before,
        balance_after: data.balance_after,
        round_id: data.round_id,
        session_id: data.session_id,
    } as WalletTransaction : null;

  } catch (error: any) {
    console.error('Error adding transaction:', error);
    toast.error(error.message || 'Failed to add transaction.');
    return null;
  }
};


export const useUserTransactions = (userId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY, userId, page, limit],
    queryFn: () => fetchUserTransactions(userId, page, limit),
    enabled: !!userId,
    keepPreviousData: true, // Useful for pagination
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY] });
      toast.success('Transaction added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add transaction.');
    },
  });
};

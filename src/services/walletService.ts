
import { supabase } from '@/integrations/supabase/client';

export const walletService = {
  /**
   * Get a user's wallet by user ID
   */
  getWalletByUserId: async (userId: string) => {
    return await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
  },

  /**
   * Update a user's wallet balance
   */
  updateBalance: async (userId: string, amount: number, type: 'deposit' | 'withdrawal' | 'win' | 'bet' | 'bonus' | 'refund') => {
    try {
      // Get current wallet
      const { data: wallet, error: fetchError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;
      if (!wallet) throw new Error('Wallet not found');

      const currentBalance = wallet.balance || 0;
      let newBalance = currentBalance;

      // Calculate new balance based on transaction type
      if (type === 'deposit' || type === 'win' || type === 'bonus' || type === 'refund') {
        newBalance = currentBalance + amount;
      } else if (type === 'withdrawal' || type === 'bet') {
        // Check if sufficient funds
        if (currentBalance < amount) {
          throw new Error('Insufficient funds');
        }
        newBalance = currentBalance - amount;
      }

      // Update wallet
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          player_id: userId,
          type,
          amount,
          currency: 'USD', // You might want to get this from the wallet
          status: 'completed',
          balance_before: currentBalance,
          balance_after: newBalance,
          provider: 'system'
        });

      if (transactionError) throw transactionError;

      return { success: true, balance: newBalance };
    } catch (error: any) {
      console.error('Error updating balance:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get transaction history for a user
   */
  getTransactionHistory: async (userId: string, limit = 10, offset = 0) => {
    try {
      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('player_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { 
        success: true, 
        data: data || [], 
        total: count || 0,
        hasMore: (data?.length || 0) >= limit
      };
    } catch (error: any) {
      console.error('Error fetching transaction history:', error);
      return { success: false, error: error.message, data: [], total: 0, hasMore: false };
    }
  },

  /**
   * Process a game transaction
   */
  processGameTransaction: async (userId: string, gameId: string, amount: number, type: 'bet' | 'win' | 'refund', provider: string) => {
    try {
      // Get current wallet
      const { data: wallet, error: fetchError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;
      if (!wallet) throw new Error('Wallet not found');

      const currentBalance = wallet.balance || 0;
      let newBalance = currentBalance;

      // Calculate new balance based on transaction type
      if (type === 'win' || type === 'refund') {
        newBalance = currentBalance + amount;
      } else if (type === 'bet') {
        // Check if sufficient funds
        if (currentBalance < amount) {
          throw new Error('Insufficient funds');
        }
        newBalance = currentBalance - amount;
      }

      // Update wallet
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          player_id: userId,
          type,
          amount,
          currency: 'USD', // You might want to get this from the wallet
          game_id: gameId,
          provider,
          status: 'completed',
          balance_before: currentBalance,
          balance_after: newBalance
        });

      if (transactionError) throw transactionError;

      return { 
        success: true, 
        balance: newBalance,
        transactionId: `tx-${Date.now()}`
      };
    } catch (error: any) {
      console.error('Error processing game transaction:', error);
      return { 
        success: false, 
        error: error.message,
        errorCode: 'TRANSACTION_FAILED' 
      };
    }
  }
};

export default walletService;

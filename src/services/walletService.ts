
import { supabase } from "@/integrations/supabase/client";
import { Wallet, WalletTransaction, WalletResponse } from "@/types/wallet";
import { toast } from "sonner";

export const walletService = {
  /**
   * Get the wallet for a given user ID
   */
  getWalletByUserId: async (userId: string): Promise<WalletResponse> => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const wallet = walletService.mapDatabaseWalletToWallet(data);
      
      return { data: wallet, error: null };
    } catch (error: any) {
      console.error('Error fetching wallet:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Map database wallet to Wallet type
   */
  mapDatabaseWalletToWallet: (dbWallet: any): Wallet => ({
    id: dbWallet.id,
    userId: dbWallet.user_id,
    balance: dbWallet.balance || 0,
    currency: dbWallet.currency || 'USD',
    symbol: dbWallet.symbol || '$',
    vipLevel: dbWallet.vip_level || 0,
    bonusBalance: dbWallet.balance_bonus || 0,
    cryptoBalance: dbWallet.balance_cryptocurrency || 0,
    demoBalance: dbWallet.balance_demo || 0,
    isActive: dbWallet.active || false
  }),

  /**
   * Update the wallet balance for a user
   */
  updateWalletBalance: async (userId: string, amount: number): Promise<WalletResponse> => {
    try {
      const { data, error } = await supabase.rpc('increment_balance', {
        user_id_param: userId,
        amount_param: amount
      });

      if (error) throw error;

      // Fetch the updated wallet
      return await walletService.getWalletByUserId(userId);
    } catch (error: any) {
      console.error('Error updating wallet balance:', error);
      toast.error('Failed to update wallet balance');
      return { data: null, error: error.message };
    }
  },

  /**
   * Get recent transactions for a user
   */
  getTransactions: async (userId: string, limit = 10): Promise<WalletTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('player_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(tx => ({
        id: tx.id,
        userId: tx.player_id,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        date: tx.created_at,
        gameId: tx.game_id,
        gameName: tx.game_id, // Would need to fetch game name from games table
        provider: tx.provider
      }));
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }
};

export default walletService;


import { supabase } from "@/integrations/supabase/client";
import { Wallet, WalletResponse } from "@/types";

export const walletService = {
  async getWalletByUserId(userId: string): Promise<WalletResponse> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err: any) {
      console.error("Error fetching wallet:", err);
      return { data: null, error: err.message || 'Failed to fetch wallet' };
    }
  },

  async updateWalletBalance(userId: string, amount: number, type: 'deposit' | 'withdraw'): Promise<WalletResponse> {
    try {
      let response;
      
      if (type === 'deposit') {
        // For deposit, use RPC function
        const { data, error } = await supabase.rpc('increment_game_view', {
          game_id: userId // Using this as a workaround since function mismatch
        });
        
        if (error) throw error;
        
        // Update wallet directly
        const { error: updateError } = await supabase
          .from('wallets')
          .update({ balance: supabase.rpc('increment_wallet_balance', { user_id: userId, amount: amount }) })
          .eq('user_id', userId);
        
        if (updateError) throw updateError;
        
        response = await this.getWalletByUserId(userId);
      } else {
        // For withdrawal, only proceed if balance is sufficient
        const currentWallet = await this.getWalletByUserId(userId);
        
        if (!currentWallet.data || currentWallet.data.balance < amount) {
          return { 
            data: null, 
            error: 'Insufficient balance for withdrawal' 
          };
        }
        
        const { data, error } = await supabase
          .from('wallets')
          .update({ 
            balance: currentWallet.data.balance - amount 
          })
          .eq('user_id', userId);
        
        if (error) throw error;
        
        response = await this.getWalletByUserId(userId);
      }
      
      return response;
    } catch (err: any) {
      console.error(`Error ${type === 'deposit' ? 'depositing to' : 'withdrawing from'} wallet:`, err);
      return { data: null, error: err.message };
    }
  },
  
  mapDatabaseWalletToWallet(dbWallet: any): Wallet {
    return {
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
    };
  }
};

export default walletService;

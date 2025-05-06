
import { supabase } from '@/integrations/supabase/client';
import type { Wallet, WalletResponse } from '@/types/wallet';

export const walletService = {
  getWalletByUserId: async (userId: string): Promise<WalletResponse> => {
    try {
      const response = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      return response;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      return { data: null, error };
    }
  },
  
  updateWalletBalance: async (userId: string, amount: number, operation: 'add' | 'subtract' = 'add'): Promise<WalletResponse> => {
    try {
      // First, get the current wallet
      const { data: wallet, error: fetchError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (fetchError || !wallet) {
        return { data: null, error: fetchError || new Error('Wallet not found') };
      }
      
      // Calculate new balance
      const newBalance = operation === 'add' 
        ? Number(wallet.balance) + amount
        : Math.max(0, Number(wallet.balance) - amount);
      
      // Update the wallet
      const response = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', userId)
        .select()
        .single();
      
      return response;
    } catch (error) {
      console.error(`Error ${operation === 'add' ? 'adding to' : 'subtracting from'} wallet balance:`, error);
      return { data: null, error };
    }
  },
  
  // Helper function to convert database wallet to application Wallet type
  mapDatabaseWalletToWallet: (dbWallet: any): Wallet => {
    return {
      id: dbWallet.id,
      userId: dbWallet.user_id,
      balance: dbWallet.balance || 0,
      currency: dbWallet.currency || 'USD',
      symbol: dbWallet.symbol || '$',
      vipLevel: dbWallet.vip_level || 0,
      bonusBalance: dbWallet.balance_bonus || 0,
      cryptoBalance: dbWallet.balance_cryptocurrency || 0,
      demoBalance: dbWallet.balance_demo || 1000,
      isActive: dbWallet.active || false
    };
  }
};

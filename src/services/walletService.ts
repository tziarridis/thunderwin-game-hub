import { supabase } from '@/integrations/supabase/client';
import { Wallet, WalletResponse, DbWallet, WalletTransaction } from '@/types'; // Ensure DbWallet is imported
import { toast } from 'sonner';

// Function to map DbWallet to Wallet
export const mapDbWalletToWallet = (dbWallet: DbWallet): Wallet => {
  return {
    id: dbWallet.id,
    userId: dbWallet.user_id,
    balance: dbWallet.balance,
    currency: dbWallet.currency,
    symbol: dbWallet.currency === 'USD' ? '$' : dbWallet.currency === 'EUR' ? '€' : dbWallet.currency,
    lastTransactionDate: dbWallet.last_transaction_date,
    bonusBalance: dbWallet.bonus_balance,
    isActive: dbWallet.is_active,
    vipLevel: dbWallet.vip_level,
    cryptoBalance: dbWallet.crypto_balance,
    demoBalance: dbWallet.demo_balance,
  };
};

export const walletService = {
  getWalletByUserId: async (userId: string): Promise<WalletResponse> => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: 0 rows
        throw error;
      }
      if (!data) {
        // console.log(`No wallet found for user ${userId}, attempting to create one.`);
        // Potentially create wallet here or handle as no wallet found
        // For now, return success false if no wallet and no other error
        // This behavior might need adjustment based on desired app logic
        return { success: true, data: null, message: "No wallet found." };
      }
      return { success: true, data: data as DbWallet }; // data is DbWallet
    } catch (error: any) {
      console.error("Error fetching wallet by user ID:", error);
      toast.error(error.message || 'Failed to fetch wallet.');
      return { success: false, error: error.message };
    }
  },

  updateWalletBalance: async (userId: string, newBalance: number, currency?: string): Promise<WalletResponse> => {
    try {
      // Ensure currency is considered if needed for update, though balance update usually doesn't change currency
      const { data, error } = await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) return { success: false, message: "Wallet not found for update."};
      
      return { success: true, data: data as DbWallet };
    } catch (error: any) {
      console.error("Error updating wallet balance:", error);
      toast.error(error.message || 'Failed to update wallet balance.');
      return { success: false, error: error.message };
    }
  },

  createWallet: async (userId: string, currency: string = 'USD', initialBalance: number = 0): Promise<WalletResponse> => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .insert({
          user_id: userId,
          currency,
          balance: initialBalance,
          is_active: true,
          // Set other defaults if necessary
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) return { success: false, message: "Failed to create wallet."};
      
      return { success: true, data: data as DbWallet };
    } catch (error: any) {
      console.error("Error creating wallet:", error);
      toast.error(error.message || 'Failed to create wallet.');
      return { success: false, error: error.message };
    }
  },

  // Placeholder for handleDeposit
  handleDeposit: async (params: { userId: string; amount: number; currency: string; paymentMethod: string; transactionId?: string }): Promise<WalletResponse> => {
    // This would involve creating a transaction record and updating wallet balance
    // For now, just a placeholder
    console.log("Handling deposit:", params);
    // Simulate balance update
    const currentWallet = await walletService.getWalletByUserId(params.userId);
    if (currentWallet.success && currentWallet.data) {
      const newBalance = currentWallet.data.balance + params.amount;
      return walletService.updateWalletBalance(params.userId, newBalance, params.currency);
    }
    return { success: false, message: "Deposit failed: could not retrieve current wallet." };
  },

  // Placeholder for handleWithdrawal
  handleWithdrawal: async (params: { userId: string; amount: number; currency: string; paymentMethod: string }): Promise<WalletResponse> => {
    // This would involve creating a transaction record and updating wallet balance
    // For now, just a placeholder
    console.log("Handling withdrawal:", params);
    const currentWallet = await walletService.getWalletByUserId(params.userId);
    if (currentWallet.success && currentWallet.data) {
      if (currentWallet.data.balance < params.amount) {
        return { success: false, message: "Insufficient funds for withdrawal." };
      }
      const newBalance = currentWallet.data.balance - params.amount;
      return walletService.updateWalletBalance(params.userId, newBalance, params.currency);
    }
    return { success: false, message: "Withdrawal failed: could not retrieve current wallet." };
  },
  mapDbWalletToWallet, // Expose the mapper
};

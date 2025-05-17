import { supabase } from '@/integrations/supabase/client';
import { Wallet, WalletResponse, WalletTransaction } from '@/types'; // Updated to use consolidated types
import { toast } from 'sonner';

// Helper function to map Supabase wallet data to our Wallet type
// Export this function
export const mapDbWalletToWallet = (dbWallet: any): Wallet => {
  return {
    id: dbWallet.id,
    userId: dbWallet.user_id,
    balance: parseFloat(dbWallet.balance) || 0,
    currency: dbWallet.currency || 'USD',
    symbol: dbWallet.symbol || '$',
    vipLevel: dbWallet.vip_level || 0,
    bonusBalance: parseFloat(dbWallet.balance_bonus) || 0,
    cryptoBalance: parseFloat(dbWallet.balance_cryptocurrency) || 0,
    demoBalance: parseFloat(dbWallet.balance_demo) || 0,
    isActive: dbWallet.active,
    balance_bonus_rollover: dbWallet.balance_bonus_rollover,
    balance_deposit_rollover: dbWallet.balance_deposit_rollover,
    balance_withdrawal: dbWallet.balance_withdrawal,
    refer_rewards: dbWallet.refer_rewards,
    hide_balance: dbWallet.hide_balance,
    total_bet: dbWallet.total_bet,
    total_won: dbWallet.total_won,
    total_lose: dbWallet.total_lose,
    last_won: dbWallet.last_won,
    last_lose: dbWallet.last_lose,
    vip_points: dbWallet.vip_points,
    deposit_limit_daily: dbWallet.deposit_limit_daily,
    deposit_limit_weekly: dbWallet.deposit_limit_weekly,
    deposit_limit_monthly: dbWallet.deposit_limit_monthly,
    exclusion_until: dbWallet.exclusion_until,
    time_reminder_enabled: dbWallet.time_reminder_enabled,
    reminder_interval_minutes: dbWallet.reminder_interval_minutes,
    exclusion_period: dbWallet.exclusion_period,
    createdAt: dbWallet.created_at,
    updatedAt: dbWallet.updated_at,
  };
};

export const walletService = {
  async getWalletByUserId(userId: string): Promise<WalletResponse> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { 
          return { data: null, error: 'Wallet not found for this user.' };
        }
        throw error;
      }
      return { data: data ? mapDbWalletToWallet(data) : null, error: null };
    } catch (error: any) {
      console.error(`Error fetching wallet for user ${userId}:`, error);
      return { data: null, error: error.message || 'Failed to load wallet.' };
    }
  },

  async updateWalletBalance(userId: string, newBalance: number, currency?: string): Promise<WalletResponse> {
    try {
      const updates: { balance: number, currency?: string, updated_at: string } = { 
        balance: newBalance,
        updated_at: new Date().toISOString()
      };
      if (currency) {
        updates.currency = currency;
      }

      const { data, error } = await supabase
        .from('wallets')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data: data ? mapDbWalletToWallet(data) : null, error: null };
    } catch (error: any) {
      console.error(`Error updating wallet balance for user ${userId}:`, error);
      toast.error(`Failed to update balance: ${error.message}`);
      return { data: null, error: error.message || 'Failed to update balance.' };
    }
  },

  async createWallet(userId: string, currency = 'USD', initialBalance = 0): Promise<WalletResponse> {
    try {
      const walletData = {
        user_id: userId,
        balance: initialBalance,
        currency: currency,
        symbol: currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency,
        active: true,
        balance_bonus: 0,
        balance_cryptocurrency: 0,
        balance_demo: 1000,
        vip_level: 0,
      };
      const { data, error } = await supabase
        .from('wallets')
        .insert(walletData)
        .select()
        .single();

      if (error) throw error;
      toast.success("Wallet created successfully!");
      return { data: data ? mapDbWalletToWallet(data) : null, error: null };
    } catch (error: any) {
      console.error(`Error creating wallet for user ${userId}:`, error);
      toast.error(`Failed to create wallet: ${error.message}`);
      return { data: null, error: error.message || 'Failed to create wallet.' };
    }
  },

  async handleDeposit(params: {
    userId: string;
    amount: number;
    currency: string;
    method: string; // e.g., 'metamask', 'credit_card'
    transactionDetails?: Partial<WalletTransaction>; // Optional additional details for the transaction record
  }): Promise<{ success: boolean; error?: string }> {
    const { userId, amount, currency, method, transactionDetails } = params;
    
    if (amount <= 0) {
      return { success: false, error: "Deposit amount must be positive." };
    }

    try {
      const walletResponse = await this.getWalletByUserId(userId);
      if (!walletResponse.data) {
         return { success: false, error: walletResponse.error || "Wallet not found for deposit." };
      }

      const currentBalance = walletResponse.data.balance;
      const newBalance = currentBalance + amount;

      const transactionData: Omit<WalletTransaction, 'id' | 'date'> = {
        userId,
        type: 'deposit',
        amount,
        currency,
        status: 'completed', 
        provider: method, 
        description: `Deposit via ${method}`,
        balance_before: currentBalance,
        balance_after: newBalance,
        ...transactionDetails,
      };
      
      const { error: txError } = await supabase.from('transactions').insert({
          player_id: userId, // Ensure this matches your DB schema, likely user_id from your users table
          type: 'deposit',
          amount: amount,
          currency: currency,
          status: 'completed',
          provider: method,
          description: `Deposit via ${method}`,
          balance_before: currentBalance,
          balance_after: newBalance,
      });


      if (txError) {
        throw new Error(`Failed to record transaction: ${txError.message}`);
      }

      const updateResponse = await this.updateWalletBalance(userId, newBalance, currency);
      if (!updateResponse.data) {
        return { success: false, error: updateResponse.error || "Failed to update wallet after deposit." };
      }

      return { success: true };
    } catch (error: any) {
      console.error(`Error handling deposit for user ${userId}:`, error);
      return { success: false, error: error.message || 'Deposit process failed.' };
    }
  },
  
  async handleWithdrawal(params: {
    userId: string;
    amount: number;
    currency: string;
    method: string;
    transactionDetails?: Partial<WalletTransaction>;
  }): Promise<{ success: boolean; error?: string }> {
    const { userId, amount, currency, method, transactionDetails } = params;

    if (amount <= 0) {
      return { success: false, error: "Withdrawal amount must be positive." };
    }
    
    try {
      const walletResponse = await this.getWalletByUserId(userId);
      if (!walletResponse.data) {
        return { success: false, error: walletResponse.error || "Wallet not found for withdrawal." };
      }

      const currentBalance = walletResponse.data.balance;
      if (currentBalance < amount) {
        return { success: false, error: "Insufficient funds for withdrawal." };
      }
      
      const newBalance = currentBalance - amount;

      const transactionData: Omit<WalletTransaction, 'id' | 'date'> = {
        userId,
        type: 'withdraw',
        amount,
        currency,
        status: 'pending', 
        provider: method,
        description: `Withdrawal via ${method}`,
        balance_before: currentBalance,
        balance_after: newBalance,
        ...transactionDetails,
      };
      
      const { error: txError } = await supabase.from('transactions').insert({
          player_id: userId, // Ensure this matches your DB schema
          type: 'withdraw',
          amount: amount,
          currency: currency,
          status: 'pending',
          provider: method,
          description: `Withdrawal via ${method}`,
          balance_before: currentBalance,
          balance_after: newBalance,
      });

      if (txError) {
        throw new Error(`Failed to record transaction: ${txError.message}`);
      }
      
      // Assuming direct completion for example purposes
      const updateResponse = await this.updateWalletBalance(userId, newBalance, currency);
      if (!updateResponse.data) {
        return { success: false, error: updateResponse.error || "Failed to update wallet after withdrawal." };
      }
      
      toast.info(`Withdrawal of ${amount} ${currency} is processing.`);
      return { success: true };
    } catch (error: any) {
      console.error(`Error handling withdrawal for user ${userId}:`, error);
      return { success: false, error: error.message || 'Withdrawal process failed.' };
    }
  },
};

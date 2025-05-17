import { supabase } from '@/integrations/supabase/client';
import { Wallet, WalletResponse, WalletTransaction } from '@/types';
import { toast } from 'sonner';

// Helper function to map Supabase wallet data to our Wallet type
const mapDbWalletToWallet = (dbWallet: any): Wallet => {
  return {
    id: dbWallet.id, // Assuming your 'wallets' table has 'id' as primary key
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
        if (error.code === 'PGRST116') { // No wallet found, which can be normal
          return { data: null, error: 'Wallet not found for this user.' };
        }
        throw error;
      }
      return { data: data ? mapDbWalletToWallet(data) : null, error: null };
    } catch (error: any) {
      console.error(`Error fetching wallet for user ${userId}:`, error);
      // toast.error(`Failed to load wallet: ${error.message}`);
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
        symbol: currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency, // Basic symbol mapping
        active: true,
        // Add other default fields from your Wallet interface / DB schema as needed
        balance_bonus: 0,
        balance_cryptocurrency: 0,
        balance_demo: 1000, // Example demo balance
        vip_level: 0,
        // ... other defaults
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
        // Optionally create wallet if it doesn't exist, or return error
        // const creationResponse = await this.createWallet(userId, currency);
        // if (!creationResponse.data) {
        //   return { success: false, error: creationResponse.error || "Failed to initialize wallet for deposit." };
        // }
        // walletResponse.data = creationResponse.data;
         return { success: false, error: walletResponse.error || "Wallet not found for deposit." };
      }

      const currentBalance = walletResponse.data.balance;
      const newBalance = currentBalance + amount;

      // Record the transaction
      const transactionData: Omit<WalletTransaction, 'id' | 'date'> = {
        userId,
        type: 'deposit',
        amount,
        currency,
        status: 'completed', // Assume direct completion for this example
        provider: method, // Use deposit method as provider
        description: `Deposit via ${method}`,
        balance_before: currentBalance,
        balance_after: newBalance,
        ...transactionDetails,
      };
      
      // Using transactionQueryService.addTransaction (assuming it exists and is imported)
      // import { addTransaction } from './transactionQueryService'; // Make sure this import is present
      // const txResult = await addTransaction(transactionData);
      // For now, directly insert into transactions table
      const { error: txError } = await supabase.from('transactions').insert({
          player_id: userId,
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

      // Update wallet balance
      const updateResponse = await this.updateWalletBalance(userId, newBalance, currency);
      if (!updateResponse.data) {
        // Potentially try to roll back transaction record or mark as failed
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

      // Record the transaction
      const transactionData: Omit<WalletTransaction, 'id' | 'date'> = {
        userId,
        type: 'withdraw', // Changed from 'withdrawal' to 'withdraw' to match type
        amount,
        currency,
        status: 'pending', // Withdrawals often start as pending
        provider: method,
        description: `Withdrawal via ${method}`,
        balance_before: currentBalance,
        balance_after: newBalance,
        ...transactionDetails,
      };
      
      // const txResult = await addTransaction(transactionData); // See deposit
      const { error: txError } = await supabase.from('transactions').insert({
          player_id: userId,
          type: 'withdraw',
          amount: amount,
          currency: currency,
          status: 'pending', // Or 'completed' if direct
          provider: method,
          description: `Withdrawal via ${method}`,
          balance_before: currentBalance,
          balance_after: newBalance,
      });

      if (txError) {
        throw new Error(`Failed to record transaction: ${txError.message}`);
      }

      // Update wallet balance (ONLY if withdrawal is immediately completed)
      // For pending withdrawals, balance is usually deducted upon approval.
      // For this example, assuming direct completion:
      const updateResponse = await this.updateWalletBalance(userId, newBalance, currency);
      if (!updateResponse.data) {
        return { success: false, error: updateResponse.error || "Failed to update wallet after withdrawal." };
      }
      
      toast.info(`Withdrawal of ${amount} ${currency} is processing.`); // Or success if direct
      return { success: true };
    } catch (error: any) {
      console.error(`Error handling withdrawal for user ${userId}:`, error);
      return { success: false, error: error.message || 'Withdrawal process failed.' };
    }
  },
};

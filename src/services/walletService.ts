import { supabase } from "@/integrations/supabase/client";
import { Wallet, WalletResponse } from "@/types";
import { WalletTransaction } from "@/types";
import { toast } from "sonner";

export const walletService = {
  /**
   * Get a wallet by user ID
   */
  async getWalletByUserId(userId: string): Promise<WalletResponse> {
    try {
      console.log("Fetching wallet for user:", userId);
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error("Error fetching wallet:", error);
        // Check if error is "PGRST116" (No rows found), not necessarily an error to toast
        if (error.code === 'PGRST116') {
            return { data: null, error: "Wallet not found for user." };
        }
        return { data: null, error: error.message };
      }

      console.log("Wallet data retrieved:", data);
      return { data: data ? this.mapDatabaseWalletToWallet(data) : null, error: null };
    } catch (err: any) {
      console.error("Exception fetching wallet:", err);
      return { data: null, error: err.message || 'Failed to fetch wallet' };
    }
  },

  async updateWalletBalance(
    userId: string, 
    amount: number, 
    type: 'deposit' | 'withdraw', 
    options?: { 
      description?: string, 
      provider?: string, 
      gameId?: string 
    }
  ): Promise<WalletResponse> {
    try {
      console.log(`Processing ${type} of ${amount} for user ${userId}`);
      
      const currentWalletResponse = await this.getWalletByUserId(userId);
      
      if (currentWalletResponse.error && !currentWalletResponse.data) {
        return { 
          data: null, 
          error: currentWalletResponse.error || `Wallet not found for user ${userId}` 
        };
      }
      if (!currentWalletResponse.data) {
         return { data: null, error: `Wallet not found for user ${userId}` };
      }

      const currentWallet = currentWalletResponse.data;
      
      if (type === 'withdraw' && currentWallet.balance < amount) {
        return { 
          data: null, 
          error: 'Insufficient balance for withdrawal' 
        };
      }
      
      const newBalance = type === 'deposit' 
        ? currentWallet.balance + amount 
        : currentWallet.balance - amount;
      
      const { data: updatedWalletData, error: updateError } = await supabase
        .from('wallets')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (updateError || !updatedWalletData) {
        console.error("Error updating wallet balance:", updateError);
        return { data: null, error: updateError?.message || "Failed to update wallet data" };
      }
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          player_id: userId,
          amount: amount,
          currency: currentWallet.currency || 'USD',
          type: type,
          provider: options?.provider || 'system',
          game_id: options?.gameId,
          status: 'completed',
          balance_before: currentWallet.balance,
          balance_after: newBalance,
          description: options?.description || `${type.charAt(0).toUpperCase() + type.slice(1)} of ${amount}`
        });
      
      if (transactionError) {
        console.error("Error creating transaction record:", transactionError);
        // Potentially return an error or partial success here
      }
      
      return { data: this.mapDatabaseWalletToWallet(updatedWalletData), error: null };
    } catch (err: any) {
      console.error(`Error ${type}ing to wallet:`, err);
      return { data: null, error: err.message || `Failed to process ${type}` };
    }
  },
  
  async depositToWallet(
    userId: string, 
    amount: number, 
    provider: string = 'manual',
    description?: string
  ): Promise<WalletResponse> {
    return this.updateWalletBalance(userId, amount, 'deposit', {
      provider,
      description: description || `Deposit of ${amount}`
    });
  },
  
  async withdrawFromWallet(
    userId: string, 
    amount: number, 
    provider: string = 'manual',
    description?: string
  ): Promise<WalletResponse> {
    return this.updateWalletBalance(userId, amount, 'withdraw', {
      provider,
      description: description || `Withdrawal of ${amount}`
    });
  },
  
  async getWalletTransactions(
    userId: string, 
    limit: number = 10, 
    offset: number = 0
  ): Promise<{ data: WalletTransaction[]; error: string | null; total: number }> {
    try {
      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('player_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        return { data: [], error: error.message, total: 0 };
      }
      
      const transactions: WalletTransaction[] = data.map((tx: any) => ({
        id: tx.id,
        userId: tx.player_id,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        date: tx.created_at,
        gameId: tx.game_id,
        provider: tx.provider,
        description: tx.description,
        balance_before: tx.balance_before,
        balance_after: tx.balance_after,
        round_id: tx.round_id,
        session_id: tx.session_id,
      }));
      
      return { data: transactions, error: null, total: count || 0 };
    } catch (err: any) {
      console.error("Error getting wallet transactions:", err);
      return { data: [], error: err.message || 'Failed to get wallet transactions', total: 0 };
    }
  },

  mapDatabaseWalletToWallet(dbWallet: any): Wallet {
    // Ensure this mapping matches the Wallet interface
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
      isActive: dbWallet.active || false,
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
  }
};

export default walletService;


import { supabase } from "@/integrations/supabase/client";
import { Wallet, WalletResponse, WalletTransaction } from "@/types/wallet";
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
        return { data: null, error: error.message };
      }

      console.log("Wallet data retrieved:", data);
      return { data, error: null };
    } catch (err: any) {
      console.error("Exception fetching wallet:", err);
      return { data: null, error: err.message || 'Failed to fetch wallet' };
    }
  },

  /**
   * Update wallet balance (deposit or withdraw)
   */
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
      
      // First get current wallet to verify funds for withdrawal
      const currentWallet = await this.getWalletByUserId(userId);
      
      if (!currentWallet.data) {
        return { 
          data: null, 
          error: `Wallet not found for user ${userId}` 
        };
      }
      
      // For withdrawals, check if there's enough balance
      if (type === 'withdraw' && currentWallet.data.balance < amount) {
        return { 
          data: null, 
          error: 'Insufficient balance for withdrawal' 
        };
      }
      
      // Calculate new balance based on transaction type
      const newBalance = type === 'deposit' 
        ? currentWallet.data.balance + amount 
        : currentWallet.data.balance - amount;
      
      // Update wallet balance
      const { data: updatedWallet, error: updateError } = await supabase
        .from('wallets')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .single();
      
      if (updateError) {
        console.error("Error updating wallet balance:", updateError);
        return { data: null, error: updateError.message };
      }
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          player_id: userId,
          amount: amount,
          currency: currentWallet.data.currency || 'USD',
          type: type === 'deposit' ? 'deposit' : 'withdraw',
          provider: options?.provider || 'system',
          game_id: options?.gameId,
          status: 'completed',
          balance_before: currentWallet.data.balance,
          balance_after: newBalance,
          description: options?.description || `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${amount}`
        });
      
      if (transactionError) {
        console.error("Error creating transaction record:", transactionError);
        // We don't fail the whole operation if just the transaction log fails
      }
      
      // Return the wallet with updated balance
      return { data: updatedWallet, error: null };
    } catch (err: any) {
      console.error(`Error ${type}ing to wallet:`, err);
      return { data: null, error: err.message || `Failed to process ${type}` };
    }
  },
  
  /**
   * Process wallet deposit
   */
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
  
  /**
   * Process wallet withdrawal
   */
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
  
  /**
   * Get wallet transactions for a user
   */
  async getWalletTransactions(
    userId: string, 
    limit: number = 10, 
    offset: number = 0
  ): Promise<{ data: WalletTransaction[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('player_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        return { data: [], error: error.message };
      }
      
      // Map to frontend wallet transaction model
      const transactions: WalletTransaction[] = data.map(tx => ({
        id: tx.id,
        userId: tx.player_id,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        date: tx.created_at,
        gameId: tx.game_id,
        gameName: tx.game_name,
        provider: tx.provider
      }));
      
      return { data: transactions, error: null };
    } catch (err: any) {
      console.error("Error getting wallet transactions:", err);
      return { data: [], error: err.message || 'Failed to get wallet transactions' };
    }
  },
  
  /**
   * Map database wallet object to frontend Wallet model
   */
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

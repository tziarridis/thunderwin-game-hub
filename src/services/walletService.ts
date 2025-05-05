
// Fix the wallet service errors by properly handling the currency
import { supabase } from '../integrations/supabase/client';
import { generateHash } from '@/utils/browserHashUtils';

export interface WalletData {
  id?: string;
  user_id: string;
  balance: number;
  currency: string;
  symbol: string;
  active: boolean;
  vip_level?: number;
  vip_points?: number;
  balance_bonus?: number;
  total_bet?: number;
  total_won?: number;
  total_lose?: number;
}

export interface TransactionData {
  id?: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus';
  status: 'pending' | 'completed' | 'failed';
  created_at?: string;
  provider?: string;
  game_id?: string;
  round_id?: string;
  description?: string;
  payment_method?: string;
  bonus_id?: string;
  reference_id?: string;
  player_id?: string; // Add player_id for compatibility with the database
}

class WalletService {
  async getWalletByUserId(userId: string) {
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching wallet:', error);
      throw new Error('Failed to fetch wallet');
    }

    return data;
  }

  async createWallet(walletData: WalletData) {
    const { data, error } = await supabase
      .from('wallets')
      .insert([walletData])
      .select()
      .single();

    if (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }

    return data;
  }

  async updateWallet(id: string, walletData: Partial<WalletData>) {
    const { data, error } = await supabase
      .from('wallets')
      .update(walletData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating wallet:', error);
      throw new Error('Failed to update wallet');
    }

    return data;
  }

  async updateWalletBalance(userId: string, amount: number, operation: 'add' | 'subtract', type: TransactionData['type'], metadata: Record<string, any> = {}) {
    try {
      // 1. Get the wallet
      const wallet = await this.getWalletByUserId(userId);
      if (!wallet) throw new Error('Wallet not found');

      const balanceBefore = wallet.balance;
      let balanceAfter: number;

      // 2. Update the wallet balance
      if (operation === 'add') {
        balanceAfter = Number(balanceBefore) + Number(amount);
      } else {
        balanceAfter = Number(balanceBefore) - Number(amount);
        if (balanceAfter < 0) throw new Error('Insufficient funds');
      }

      // 3. Create the transaction
      const transactionData = {
        user_id: userId,
        player_id: userId, // Add player_id for database compatibility
        amount,
        currency: wallet.currency || "USD", // Use wallet currency or default to USD
        type,
        status: 'completed',
        provider: metadata.provider || 'system', // Set a default provider
        ...metadata
      };

      // 4. Begin transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select();

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        throw new Error('Failed to create transaction');
      }

      // 5. Update wallet balance
      const { data: updatedWallet, error: walletError } = await supabase
        .from('wallets')
        .update({ balance: balanceAfter })
        .eq('id', wallet.id)
        .select();

      if (walletError) {
        console.error('Error updating wallet balance:', walletError);
        throw new Error('Failed to update wallet balance');
      }

      return {
        transaction: transaction[0],
        wallet: updatedWallet[0],
        balanceBefore,
        balanceAfter
      };
    } catch (error: any) {
      console.error('Error in updateWalletBalance:', error);
      throw new Error(error.message || 'Failed to update wallet balance');
    }
  }

  async deposit(userId: string, amount: number, paymentMethod: string, metadata: Record<string, any> = {}) {
    try {
      const wallet = await this.getWalletByUserId(userId);
      if (!wallet) throw new Error('Wallet not found');

      return await this.updateWalletBalance(userId, amount, 'add', 'deposit', {
        payment_method: paymentMethod,
        description: `Deposit of ${amount} ${wallet.currency || "USD"}`, // Fixed error here
        reference_id: generateHash(),
        provider: metadata.provider || 'payment-gateway', // Set a default provider
        ...metadata
      });
    } catch (error: any) {
      console.error('Error in deposit:', error);
      throw new Error(error.message || 'Failed to process deposit');
    }
  }

  async withdraw(userId: string, amount: number, paymentMethod: string, metadata: Record<string, any> = {}) {
    try {
      const wallet = await this.getWalletByUserId(userId);
      if (!wallet) throw new Error('Wallet not found');

      if (wallet.balance < amount) {
        throw new Error('Insufficient funds for withdrawal');
      }

      return await this.updateWalletBalance(userId, amount, 'subtract', 'withdraw', {
        payment_method: paymentMethod,
        description: `Withdrawal of ${amount} ${wallet.currency || "USD"}`, // Fixed error here
        reference_id: generateHash(),
        provider: metadata.provider || 'payment-gateway', // Set a default provider
        ...metadata
      });
    } catch (error: any) {
      console.error('Error in withdraw:', error);
      throw new Error(error.message || 'Failed to process withdrawal');
    }
  }

  async getTransactionsByUserId(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('player_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transactions');
    }

    return data;
  }

  // Helper function to credit wallet (used by metamaskService)
  async creditWallet(userId: string, amount: number, type: TransactionData['type'] = 'deposit', paymentMethod: string = 'metamask') {
    try {
      return await this.deposit(userId, amount, paymentMethod, {
        description: `${paymentMethod} deposit of ${amount}`,
        reference_id: generateHash(),
        provider: 'metamask'
      });
    } catch (error: any) {
      console.error('Error crediting wallet:', error);
      throw new Error(error.message || 'Failed to credit wallet');
    }
  }
}

export const walletService = new WalletService();
export const { creditWallet } = walletService;
export default walletService;

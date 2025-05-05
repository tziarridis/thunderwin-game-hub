import { supabase } from '../integrations/supabase/client';
import { walletService } from './walletService';

interface TransactionData {
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
  balance_before?: number;
  balance_after?: number;
  player_id?: string; // Added for compatibility
}

class TransactionService {
  // Other methods...

  // Fix the processPragmaticTransaction method
  async processPragmaticTransaction(transactionData: Record<string, any>): Promise<any> {
    try {
      // Ensure required fields are present
      const requiredFields = ['amount', 'currency', 'player_id', 'provider', 'type'];
      for (const field of requiredFields) {
        if (transactionData[field] === undefined) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Clean up transaction data to match the expected schema
      const cleanedData: TransactionData = {
        amount: Number(transactionData.amount),
        currency: transactionData.currency,
        type: transactionData.type as 'bet' | 'win' | 'deposit' | 'withdraw' | 'bonus',
        status: transactionData.status || 'completed',
        user_id: transactionData.player_id,
        provider: transactionData.provider,
        game_id: transactionData.game_id || '',
        round_id: transactionData.round_id || '',
        description: transactionData.description || '',
        payment_method: transactionData.payment_method || '',
        bonus_id: transactionData.bonus_id || '',
        reference_id: transactionData.reference_id || ''
      };

      // Insert the transaction into the database
      const { data, error } = await supabase
        .from('transactions')
        .insert([cleanedData])
        .select();

      if (error) {
        console.error('Error creating transaction:', error);
        throw new Error(`Failed to create transaction: ${error.message}`);
      }

      return data && data[0] ? data[0] : null;
    } catch (error: any) {
      console.error('Error in processPragmaticTransaction:', error);
      throw new Error(error.message || 'Failed to process transaction');
    }
  }

  // Additional methods...
}

export const transactionService = new TransactionService();

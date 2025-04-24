
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { getWalletByUserId, updateWalletBalance } from './walletService';
import { getUserById } from './userService';
import { transactionEnrichService } from './transactionEnrichService';
import { transactionQueryService } from './transactionQueryService';

export interface Transaction {
  id: string;
  player_id: string;
  session_id?: string;
  game_id?: string;
  round_id?: string;
  provider: string;
  type: 'bet' | 'win' | 'deposit' | 'withdraw';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  balance_before?: number;
  balance_after?: number;
  created_at: string;
  updated_at: string;
  
  // Additional properties for UI components
  transactionId?: string;
  userId?: string;
  userName?: string; // For displaying user's name
  gameId?: string;
  roundId?: string;
  timestamp?: string;
  date?: string; // For date display
  method?: string; // For payment method display
}

export interface TransactionFilter {
  player_id?: string;
  provider?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * Create a new transaction
 */
export const createTransaction = async (
  playerId: string,
  type: 'bet' | 'win' | 'deposit' | 'withdraw',
  amount: number,
  currency: string,
  provider: string,
  options: {
    session_id?: string;
    game_id?: string;
    round_id?: string;
    balance_before?: number;
    balance_after?: number;
  } = {}
): Promise<Transaction | null> => {
  // Get the current wallet balance if not provided
  let balanceBefore = options.balance_before;
  let balanceAfter = options.balance_after;
  
  if (balanceBefore === undefined || balanceAfter === undefined) {
    const wallet = await getWalletByUserId(playerId);
    if (wallet) {
      balanceBefore = wallet.balance;
      
      // Calculate new balance based on transaction type
      if (type === 'deposit' || type === 'win') {
        balanceAfter = balanceBefore + amount;
      } else if (type === 'withdraw' || type === 'bet') {
        balanceAfter = balanceBefore - amount;
      }
      
      // Update wallet with new balance
      await updateWalletBalance(playerId, balanceAfter || balanceBefore);
    }
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      player_id: playerId,
      type,
      amount,
      currency,
      provider,
      session_id: options.session_id,
      game_id: options.game_id,
      round_id: options.round_id,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }

  // Return enriched transaction with UI-friendly properties
  return await transactionEnrichService.enrichTransaction(data);
};

/**
 * Get a transaction by ID
 */
export const getTransaction = async (id: string): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error getting transaction:', error);
    return null;
  }

  // Return enriched transaction with UI-friendly properties
  return await transactionEnrichService.enrichTransaction(data);
};

/**
 * Get transactions with filters
 */
export const getTransactions = async (filters: TransactionFilter = {}): Promise<Transaction[]> => {
  return await transactionQueryService.getTransactionsWithFilters(filters);
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (
  id: string, 
  status: 'pending' | 'completed' | 'failed',
  balanceAfter?: number
): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .update({ 
      status,
      ...(balanceAfter !== undefined ? { balance_after: balanceAfter } : {})
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction status:', error);
    return null;
  }

  // Return enriched transaction with UI-friendly properties
  return await transactionEnrichService.enrichTransaction(data);
};

// For component use, adapt the PPTransactionLogger component
export const getPragmaticPlayTransactions = async (limit = 100): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select()
    .eq('provider', 'Pragmatic Play')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error getting Pragmatic Play transactions:', error);
    return [];
  }

  // Enrich the data for UI display
  return await Promise.all(data.map(transactionEnrichService.enrichTransaction));
};

export default {
  createTransaction,
  getTransaction,
  getTransactions,
  updateTransactionStatus,
  getPragmaticPlayTransactions
};

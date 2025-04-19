
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { getWalletByUserId, updateWalletBalance } from './walletService';

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
): Promise<Transaction> => {
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

  // Type assertion to ensure data matches our Transaction interface
  return {
    ...data,
    type: data.type as 'bet' | 'win' | 'deposit' | 'withdraw',
    status: data.status as 'pending' | 'completed' | 'failed',
    // Add UI properties
    transactionId: data.id,
    userId: data.player_id,
    userName: data.player_id, // Default to player_id, will be enhanced when needed
    gameId: data.game_id,
    roundId: data.round_id,
    timestamp: data.created_at,
    date: data.created_at,
    method: data.provider
  } as Transaction;
};

/**
 * Get a transaction by ID
 */
export const getTransaction = async (id: string): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      users!transactions_player_id_fkey (
        email,
        username
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error getting transaction:', error);
    return null;
  }

  // Type assertion to ensure data matches our Transaction interface
  return {
    ...data,
    type: data.type as 'bet' | 'win' | 'deposit' | 'withdraw',
    status: data.status as 'pending' | 'completed' | 'failed',
    // Add UI properties
    transactionId: data.id,
    userId: data.player_id,
    userName: data.users?.username || data.player_id,
    gameId: data.game_id,
    roundId: data.round_id,
    timestamp: data.created_at,
    date: data.created_at,
    method: data.provider
  } as Transaction;
};

/**
 * Get transactions with filters
 */
export const getTransactions = async (filters: TransactionFilter = {}): Promise<Transaction[]> => {
  let query = supabase
    .from('transactions')
    .select(`
      *,
      users (
        email,
        username
      )
    `);
  
  if (filters.player_id) {
    query = query.eq('player_id', filters.player_id);
  }
  
  if (filters.provider) {
    query = query.eq('provider', filters.provider);
  }
  
  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;

  if (error) {
    console.error('Error getting transactions:', error);
    return [];
  }

  // Process the data to include UI-friendly properties
  return data.map(item => ({
    ...item,
    type: item.type as 'bet' | 'win' | 'deposit' | 'withdraw',
    status: item.status as 'pending' | 'completed' | 'failed',
    // Add UI properties
    transactionId: item.id,
    userId: item.player_id,
    userName: item.users?.username || item.player_id,
    gameId: item.game_id,
    roundId: item.round_id,
    timestamp: item.created_at,
    date: item.created_at,
    method: item.provider
  })) as Transaction[];
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

  // Type assertion to ensure data matches our Transaction interface
  return {
    ...data,
    type: data.type as 'bet' | 'win' | 'deposit' | 'withdraw',
    status: data.status as 'pending' | 'completed' | 'failed',
    // Add UI properties
    transactionId: data.id,
    userId: data.player_id,
    userName: data.player_id,
    gameId: data.game_id,
    roundId: data.round_id,
    timestamp: data.created_at,
    date: data.created_at,
    method: data.provider
  } as Transaction;
};

// For component use, adapt the PPTransactionLogger component
export const getPragmaticPlayTransactions = async (limit = 100): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      users (
        email,
        username
      )
    `)
    .eq('provider', 'Pragmatic Play')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error getting Pragmatic Play transactions:', error);
    return [];
  }

  // Process the data to include UI-friendly properties
  return data.map(item => ({
    ...item,
    transactionId: item.id,
    userId: item.player_id,
    userName: item.users?.username || item.player_id,
    gameId: item.game_id,
    roundId: item.round_id,
    timestamp: item.created_at,
    date: item.created_at,
    method: item.provider,
    type: item.type as 'bet' | 'win' | 'deposit' | 'withdraw',
    status: item.status as 'pending' | 'completed' | 'failed',
  })) as Transaction[];
};

export default {
  createTransaction,
  getTransaction,
  getTransactions,
  updateTransactionStatus,
  getPragmaticPlayTransactions
};

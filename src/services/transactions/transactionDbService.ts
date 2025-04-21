
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { 
  Transaction, 
  CreateTransactionParams, 
  TransactionFilter, 
  UpdateTransactionStatusParams,
  TransactionQueryOptions 
} from '@/types/transaction';

/**
 * Creates a new transaction in the database
 */
export async function createTransaction(params: CreateTransactionParams): Promise<Transaction | null> {
  const { 
    playerId, 
    type, 
    amount, 
    currency, 
    provider, 
    sessionId, 
    gameId, 
    roundId, 
    balanceBefore, 
    balanceAfter 
  } = params;

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      player_id: playerId,
      type,
      amount,
      currency,
      provider,
      session_id: sessionId,
      game_id: gameId,
      round_id: roundId,
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
    gameId: data.game_id,
    roundId: data.round_id,
    timestamp: data.created_at,
    date: data.created_at,
    method: data.provider
  } as Transaction;
}

/**
 * Gets a transaction by ID
 */
export async function getTransaction(id: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select()
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
    gameId: data.game_id,
    roundId: data.round_id,
    timestamp: data.created_at,
    date: data.created_at,
    method: data.provider
  } as Transaction;
}

/**
 * Gets transactions with filters
 */
export async function getTransactions(
  filters: TransactionFilter = {},
  options: TransactionQueryOptions = {}
): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select();
  
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
  
  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.order === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  if (filters.limit || options.limit) {
    query = query.limit(filters.limit || options.limit || 100);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error getting transactions:', error);
    return [];
  }

  // Process the data to include UI-friendly properties
  const enhancedTransactions = data.map(item => {
    return {
      ...item,
      type: item.type as 'bet' | 'win' | 'deposit' | 'withdraw',
      status: item.status as 'pending' | 'completed' | 'failed',
      // Add UI properties
      transactionId: item.id,
      userId: item.player_id,
      gameId: item.game_id,
      roundId: item.round_id,
      timestamp: item.created_at,
      date: item.created_at,
      method: item.provider
    };
  });

  return enhancedTransactions as Transaction[];
}

/**
 * Updates transaction status
 */
export async function updateTransactionStatus(
  params: UpdateTransactionStatusParams
): Promise<Transaction | null> {
  const { id, status, balanceAfter } = params;
  
  const updateData: any = { status };
  if (balanceAfter !== undefined) {
    updateData.balance_after = balanceAfter;
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
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
    gameId: data.game_id,
    roundId: data.round_id,
    timestamp: data.created_at,
    date: data.created_at,
    method: data.provider
  } as Transaction;
}

/**
 * Gets Pragmatic Play transactions
 */
export async function getPragmaticPlayTransactions(limit = 100): Promise<Transaction[]> {
  return getTransactions(
    { provider: 'Pragmatic Play', limit },
    { orderBy: 'created_at', order: 'desc' }
  );
}

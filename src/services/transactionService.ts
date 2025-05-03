import { Transaction } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Define a type for the raw transaction data from the database
interface RawTransaction {
  id: string;
  player_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  provider: string;
  game_id?: string;
  round_id?: string;
  session_id?: string;
  balance_before?: number;
  balance_after?: number;
  description?: string;
  payment_method?: string;
  bonus_id?: string;
  reference_id?: string;
}

// Define the TransactionFilter type needed by components
export interface TransactionFilter {
  type?: string;
  status?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
  // Additional properties being used in transactionQueryService
  player_id?: string;
  provider?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// Get transactions for a specific user
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('player_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map((transaction: RawTransaction) => ({
        id: transaction.id,
        userId: transaction.player_id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        date: transaction.created_at,
        // Handle potentially missing properties with undefined
        description: transaction.description,
        paymentMethod: transaction.payment_method || transaction.provider,
        gameId: transaction.game_id,
        bonusId: transaction.bonus_id,
        balance: transaction.balance_after,
        referenceId: transaction.reference_id || transaction.round_id
      }));
    }
    
    return getMockTransactions(userId);
    
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return getMockTransactions(userId);
  }
};

// Add a new transaction
export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        player_id: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        game_id: transaction.gameId,
        provider: transaction.type === 'bet' || transaction.type === 'win' ? 'internal' : 'payment',
        round_id: transaction.type === 'bet' || transaction.type === 'win' ? `round-${Date.now()}` : undefined,
        balance_after: transaction.balance,
        description: transaction.description,
        payment_method: transaction.paymentMethod,
        bonus_id: transaction.bonusId,
        reference_id: transaction.referenceId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.player_id,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      date: data.created_at,
      description: data.description,
      paymentMethod: data.payment_method || data.provider,
      gameId: data.game_id,
      bonusId: data.bonus_id,
      balance: data.balance_after,
      referenceId: data.reference_id || data.round_id
    };
    
  } catch (error) {
    console.error("Error adding transaction:", error);
    
    // Return a mock transaction with an ID
    return {
      id: `trans-${Date.now()}`,
      date: new Date().toISOString(),
      ...transaction
    };
  }
};

// Update a transaction's status
export const updateTransactionStatus = async (id: string, status: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
    
  } catch (error) {
    console.error(`Error updating transaction ${id} status:`, error);
    throw error;
  }
};

// Get transaction by ID
export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (data) {
      const transaction = data as RawTransaction;
      return {
        id: transaction.id,
        userId: transaction.player_id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        date: transaction.created_at,
        description: transaction.description,
        paymentMethod: transaction.payment_method || transaction.provider,
        gameId: transaction.game_id,
        bonusId: transaction.bonus_id,
        balance: transaction.balance_after,
        referenceId: transaction.reference_id || transaction.round_id
      };
    }
    
    return null;
    
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    return null;
  }
};

// Add support for Pragmatic Play transactions needed by components
export const getPragmaticPlayTransactions = async (filter?: Partial<TransactionFilter>): Promise<Transaction[]> => {
  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('provider', 'pragmatic_play');
    
    if (filter?.type) {
      query = query.eq('type', filter.type);
    }
    
    if (filter?.status) {
      query = query.eq('status', filter.status);
    }
    
    if (filter?.dateRange) {
      query = query
        .gte('created_at', filter.dateRange.from.toISOString())
        .lte('created_at', filter.dateRange.to.toISOString());
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map((transaction: RawTransaction) => ({
        id: transaction.id,
        userId: transaction.player_id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        date: transaction.created_at,
        description: transaction.description,
        paymentMethod: transaction.payment_method || transaction.provider,
        gameId: transaction.game_id,
        bonusId: transaction.bonus_id,
        balance: transaction.balance_after,
        referenceId: transaction.reference_id || transaction.round_id
      }));
    }
    
    // Return mock data for development
    return getMockPragmaticPlayTransactions();
    
  } catch (error) {
    console.error("Error fetching Pragmatic Play transactions:", error);
    return getMockPragmaticPlayTransactions();
  }
};

// Helper function for mock transactions
function getMockTransactions(userId: string): Transaction[] {
  return [
    {
      id: "1",
      userId: userId,
      type: "deposit",
      amount: 100,
      currency: "USD",
      status: "completed",
      date: "2023-07-27T10:00:00Z",
      description: "Initial deposit",
      paymentMethod: "credit_card"
    },
    {
      id: "2",
      userId: userId,
      type: "withdrawal",
      amount: 50,
      currency: "USD",
      status: "pending",
      date: "2023-07-26T15:30:00Z",
      description: "Withdrawal request",
      paymentMethod: "bank_transfer"
    },
    {
      id: "3",
      userId: userId,
      type: "bet",
      amount: 10,
      currency: "USD",
      status: "completed",
      date: "2023-07-25T18:45:00Z",
      gameId: "slot-123",
    },
    {
      id: "4",
      userId: userId,
      type: "win",
      amount: 20,
      currency: "USD",
      status: "completed",
      date: "2023-07-25T19:00:00Z",
      gameId: "slot-123",
    },
    {
      id: "5",
      userId: userId,
      type: "bonus",
      amount: 25,
      currency: "USD",
      status: "completed",
      date: "2023-07-24T20:00:00Z",
      bonusId: "welcome-bonus",
    }
  ];
}

// Helper function for mock Pragmatic Play transactions
function getMockPragmaticPlayTransactions(): Transaction[] {
  return [
    {
      id: "pp-1",
      userId: "user-123",
      type: "bet",
      amount: 5,
      currency: "USD",
      status: "completed",
      date: "2023-08-01T12:30:00Z",
      gameId: "pp-sweet-bonanza",
      referenceId: "pp-round-123"
    },
    {
      id: "pp-2",
      userId: "user-123",
      type: "win",
      amount: 15,
      currency: "USD",
      status: "completed",
      date: "2023-08-01T12:32:00Z",
      gameId: "pp-sweet-bonanza",
      referenceId: "pp-round-123"
    },
    {
      id: "pp-3",
      userId: "user-456",
      type: "bet",
      amount: 10,
      currency: "USD",
      status: "completed",
      date: "2023-08-01T14:15:00Z",
      gameId: "pp-wolf-gold",
      referenceId: "pp-round-456"
    }
  ];
}

export const getTransactionsByPlayerId = async (player_id: string, limit: number = 10): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('player_id', player_id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map((transaction: RawTransaction) => ({
        id: transaction.id,
        userId: transaction.player_id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        date: transaction.created_at,
        description: transaction.description,
        paymentMethod: transaction.payment_method || transaction.provider,
        gameId: transaction.game_id,
        bonusId: transaction.bonus_id,
        balance: transaction.balance_after,
        referenceId: transaction.reference_id || transaction.round_id
      }));
    }
    
    return [];
    
  } catch (error) {
    console.error(`Error fetching transactions for player ${player_id}:`, error);
    return getMockTransactions(player_id);
  }
};

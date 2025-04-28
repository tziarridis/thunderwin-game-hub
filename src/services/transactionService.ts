
import { Transaction } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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
      return data.map(transaction => ({
        id: transaction.id,
        userId: transaction.player_id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        date: transaction.created_at,
        description: transaction.description || undefined,
        paymentMethod: transaction.payment_method || undefined,
        gameId: transaction.game_id || undefined,
        bonusId: transaction.bonus_id || undefined,
        balance: transaction.balance_after || undefined,
        referenceId: transaction.reference_id || undefined
      }));
    }
    
    return [];
    
  } catch (error) {
    console.error("Error fetching transactions:", error);
    
    // Return mock data if there's an error
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
        description: transaction.description,
        payment_method: transaction.paymentMethod,
        game_id: transaction.gameId,
        bonus_id: transaction.bonusId,
        balance_after: transaction.balance,
        reference_id: transaction.referenceId,
        provider: transaction.type === 'bet' || transaction.type === 'win' ? 'internal' : 'payment',
        round_id: transaction.type === 'bet' || transaction.type === 'win' ? `round-${Date.now()}` : undefined
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
      description: data.description || undefined,
      paymentMethod: data.payment_method || undefined,
      gameId: data.game_id || undefined,
      bonusId: data.bonus_id || undefined,
      balance: data.balance_after || undefined,
      referenceId: data.reference_id || undefined
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
      return {
        id: data.id,
        userId: data.player_id,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        date: data.created_at,
        description: data.description || undefined,
        paymentMethod: data.payment_method || undefined,
        gameId: data.game_id || undefined,
        bonusId: data.bonus_id || undefined,
        balance: data.balance_after || undefined,
        referenceId: data.reference_id || undefined
      };
    }
    
    return null;
    
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    return null;
  }
};

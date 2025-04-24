
import { getUserById } from './userService';

/**
 * Transaction Enrich Service
 * Responsible for enriching transaction data with UI-friendly properties
 */
export const transactionEnrichService = {
  /**
   * Enrich a transaction with UI-friendly properties
   * @param transaction Raw transaction data from database
   * @returns Enriched transaction
   */
  enrichTransaction: async (transaction: any) => {
    if (!transaction) return null;

    // Try to get the user's name
    let userName = transaction.player_id;
    try {
      const user = await getUserById(transaction.player_id);
      if (user) {
        userName = user.username;
      }
    } catch (error) {
      console.error('Error fetching user data for transaction:', error);
    }

    // Return enriched transaction
    return {
      ...transaction,
      type: transaction.type as 'bet' | 'win' | 'deposit' | 'withdraw',
      status: transaction.status as 'pending' | 'completed' | 'failed',
      // Add UI properties
      transactionId: transaction.id,
      userId: transaction.player_id,
      userName: userName,
      gameId: transaction.game_id,
      roundId: transaction.round_id,
      timestamp: transaction.created_at,
      date: transaction.created_at,
      method: transaction.provider
    };
  },

  /**
   * Enrich multiple transactions with UI-friendly properties
   * @param transactions Array of raw transaction data from database
   * @returns Array of enriched transactions
   */
  enrichTransactions: async (transactions: any[]) => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return Promise.all(transactions.map(transaction => 
      transactionEnrichService.enrichTransaction(transaction)
    ));
  }
};

export default transactionEnrichService;

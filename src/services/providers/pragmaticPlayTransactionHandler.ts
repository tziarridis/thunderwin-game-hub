
import { PPWalletCallback, generatePragmaticPlayHash, PPGameConfig } from './pragmaticPlayConfig';

/**
 * Transaction handler for Pragmatic Play wallet callbacks
 */
export const pragmaticPlayTransactionHandler = {
  /**
   * Process a transaction from Pragmatic Play
   */
  processTransaction: async (
    config: PPGameConfig, 
    data: PPWalletCallback
  ): Promise<{ errorcode: string; balance: number }> => {
    try {
      console.log('Processing Pragmatic Play transaction:', data);
      
      // Validate hash if present
      if (data.hash && !pragmaticPlayTransactionHandler.validateHash(data, config.secretKey)) {
        console.error('Invalid hash in transaction');
        return { errorcode: "7", balance: 0 }; // Invalid hash error
      }
      
      // Check for duplicate transaction
      if (data.trxid && await pragmaticPlayTransactionHandler.isDuplicateTransaction(data.trxid)) {
        console.log('Duplicate transaction detected:', data.trxid);
        // For duplicates, return success but don't process again
        return { errorcode: "0", balance: await pragmaticPlayTransactionHandler.getPlayerBalance(data.playerid || '', data.currency || 'USD') };
      }
      
      // Process based on transaction type
      if (data.type === 'debit') {
        // Process a bet
        return await pragmaticPlayTransactionHandler.processBet(data);
      } else if (data.type === 'credit') {
        // Process a win
        return await pragmaticPlayTransactionHandler.processWin(data);
      } else if (data.type === 'rollback') {
        // Process a refund/rollback
        return await pragmaticPlayTransactionHandler.processRollback(data);
      } else {
        // Just return balance for other types
        const balance = await pragmaticPlayTransactionHandler.getPlayerBalance(data.playerid || '', data.currency || 'USD');
        return { errorcode: "0", balance };
      }
    } catch (error: any) {
      console.error('Error processing transaction:', error);
      return { errorcode: "1", balance: 0 }; // General error
    }
  },
  
  /**
   * Validate hash from Pragmatic Play
   */
  validateHash: (data: PPWalletCallback, secretKey: string): boolean => {
    if (!data.hash) return true; // No hash to validate
    
    const calculatedHash = generatePragmaticPlayHash(data, secretKey);
    return calculatedHash === data.hash;
  },
  
  /**
   * Check if transaction has been processed before (idempotency check)
   */
  isDuplicateTransaction: async (trxid: string): Promise<boolean> => {
    // In a real implementation, check against a database
    // For this example, we'll assume no duplicates
    return false;
  },
  
  /**
   * Process a bet transaction
   */
  processBet: async (data: PPWalletCallback): Promise<{ errorcode: string; balance: number }> => {
    try {
      // Get current balance
      const currentBalance = await pragmaticPlayTransactionHandler.getPlayerBalance(
        data.playerid || '',
        data.currency || 'USD'
      );
      
      // Check if player has sufficient balance
      if (currentBalance < (data.amount || 0)) {
        return { errorcode: "6", balance: currentBalance }; // Insufficient funds
      }
      
      // Deduct amount from balance
      const newBalance = currentBalance - (data.amount || 0);
      
      // In a real implementation, update the database
      
      return { errorcode: "0", balance: newBalance };
    } catch (error) {
      console.error('Error processing bet:', error);
      return { errorcode: "1", balance: 0 }; // General error
    }
  },
  
  /**
   * Process a win transaction
   */
  processWin: async (data: PPWalletCallback): Promise<{ errorcode: string; balance: number }> => {
    try {
      // Get current balance
      const currentBalance = await pragmaticPlayTransactionHandler.getPlayerBalance(
        data.playerid || '',
        data.currency || 'USD'
      );
      
      // Add amount to balance
      const newBalance = currentBalance + (data.amount || 0);
      
      // In a real implementation, update the database
      
      return { errorcode: "0", balance: newBalance };
    } catch (error) {
      console.error('Error processing win:', error);
      return { errorcode: "1", balance: 0 }; // General error
    }
  },
  
  /**
   * Process a rollback transaction
   */
  processRollback: async (data: PPWalletCallback): Promise<{ errorcode: string; balance: number }> => {
    try {
      // Get current balance
      const currentBalance = await pragmaticPlayTransactionHandler.getPlayerBalance(
        data.playerid || '',
        data.currency || 'USD'
      );
      
      // Add amount back to balance
      const newBalance = currentBalance + (data.amount || 0);
      
      // In a real implementation, update the database
      
      return { errorcode: "0", balance: newBalance };
    } catch (error) {
      console.error('Error processing rollback:', error);
      return { errorcode: "1", balance: 0 }; // General error
    }
  },
  
  /**
   * Get player balance
   */
  getPlayerBalance: async (playerId: string, currency: string): Promise<number> => {
    try {
      // In a real implementation, get balance from the database
      // For this example, we'll return a mock balance
      return 100.00;
    } catch (error) {
      console.error('Error getting player balance:', error);
      return 0;
    }
  }
};

export default pragmaticPlayTransactionHandler;

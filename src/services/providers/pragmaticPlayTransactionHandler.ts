
import { getWalletByUserId, updateWalletBalance } from '../walletService';
import { GameProviderConfig } from '@/config/gameProviders';
import { PPWalletCallback } from '@/services/pragmaticPlayService';
import { toast } from 'sonner';

// Map to store processed transactions for idempotency
const processedTransactions = new Map<string, any>();

export interface TransactionResponse {
  errorcode: string;
  balance: number;
}

/**
 * Pragmatic Play Transaction Handler
 * Processes transactions from Pragmatic Play
 */
export const pragmaticPlayTransactionHandler = {
  /**
   * Process a transaction from Pragmatic Play
   * @param config Provider configuration
   * @param transaction Transaction data
   * @returns Response with error code and balance
   */
  processTransaction: async (
    config: GameProviderConfig,
    transaction: PPWalletCallback
  ): Promise<TransactionResponse> => {
    try {
      console.log('Processing PP transaction:', transaction);
      
      // Validate agent ID
      if (transaction.agentid !== config.credentials.agentId) {
        console.error('Invalid agent ID:', transaction.agentid);
        return { errorcode: "1", balance: 0 };
      }
      
      // Check for duplicate transaction (idempotency)
      if (processedTransactions.has(transaction.trxid)) {
        console.log('Duplicate transaction detected:', transaction.trxid);
        return processedTransactions.get(transaction.trxid) || { errorcode: "0", balance: 100 };
      }
      
      // For demo purposes, always return a successful response with a mock balance
      // In a real implementation, you would update the player's balance in your database
      const response: TransactionResponse = { errorcode: "0", balance: 100 };
      
      // Store the response for idempotency
      processedTransactions.set(transaction.trxid, response);
      
      return response;
    } catch (error: any) {
      console.error('Error processing transaction:', error);
      toast.error(`Transaction error: ${error.message}`);
      return { errorcode: "1", balance: 0 };
    }
  },
  
  /**
   * Validate a transaction before processing
   * @param config Provider configuration
   * @param transaction Transaction data
   * @returns Whether the transaction is valid
   */
  validateTransaction: (
    config: GameProviderConfig,
    transaction: PPWalletCallback
  ): boolean => {
    // Check required fields
    if (!transaction.playerid || !transaction.trxid || !transaction.type || transaction.amount === undefined) {
      return false;
    }
    
    // Validate agent ID
    if (transaction.agentid !== config.credentials.agentId) {
      return false;
    }
    
    return true;
  },
  
  /**
   * Get transaction by ID
   * @param id Transaction ID
   * @returns Transaction data if found
   */
  getTransaction: (id: string): PPWalletCallback | null => {
    if (processedTransactions.has(id)) {
      return processedTransactions.get(id);
    }
    return null;
  },
  
  /**
   * Check if transaction has been processed
   * @param id Transaction ID
   * @returns Whether the transaction has been processed
   */
  isProcessed: (id: string): boolean => {
    return processedTransactions.has(id);
  }
};

export default pragmaticPlayTransactionHandler;

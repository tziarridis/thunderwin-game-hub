import { toast } from 'sonner';
import { PPGameConfig, PRAGMATIC_PLAY_ERROR_CODES, validatePragmaticPlayResponse } from './pragmaticPlayConfig';
import { generateSimpleHash } from '@/utils/browserHashUtils';

// Store processed transactions in memory for idempotency
const processedTransactions = new Map<string, any>();

export interface PPTransactionData {
  agentid: string;
  playerid: string;
  trxid: string;
  type: 'debit' | 'credit';
  amount: number;
  gamecode?: string;
  hash?: string;
  currency?: string;
  roundid?: string;
}

export interface PPTransactionResponse {
  errorcode: string;
  balance: number;
}

export const pragmaticPlayTransactionHandler = {
  processTransaction: async (
    config: PPGameConfig, 
    transaction: PPTransactionData
  ): Promise<PPTransactionResponse> => {
    try {
      console.log('Processing PP transaction:', transaction);
      
      // Validate transaction data
      if (!pragmaticPlayTransactionHandler.validateTransaction(config, transaction)) {
        return {
          errorcode: PRAGMATIC_PLAY_ERROR_CODES.INVALID_REQUEST,
          balance: 0
        };
      }
      
      // Check for duplicate transaction (idempotency)
      if (processedTransactions.has(transaction.trxid)) {
        const existingTransaction = processedTransactions.get(transaction.trxid);
        return existingTransaction || { 
          errorcode: PRAGMATIC_PLAY_ERROR_CODES.SUCCESS, 
          balance: 100 
        };
      }

      // Mock wallet operation (replace with real implementation)
      const response: PPTransactionResponse = {
        errorcode: PRAGMATIC_PLAY_ERROR_CODES.SUCCESS,
        balance: 100
      };
      
      // Store for idempotency
      processedTransactions.set(transaction.trxid, response);
      
      return response;
    } catch (error: any) {
      console.error('Error processing transaction:', error);
      toast.error(`Transaction error: ${error.message}`);
      return { 
        errorcode: PRAGMATIC_PLAY_ERROR_CODES.GENERAL_ERROR, 
        balance: 0 
      };
    }
  },

  validateTransaction: (config: PPGameConfig, transaction: PPTransactionData): boolean => {
    // Validate required fields
    if (!transaction.playerid || !transaction.trxid || !transaction.type || transaction.amount === undefined) {
      return false;
    }
    
    // Validate agent ID
    if (transaction.agentid !== config.agentId) {
      return false;
    }
    
    // Validate transaction type
    if (transaction.type !== 'debit' && transaction.type !== 'credit') {
      return false;
    }
    
    // Validate hash if provided
    if (transaction.hash && config.secretKey) {
      const computed = generateSimpleHash(`${transaction.trxid}|${transaction.amount}|${config.secretKey}`);
      if (computed !== transaction.hash) {
        return false;
      }
    }
    
    return true;
  },

  getTransaction: (id: string): any | null => {
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
  },
  
  /**
   * Clear processed transactions (for testing)
   */
  clearTransactions: (): void => {
    processedTransactions.clear();
  },
  
  /**
   * Get all processed transactions
   * @returns Map of processed transactions
   */
  getAllTransactions: (): Map<string, any> => {
    return processedTransactions;
  }
};


import { getWalletByUserId, updateWalletBalance } from '../walletService';
import { GameProviderConfig } from '@/config/gameProviders';
import { PPWalletCallback } from '@/services/pragmaticPlayService';
import { toast } from 'sonner';
import { createHash } from 'crypto';

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
      if (!this.validateTransaction(config, transaction)) {
        console.error('Invalid transaction data:', transaction);
        return { errorcode: "2", balance: 0 }; // Invalid transaction
      }
      
      // Check for duplicate transaction (idempotency)
      if (processedTransactions.has(transaction.trxid)) {
        console.log('Duplicate transaction detected:', transaction.trxid);
        return processedTransactions.get(transaction.trxid) || { errorcode: "0", balance: 100 };
      }
      
      try {
        // In a real implementation, you would:
        // 1. Get the user's wallet by playerId
        // const wallet = await getWalletByUserId(transaction.playerid);
        
        // 2. Check if the user has enough balance (for debit operations)
        let currentBalance = 100; // Mock balance
        let errorCode = "0"; // Success
        
        // 3. Update the balance based on the transaction type
        if (transaction.type === 'debit') {
          if (currentBalance < transaction.amount) {
            errorCode = "3"; // Insufficient balance
          } else {
            currentBalance -= transaction.amount;
            // await updateWalletBalance(transaction.playerid, -transaction.amount);
          }
        } else if (transaction.type === 'credit') {
          currentBalance += transaction.amount;
          // await updateWalletBalance(transaction.playerid, transaction.amount);
        }
        
        // 4. Create and store the response
        const response: TransactionResponse = { 
          errorcode: errorCode, 
          balance: currentBalance 
        };
        
        // Store in our idempotency map
        processedTransactions.set(transaction.trxid, response);
        
        return response;
      } catch (error) {
        console.error('Error processing wallet operation:', error);
        return { errorcode: "1", balance: 0 }; // General error
      }
      
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
      console.error('Missing required transaction fields');
      return false;
    }
    
    // Validate agent ID
    if (transaction.agentid !== config.credentials.agentId) {
      console.error('Invalid agent ID', transaction.agentid);
      return false;
    }
    
    // Validate transaction type
    if (transaction.type !== 'debit' && transaction.type !== 'credit') {
      console.error('Invalid transaction type', transaction.type);
      return false;
    }
    
    // In production, validate hash for security
    if (transaction.hash && config.credentials.secretKey) {
      // Implementation would look something like this:
      // const computed = createHash('md5')
      //   .update(`${transaction.trxid}|${transaction.amount}|${config.credentials.secretKey}`)
      //   .digest('hex');
      // return computed === transaction.hash;
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

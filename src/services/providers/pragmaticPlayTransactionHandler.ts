
import { PPWalletCallback, PPGameConfig, PRAGMATIC_PLAY_ERROR_CODES, validatePragmaticPlayResponse } from './pragmaticPlayConfig';

interface TransactionResponse {
  errorcode: string;
  balance: number;
}

/**
 * Handles processing of Pragmatic Play transaction callbacks
 */
export const pragmaticPlayTransactionHandler = {
  /**
   * Process a transaction from Pragmatic Play
   */
  processTransaction: async (
    config: PPGameConfig, 
    data: PPWalletCallback
  ): Promise<TransactionResponse> => {
    // Validate the request
    if (data.agentid !== config.agentId) {
      console.error(`Invalid agent ID: ${data.agentid}, expected: ${config.agentId}`);
      return { 
        errorcode: PRAGMATIC_PLAY_ERROR_CODES.INVALID_REQUEST, 
        balance: 0 
      };
    }
    
    if (!data.playerid || !data.trxid || !data.type || typeof data.amount !== 'number') {
      console.error('Missing required fields in request:', data);
      return { 
        errorcode: PRAGMATIC_PLAY_ERROR_CODES.INVALID_REQUEST, 
        balance: 0 
      };
    }
    
    try {
      // Check if this transaction has been processed before (idempotency)
      const isTrxIdProcessed = await pragmaticPlayTransactionHandler.isTransactionProcessed(data.trxid);
      
      if (isTrxIdProcessed) {
        console.log(`Transaction ${data.trxid} already processed (idempotent response)`);
        // Return the cached result for idempotency
        // In a real implementation, this would be fetched from the database
        const mockBalance = 100.00;
        return { 
          errorcode: PRAGMATIC_PLAY_ERROR_CODES.SUCCESS, 
          balance: mockBalance 
        };
      }
      
      // Process the transaction
      console.log(`Processing transaction ${data.trxid} of type ${data.type}`);
      
      // In a real implementation, this would interact with the wallet service
      const mockBalance = 100.00;
      
      if (data.type === 'debit') {
        // Check for sufficient funds
        if (data.amount > mockBalance) {
          return { 
            errorcode: PRAGMATIC_PLAY_ERROR_CODES.INSUFFICIENT_FUNDS, 
            balance: mockBalance 
          };
        }
      }
      
      // Store the transaction
      await pragmaticPlayTransactionHandler.storeTransaction(data);
      
      // Return success
      return { 
        errorcode: PRAGMATIC_PLAY_ERROR_CODES.SUCCESS, 
        balance: mockBalance 
      };
    } catch (error) {
      console.error('Error processing transaction:', error);
      return { 
        errorcode: PRAGMATIC_PLAY_ERROR_CODES.GENERAL_ERROR, 
        balance: 0 
      };
    }
  },
  
  /**
   * Check if a transaction has been processed before
   */
  isTransactionProcessed: async (trxId: string): Promise<boolean> => {
    // In a real implementation, this would check the database
    // For demo purposes, we'll use local storage for a mockup
    const cachedTransactions = localStorage.getItem('pp_transactions');
    if (!cachedTransactions) {
      return false;
    }
    
    try {
      const transactions = JSON.parse(cachedTransactions);
      return transactions.includes(trxId);
    } catch (e) {
      console.error('Error parsing cached transactions:', e);
      return false;
    }
  },
  
  /**
   * Store a transaction in the system
   */
  storeTransaction: async (data: PPWalletCallback): Promise<void> => {
    // In a real implementation, this would store in the database
    // For demo purposes, we'll use local storage for a mockup
    try {
      const cachedTransactions = localStorage.getItem('pp_transactions');
      let transactions = [];
      
      if (cachedTransactions) {
        transactions = JSON.parse(cachedTransactions);
      }
      
      if (!transactions.includes(data.trxid)) {
        transactions.push(data.trxid);
        localStorage.setItem('pp_transactions', JSON.stringify(transactions));
      }
    } catch (e) {
      console.error('Error storing transaction:', e);
    }
  }
};

export default pragmaticPlayTransactionHandler;

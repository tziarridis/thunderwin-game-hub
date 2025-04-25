
import { PPWalletCallback, PPGameConfig, PRAGMATIC_PLAY_ERROR_CODES, validatePragmaticPlayResponse } from './pragmaticPlayConfig';
import { simpleMD5 } from '@/utils/browserHashUtils';

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
    
    // Validate hash if present
    if (data.hash && !pragmaticPlayTransactionHandler.validateHash(data, config.secretKey)) {
      console.error('Invalid hash in request:', data);
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
        const mockBalance = await pragmaticPlayTransactionHandler.getPlayerBalance(data.playerid, data.currency || config.currency);
        return { 
          errorcode: PRAGMATIC_PLAY_ERROR_CODES.SUCCESS, 
          balance: mockBalance 
        };
      }
      
      // Process the transaction
      console.log(`Processing transaction ${data.trxid} of type ${data.type} for player ${data.playerid}`);
      
      // Get current player balance
      const currentBalance = await pragmaticPlayTransactionHandler.getPlayerBalance(data.playerid, data.currency || config.currency);
      
      let newBalance = currentBalance;
      if (data.type === 'debit') {
        // Check for sufficient funds
        if (data.amount > currentBalance) {
          return { 
            errorcode: PRAGMATIC_PLAY_ERROR_CODES.INSUFFICIENT_FUNDS, 
            balance: currentBalance 
          };
        }
        // Deduct amount from balance
        newBalance = currentBalance - data.amount;
      } else if (data.type === 'credit') {
        // Add amount to balance
        newBalance = currentBalance + data.amount;
      }
      
      // Store the transaction with balance updates
      await pragmaticPlayTransactionHandler.storeTransaction({
        ...data,
        balance_before: currentBalance,
        balance_after: newBalance
      });
      
      // Update player balance
      await pragmaticPlayTransactionHandler.updatePlayerBalance(data.playerid, newBalance, data.currency || config.currency);
      
      // Return success with new balance
      return { 
        errorcode: PRAGMATIC_PLAY_ERROR_CODES.SUCCESS, 
        balance: newBalance 
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
   * Validate hash received from Pragmatic Play
   */
  validateHash: (data: PPWalletCallback, secretKey: string): boolean => {
    try {
      if (!data.hash) return true; // Skip validation if no hash provided
      
      const { hash, ...dataWithoutHash } = data;
      
      // Sort properties alphabetically as required by PP API
      const orderedData = Object.keys(dataWithoutHash)
        .sort()
        .reduce((obj, key) => {
          obj[key] = dataWithoutHash[key as keyof typeof dataWithoutHash];
          return obj;
        }, {} as Record<string, any>);
      
      // Create string with key-value pairs
      let hashString = '';
      Object.entries(orderedData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          hashString += `${key}=${value}`;
        }
      });
      
      // Append secret key
      hashString += secretKey;
      
      // Generate MD5 hash using our browser-compatible function
      const generatedHash = simpleMD5(hashString);
      
      return generatedHash === hash;
    } catch (error) {
      console.error('Error validating hash:', error);
      return false;
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
  storeTransaction: async (data: PPWalletCallback & { balance_before?: number, balance_after?: number }): Promise<void> => {
    // In a real implementation, this would store in the database
    // For demo purposes, we'll use local storage for a mockup
    try {
      // Store transaction ID for idempotency
      const cachedTransactions = localStorage.getItem('pp_transactions');
      let transactions = [];
      
      if (cachedTransactions) {
        transactions = JSON.parse(cachedTransactions);
      }
      
      if (!transactions.includes(data.trxid)) {
        transactions.push(data.trxid);
        localStorage.setItem('pp_transactions', JSON.stringify(transactions));
      }
      
      // Store complete transaction details
      const transactionDetails = localStorage.getItem('pp_transaction_details');
      let details = [] as any[];
      
      if (transactionDetails) {
        details = JSON.parse(transactionDetails);
      }
      
      details.push({
        ...data,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem('pp_transaction_details', JSON.stringify(details));
    } catch (e) {
      console.error('Error storing transaction:', e);
    }
  },
  
  /**
   * Get a player's current balance
   */
  getPlayerBalance: async (playerId: string, currency: string): Promise<number> => {
    // In a real implementation, this would fetch from the database
    // For demo purposes, we'll use local storage for a mockup
    try {
      const balances = localStorage.getItem('pp_player_balances');
      if (balances) {
        const balanceData = JSON.parse(balances);
        const playerKey = `${playerId}_${currency}`;
        if (balanceData[playerKey] !== undefined) {
          return balanceData[playerKey];
        }
      }
      
      // Return default balance if not found
      return 100.00;
    } catch (error) {
      console.error('Error getting player balance:', error);
      return 100.00; // Default balance
    }
  },
  
  /**
   * Update a player's balance
   */
  updatePlayerBalance: async (playerId: string, newBalance: number, currency: string): Promise<void> => {
    // In a real implementation, this would update the database
    // For demo purposes, we'll use local storage for a mockup
    try {
      const balances = localStorage.getItem('pp_player_balances');
      let balanceData = {} as Record<string, number>;
      
      if (balances) {
        balanceData = JSON.parse(balances);
      }
      
      const playerKey = `${playerId}_${currency}`;
      balanceData[playerKey] = newBalance;
      
      localStorage.setItem('pp_player_balances', JSON.stringify(balanceData));
    } catch (error) {
      console.error('Error updating player balance:', error);
    }
  }
};

export default pragmaticPlayTransactionHandler;

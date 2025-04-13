
import axios from 'axios';
import { toast } from 'sonner';
import { getProviderConfig } from '@/config/gameProviders';
import crypto from 'crypto';
import { createTransaction, updateTransaction } from './transactionService';

// Get GitSlotPark configuration
const gspConfig = getProviderConfig('gspeur');

// GSP API Constants
const GSP_API_BASE = `https://${gspConfig?.credentials.apiEndpoint || 'apiv2.gitslotpark.com'}`;
const GSP_AGENT_ID = gspConfig?.credentials.agentId || 'Partner01';
const GSP_API_TOKEN = gspConfig?.credentials.apiToken || 'e5h2c84215935ebfc8371df59e679c773ea081f8edd273358c83ff9f16e024ce';
const GSP_SECRET_KEY = gspConfig?.credentials.secretKey || '1234567890';
const GSP_CURRENCY = gspConfig?.currency || 'EUR';

// Interface for game launch options
export interface GSPGameLaunchOptions {
  playerId: string;
  gameId: string | number;
  language?: string;
  platform?: 'web' | 'mobile';
  mode?: 'real' | 'demo';
  returnUrl?: string;
}

// Interface for wallet callback request
export interface GSPWalletCallback {
  agentID: string;
  userID: string;
  amount?: number;
  transactionID?: string;
  roundID?: string;
  type?: 'Withdraw' | 'Deposit' | 'BetWin' | 'RollbackTransaction';
  gameID?: number;
  refTransactionID?: string;
  freeSpinID?: string;
  sign?: string;
  isBonusBuy?: number;
}

// Interface for wallet response
export interface GSPWalletResponse {
  code: number;
  balance: number;
  message?: string;
  platformTransactionID?: string;
}

// Store processed transactions to prevent duplicates
const processedTransactions = new Map<string, GSPWalletResponse>();

/**
 * Generates HMAC-SHA256 signature for GitSlotPark API
 * @param key Secret key
 * @param message Message to sign
 * @returns Signature as hex string
 */
export const generateSign = (key: string, message: string): string => {
  try {
    // In a browser environment, we need to use the Web Crypto API
    if (typeof window !== 'undefined' && window.crypto) {
      // This is a simplified implementation - in production, you should use a proper HMAC library
      const hmac = crypto.createHmac('sha256', key);
      hmac.update(message);
      return hmac.digest('hex').toUpperCase();
    } else {
      // Fallback for non-browser environments
      console.warn('Crypto functionality not available in this environment');
      return '';
    }
  } catch (error) {
    console.error('Error generating sign:', error);
    return '';
  }
};

// Verify the signature from GitSlotPark
const verifySign = (data: GSPWalletCallback): boolean => {
  try {
    const { sign, ...rest } = data;
    
    if (!sign) return false;
    
    let message = '';
    
    // Create message based on operation type
    if (rest.type === 'Withdraw') {
      // Withdraw message format: agentID + userID + amount + transactionID + roundID + gameID
      message = `${rest.agentID}${rest.userID}${formatAmount(rest.amount)}${rest.transactionID}${rest.roundID}${rest.gameID}`;
    } else if (rest.type === 'Deposit') {
      // Deposit message format: agentID + userID + amount + refTransactionID + transactionID + roundID + gameID
      message = `${rest.agentID}${rest.userID}${formatAmount(rest.amount)}${rest.refTransactionID}${rest.transactionID}${rest.roundID}${rest.gameID}`;
    } else if (rest.type === 'RollbackTransaction') {
      // Rollback message format: agentID + userID + refTransactionID + gameID
      message = `${rest.agentID}${rest.userID}${rest.refTransactionID}${rest.gameID}`;
    } else {
      // GetBalance message format: agentID + userID
      message = `${rest.agentID}${rest.userID}`;
    }
    
    const computedSign = generateSign(GSP_SECRET_KEY, message);
    return computedSign === sign;
  } catch (error) {
    console.error('Error verifying sign:', error);
    return false;
  }
};

// Format amount to 2 decimal places for consistent signature generation
const formatAmount = (amount?: number): string => {
  if (amount === undefined) return '0.00';
  return amount.toFixed(2);
};

// Service for GitSlotPark integration
export const gitSlotParkService = {
  /**
   * Launch a GitSlotPark game
   * @param options Game launch options
   * @returns Promise with game URL
   */
  launchGame: async (options: GSPGameLaunchOptions): Promise<string> => {
    const { 
      playerId, 
      gameId, 
      language = 'en', 
      platform = 'web',
      mode = 'demo',
      returnUrl = window.location.origin + '/casino'
    } = options;

    try {
      // For demo mode, we use a simpler approach
      if (mode === 'demo') {
        // Demo URL format for GitSlotPark
        const demoUrl = `${GSP_API_BASE}/demo/launch?gameId=${gameId}&lang=${language}&platform=${platform}&lobbyUrl=${encodeURIComponent(returnUrl)}`;
        console.log('Launching GSP demo game:', demoUrl);
        return demoUrl;
      }
      
      // For real money, we need to make an authenticated API call
      // Create message for signature
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const message = `${GSP_AGENT_ID}${playerId}${gameId}${language}${timestamp}`;
      const sign = generateSign(GSP_SECRET_KEY, message);
      
      const response = await axios.post(`${GSP_API_BASE}/launch`, {
        agentID: GSP_AGENT_ID,
        userID: playerId,
        gameID: gameId,
        language: language,
        currency: GSP_CURRENCY,
        platform: platform,
        returnURL: returnUrl,
        timestamp: timestamp,
        sign: sign
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GSP_API_TOKEN}`,
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.url) {
        return response.data.url;
      } else {
        throw new Error('Invalid response from GitSlotPark API');
      }
    } catch (error: any) {
      console.error('Error launching GSP game:', error);
      
      // Fallback to demo mode if there's an error
      if (mode === 'real') {
        toast.error("Failed to launch real money game. Falling back to demo mode.");
        return gitSlotParkService.launchGame({
          ...options,
          mode: 'demo'
        });
      }
      
      throw new Error(`Failed to launch game: ${error.message || 'Unknown error'}`);
    }
  },
  
  /**
   * Process wallet callback from GitSlotPark
   * This would normally be on your server
   * @param callback Wallet callback data
   * @returns Promise with response data
   */
  processWalletCallback: async (callback: GSPWalletCallback): Promise<GSPWalletResponse> => {
    // This is a client-side mock implementation
    // In a real implementation, this would be a server-side endpoint
    
    try {
      // Log incoming request for debugging
      console.log('Processing GitSlotPark wallet callback:', callback);
      
      // Validate agent ID
      if (callback.agentID !== GSP_AGENT_ID) {
        return { code: 4, balance: 0, message: "Invalid Agent" };
      }
      
      // Verify the signature - in a real implementation this is critical
      if (!verifySign(callback)) {
        return { code: 3, balance: 0, message: "Invalid Sign" };
      }
      
      // Check user existence - mock implementation
      if (!callback.userID || callback.userID.length < 4) {
        return { code: 5, balance: 0, message: "User ID not found" };
      }
      
      // Mock user balance - in production this would come from your database
      let userBalance = 1000.00;
      
      // Process based on operation type
      switch (callback.type) {
        case 'Withdraw':
          return gitSlotParkService.processWithdraw(callback, userBalance);
        
        case 'Deposit':
          return gitSlotParkService.processDeposit(callback, userBalance);
          
        case 'RollbackTransaction':
          return gitSlotParkService.processRollback(callback, userBalance);
          
        default:
          // GetBalance is the default if no specific type
          return { 
            code: 0, 
            balance: userBalance,
            platformTransactionID: crypto.randomUUID().replace(/-/g, '')
          };
      }
    } catch (error: any) {
      console.error('Error processing wallet callback:', error);
      return { 
        code: 1,
        balance: 0,
        message: error.message || "General error processing transaction"
      };
    }
  },
  
  /**
   * Process withdraw (betting) operation
   * @param data Withdraw data
   * @param currentBalance Current user balance
   * @returns Response with new balance
   */
  processWithdraw: async (data: GSPWalletCallback, currentBalance: number): Promise<GSPWalletResponse> => {
    if (!data.transactionID) {
      return { code: 2, balance: currentBalance, message: "Missing transaction ID" };
    }
    
    // Check for duplicate transaction
    if (processedTransactions.has(data.transactionID)) {
      const existingResponse = processedTransactions.get(data.transactionID);
      return { 
        ...existingResponse!,
        code: 11,
        message: "Duplicate transaction"
      };
    }
    
    // Check sufficient funds
    if (!data.amount || currentBalance < data.amount) {
      return { code: 6, balance: currentBalance, message: "Insufficient funds" };
    }
    
    // Calculate new balance
    const newBalance = currentBalance - (data.amount || 0);
    
    // Generate a platform transaction ID
    const platformTransactionID = crypto.randomUUID().replace(/-/g, '');
    
    // Create transaction record
    try {
      await createTransaction(
        data.userID,
        data.userID,
        'bet',
        data.amount || 0,
        GSP_CURRENCY,
        'completed',
        'GitSlotPark',
        data.gameID?.toString()
      );
    } catch (error) {
      console.error('Error creating transaction record:', error);
    }
    
    // Store processed transaction
    const response: GSPWalletResponse = {
      code: 0,
      balance: newBalance,
      platformTransactionID
    };
    processedTransactions.set(data.transactionID, response);
    
    return response;
  },
  
  /**
   * Process deposit (win) operation
   * @param data Deposit data
   * @param currentBalance Current user balance
   * @returns Response with new balance
   */
  processDeposit: async (data: GSPWalletCallback, currentBalance: number): Promise<GSPWalletResponse> => {
    if (!data.transactionID) {
      return { code: 2, balance: currentBalance, message: "Missing transaction ID" };
    }
    
    // Check for duplicate transaction
    if (processedTransactions.has(data.transactionID)) {
      const existingResponse = processedTransactions.get(data.transactionID);
      return { 
        ...existingResponse!,
        code: 11,
        message: "Duplicate transaction"
      };
    }
    
    // Calculate new balance
    const newBalance = currentBalance + (data.amount || 0);
    
    // Generate a platform transaction ID
    const platformTransactionID = crypto.randomUUID().replace(/-/g, '');
    
    // Create transaction record
    try {
      await createTransaction(
        data.userID,
        data.userID,
        'win',
        data.amount || 0,
        GSP_CURRENCY,
        'completed',
        'GitSlotPark',
        data.gameID?.toString()
      );
    } catch (error) {
      console.error('Error creating transaction record:', error);
    }
    
    // Store processed transaction
    const response: GSPWalletResponse = {
      code: 0,
      balance: newBalance,
      platformTransactionID
    };
    processedTransactions.set(data.transactionID, response);
    
    return response;
  },
  
  /**
   * Process transaction rollback
   * @param data Rollback data
   * @param currentBalance Current user balance
   * @returns Response with new balance
   */
  processRollback: async (data: GSPWalletCallback, currentBalance: number): Promise<GSPWalletResponse> => {
    if (!data.refTransactionID) {
      return { code: 2, balance: currentBalance, message: "Missing reference transaction ID" };
    }
    
    // Check if transaction exists
    if (!processedTransactions.has(data.refTransactionID)) {
      return { code: 8, balance: currentBalance, message: "Could not find reference transaction id" };
    }
    
    // Check if already rolled back (in a real system you'd store this state)
    const isRolledBack = false; // This would be checked from your database
    if (isRolledBack) {
      return { code: 9, balance: currentBalance, message: "Transaction is already rolled back" };
    }
    
    // Find the original transaction
    const originalTx = processedTransactions.get(data.refTransactionID);
    if (!originalTx) {
      return { code: 8, balance: currentBalance, message: "Could not find reference transaction id" };
    }
    
    // In a real implementation, you'd reverse the effects of the transaction
    // For this mock implementation, we'll just return the current balance
    
    // Mark as rolled back in a real system
    
    return {
      code: 0,
      balance: currentBalance,
      message: "Transaction rolled back successfully"
    };
  },
  
  /**
   * Process BetWin operation - combined bet and win
   * @param data BetWin data
   * @param currentBalance Current user balance
   * @returns Response with new balance
   */
  processBetWin: async (data: GSPWalletCallback, currentBalance: number): Promise<GSPWalletResponse> => {
    if (!data.transactionID) {
      return { code: 2, balance: currentBalance, message: "Missing transaction ID" };
    }
    
    // Check for duplicate transaction
    if (processedTransactions.has(data.transactionID)) {
      const existingResponse = processedTransactions.get(data.transactionID);
      return { 
        ...existingResponse!,
        code: 11,
        message: "Duplicate transaction"
      };
    }
    
    // In a real implementation, you'd process both bet and win in a single transaction
    // For this mock implementation, we'll just adjust the balance
    
    // Generate a platform transaction ID
    const platformTransactionID = crypto.randomUUID().replace(/-/g, '');
    
    // Store processed transaction
    const response: GSPWalletResponse = {
      code: 0,
      balance: currentBalance,
      platformTransactionID
    };
    processedTransactions.set(data.transactionID, response);
    
    return response;
  },
  
  /**
   * Get available GSP games
   * @returns Array of game IDs and names
   */
  getAvailableGames: () => {
    // In a real implementation, you would fetch this from GSP's API
    // This is a static list for demo purposes
    return [
      { id: 2001, name: 'Book of Ra' },
      { id: 2002, name: 'Sizzling Hot' },
      { id: 2003, name: 'Lucky Lady\'s Charm' },
      { id: 2004, name: 'Dolphin\'s Pearl' },
      { id: 2005, name: 'Columbus' },
      { id: 2006, name: 'Bananas Go Bahamas' },
      { id: 2007, name: 'Lord of the Ocean' },
      { id: 2008, name: 'Golden Sevens' }
    ];
  },
  
  /**
   * Cancel a free game
   * @param playerId Player ID
   * @param gameId Game ID
   * @param freespinId Free spin ID
   * @returns Promise with response
   */
  cancelFreeGame: async (playerId: string, gameId: number, freespinId: string): Promise<{code: number, message?: string}> => {
    try {
      const response = await axios.post(`${GSP_API_BASE}/cancelfreegame`, {
        agentID: GSP_AGENT_ID,
        userID: playerId,
        gameID: gameId,
        freespinID: freespinId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GSP_API_TOKEN}`,
          'Accept': 'application/json'
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling free game:', error);
      return {
        code: 1,
        message: error.message || 'Unknown error'
      };
    }
  }
};

export default gitSlotParkService;

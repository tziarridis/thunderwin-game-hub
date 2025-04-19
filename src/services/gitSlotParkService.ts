
import { v4 as uuidv4 } from 'uuid';
import { createTransaction, getTransactions as fetchTransactions, Transaction } from './transactionService';
import { gitSlotParkSeamlessAPI } from './gitSlotParkSeamlessAPI';

// Interface for game launch options
interface GameLaunchOptions {
  playerId: string;
  gameCode: string;
  mode?: 'real' | 'demo';
  language?: string;
  returnUrl?: string;
}

// Interface for callback request
interface CallbackRequest {
  agentID: string;
  sign: string;
  userID: string;
  amount?: number;
  transactionID?: string;
  refTransactionID?: string;
  roundID?: string;
  gameID?: number;
  freeSpinID?: string;
  isBonusBuy?: number;
}

// Mock game data
const games = [
  { code: '2001', name: 'Fruit Slots', type: 'slots' },
  { code: '2002', name: 'Dragon Quest', type: 'slots' },
  { code: '2003', name: 'Blackjack', type: 'table' },
  { code: '2004', name: 'Roulette', type: 'table' },
  { code: '2005', name: 'Crazy 777', type: 'slots' }
];

/**
 * GitSlotPark Service
 * Handles integration with GitSlotPark game provider
 */
export const gitSlotParkService = {
  /**
   * Get the available games
   * @returns Array of available games
   */
  getAvailableGames: () => {
    return games;
  },
  
  /**
   * Launch a game
   * @param options Game launch options
   * @returns Promise with the game URL
   */
  launchGame: async (options: GameLaunchOptions): Promise<string> => {
    const { 
      playerId, 
      gameCode, 
      mode = 'demo', 
      language = 'en', 
      returnUrl = window.location.origin + '/casino' 
    } = options;
    
    // Mock game launch URL
    console.log(`Launching GitSlotPark game ${gameCode} for player ${playerId} in ${mode} mode`);
    
    // Different URL for demo and real money
    if (mode === 'demo') {
      return `https://example.com/gsp/launch?game=${gameCode}&mode=demo&lang=${language}&returnUrl=${encodeURIComponent(returnUrl)}`;
    } else {
      // For real money mode, we would typically generate a secure token
      const token = uuidv4().replace(/-/g, '');
      return `https://example.com/gsp/launch?game=${gameCode}&mode=real&player=${playerId}&token=${token}&lang=${language}&returnUrl=${encodeURIComponent(returnUrl)}`;
    }
  },
  
  /**
   * Process a callback from the game provider
   * This would be an endpoint in a real implementation
   * @param data The callback data
   * @returns Response to send back to the provider
   */
  processCallback: async (data: CallbackRequest): Promise<any> => {
    console.log('Processing GitSlotPark callback:', data);
    
    // Check which type of callback this is
    if (data.transactionID && data.amount !== undefined && !data.refTransactionID) {
      // This is a Withdraw (bet) request
      return await gitSlotParkSeamlessAPI.withdraw({
        agentID: data.agentID,
        sign: data.sign,
        userID: data.userID,
        amount: data.amount,
        transactionID: data.transactionID,
        roundID: data.roundID || '',
        gameID: data.gameID || 0,
        freeSpinID: data.freeSpinID,
        isBonusBuy: data.isBonusBuy
      });
    } 
    else if (data.transactionID && data.amount !== undefined && data.refTransactionID) {
      // This is a Deposit (win) request
      return await gitSlotParkSeamlessAPI.deposit({
        agentID: data.agentID,
        sign: data.sign,
        userID: data.userID,
        amount: data.amount,
        refTransactionID: data.refTransactionID,
        transactionID: data.transactionID,
        roundID: data.roundID || '',
        gameID: data.gameID || 0,
        freeSpinID: data.freeSpinID
      });
    }
    else if (data.refTransactionID && !data.transactionID) {
      // This is a Rollback request
      return await gitSlotParkSeamlessAPI.rollback({
        agentID: data.agentID,
        sign: data.sign,
        userID: data.userID,
        refTransactionID: data.refTransactionID,
        gameID: data.gameID || 0
      });
    }
    
    // Unknown callback type
    return {
      code: 1, // General error
      message: "Unknown callback type"
    };
  },
  
  /**
   * Get user balance
   * @param userId The user ID
   * @returns User balance object
   */
  getBalance: async (userId: string): Promise<{ balance: number }> => {
    // Get balance from the seamless API
    const balance = gitSlotParkSeamlessAPI.getBalance(userId);
    return { balance };
  },
  
  /**
   * Get user transactions
   * @param userId The user ID
   * @returns Array of transactions
   */
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    // Fetch transactions for the user from the transaction service
    const transactions = await fetchTransactions({
      userId,
      provider: 'GitSlotPark',
      limit: 50
    });
    
    return transactions;
  },
  
  /**
   * Credit user account (add funds)
   * @param userId The user ID
   * @param amount The amount to credit
   * @returns Result of the operation
   */
  credit: async (userId: string, amount: number): Promise<{ success: boolean, message?: string }> => {
    try {
      if (amount <= 0) {
        return { success: false, message: "Amount must be greater than zero" };
      }
      
      // Create a transaction ID
      const transactionId = uuidv4().replace(/-/g, '');
      
      // Create a deposit transaction
      await createTransaction(
        userId,
        userId,
        'credit',
        amount,
        'EUR',
        'completed',
        'GitSlotPark',
        undefined,
        undefined,
        transactionId
      );
      
      // Update user balance in the mock system
      const balance = gitSlotParkSeamlessAPI.getBalance(userId) + amount;
      
      return { success: true };
    } catch (error: any) {
      console.error("Error crediting account:", error);
      return { success: false, message: error.message || "Failed to credit account" };
    }
  },
  
  /**
   * Debit user account (remove funds)
   * @param userId The user ID
   * @param amount The amount to debit
   * @returns Result of the operation
   */
  debit: async (userId: string, amount: number): Promise<{ success: boolean, message?: string }> => {
    try {
      if (amount <= 0) {
        return { success: false, message: "Amount must be greater than zero" };
      }
      
      // Check if user has sufficient funds
      const balance = gitSlotParkSeamlessAPI.getBalance(userId);
      if (balance < amount) {
        return { success: false, message: "Insufficient funds" };
      }
      
      // Create a transaction ID
      const transactionId = uuidv4().replace(/-/g, '');
      
      // Create a withdrawal transaction
      await createTransaction(
        userId,
        userId,
        'debit',
        amount,
        'EUR',
        'completed',
        'GitSlotPark',
        undefined,
        undefined,
        transactionId
      );
      
      return { success: true };
    } catch (error: any) {
      console.error("Error debiting account:", error);
      return { success: false, message: error.message || "Failed to debit account" };
    }
  }
};

export default gitSlotParkService;


import axios from 'axios';
import { toast } from 'sonner';
import { getProviderConfig } from '@/config/gameProviders';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '@/services/transactionService';

// Get GitSlotPark EUR configuration
const gspConfig = getProviderConfig('gspeur');

// GSP API Constants based on the documentation
const GSP_API_BASE = `https://${gspConfig?.credentials.apiEndpoint || 'apiv2.gitslotpark.com'}`;
const GSP_AGENT_ID = gspConfig?.credentials.agentId || 'Partner01';
const GSP_API_TOKEN = gspConfig?.credentials.apiToken || 'e5h2c84215935ebfc8371df59e679c773ea081f8edd273358c83ff9f16e024ce';
const GSP_SECRET_KEY = gspConfig?.credentials.secretKey || '1234567890';
const GSP_CURRENCY = gspConfig?.currency || 'EUR';

// Store processed transactions to prevent duplicates
const processedTransactions = new Map();

// Interface for game launch options
export interface GSPGameLaunchOptions {
  playerId: string;
  gameCode: string;
  language?: string;
  mode?: 'real' | 'demo';
  returnUrl?: string;
}

// Interface for wallet callback request based on documentation
export interface GSPWalletCallback {
  partner_id: string;
  player_id: string;
  amount: number;
  currency: string;
  transaction_type: 'bet' | 'win';
  transaction_id: string;
  game_id: string;
  round_id: string;
  timestamp: number;
}

// Interface for balance request
export interface GSPBalanceRequest {
  partner_id: string;
  player_id: string;
  currency: string;
}

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
      gameCode, 
      language = 'en', 
      mode = 'demo',
      returnUrl = window.location.origin + '/casino'
    } = options;

    try {
      // Prepare parameters according to documentation
      const params = {
        partner_id: GSP_AGENT_ID,
        player_id: playerId,
        game_id: gameCode,
        mode: mode,
        language: language,
        currency: GSP_CURRENCY,
        return_url: returnUrl,
        token: GSP_API_TOKEN,
      };
      
      // For demo purposes, simulate the API response
      // In production this would be an actual API call
      console.log('Launching GSP game with params:', params);
      
      // Build a mock URL structure based on documentation
      const gameUrl = `${GSP_API_BASE}/games/launch?${new URLSearchParams({
        partner_id: params.partner_id,
        player_id: params.player_id,
        game_id: params.game_id,
        mode: params.mode,
        language: params.language,
        currency: params.currency,
        return_url: encodeURIComponent(params.return_url),
        token: params.token
      }).toString()}`;
      
      return gameUrl;
    } catch (error: any) {
      console.error('Error launching GSP game:', error);
      throw new Error(`Failed to launch game: ${error.message || 'Unknown error'}`);
    }
  },
  
  /**
   * Get player balance from GitSlotPark
   * @param playerId The player ID
   * @returns Promise with balance data
   */
  getBalance: async (playerId: string): Promise<{ balance: number, currency: string }> => {
    try {
      // In a real implementation, this would be a server-side API call
      const params: GSPBalanceRequest = {
        partner_id: GSP_AGENT_ID,
        player_id: playerId,
        currency: GSP_CURRENCY
      };
      
      console.log('Getting balance for player:', playerId);
      
      // Simulate the API response for demo
      return {
        balance: 1000.00,
        currency: GSP_CURRENCY
      };
    } catch (error: any) {
      console.error('Error getting player balance:', error);
      throw new Error(`Failed to get balance: ${error.message || 'Unknown error'}`);
    }
  },
  
  /**
   * Process callback from GitSlotPark based on documentation
   * @param data Callback data
   * @returns Promise with response
   */
  processCallback: async (data: GSPWalletCallback): Promise<any> => {
    try {
      console.log('Processing GitSlotPark callback:', data);
      
      // Validate the partner ID
      if (data.partner_id !== GSP_AGENT_ID) {
        return {
          status: "error",
          error_code: "INVALID_PARTNER",
          message: "Invalid partner ID"
        };
      }
      
      // Check for duplicate transaction
      if (processedTransactions.has(data.transaction_id)) {
        console.log('Duplicate transaction detected:', data.transaction_id);
        // Return the same response as before for idempotency
        return processedTransactions.get(data.transaction_id) || {
          status: "success",
          balance: 1000.00,
          currency: GSP_CURRENCY
        };
      }
      
      // Process based on transaction type according to documentation
      let newBalance = 1000.00; // Mock starting balance
      
      if (data.transaction_type === 'bet') {
        // Debit the amount (bet)
        if (data.amount > newBalance) {
          return {
            status: "error",
            error_code: "INSUFFICIENT_FUNDS",
            message: "Insufficient funds for this transaction"
          };
        }
        
        newBalance -= data.amount;
      } else if (data.transaction_type === 'win') {
        // Credit the amount (win)
        newBalance += data.amount;
      }
      
      // Store the response for idempotency
      const response = {
        status: "success",
        balance: newBalance,
        currency: GSP_CURRENCY
      };
      
      processedTransactions.set(data.transaction_id, response);
      return response;
    } catch (error: any) {
      console.error('Error processing GitSlotPark callback:', error);
      return {
        status: "error",
        error_code: "INTERNAL_ERROR",
        message: error.message || "Unknown error"
      };
    }
  },
  
  /**
   * Get available GitSlotPark games
   * @returns Array of game codes and names
   */
  getAvailableGames: () => {
    // In a real implementation, this would come from GitSlotPark's API
    return [
      { code: 'gsp_slots_1', name: 'GSP Mega Fortune' },
      { code: 'gsp_slots_2', name: 'GSP Treasure Hunt' },
      { code: 'gsp_slots_3', name: 'GSP Lucky Sevens' },
      { code: 'gsp_slots_4', name: 'GSP Diamond Blast' },
      { code: 'gsp_slots_5', name: 'GSP Gold Rush' },
      { code: 'gsp_blackjack', name: 'GSP Blackjack' },
      { code: 'gsp_roulette', name: 'GSP Roulette' },
      { code: 'gsp_baccarat', name: 'GSP Baccarat' }
    ];
  },

  /**
   * Get player transactions from GitSlotPark
   * @param playerId The player ID
   * @returns Promise with transaction data
   */
  getTransactions: async (playerId: string): Promise<Transaction[]> => {
    try {
      // In a real implementation, this would be a server-side API call
      console.log('Getting transactions for player:', playerId);
      
      // Simulate the API response for demo with mock transactions
      const mockTransactions: Transaction[] = Array(10).fill(0).map((_, index) => ({
        id: `gsp-tx-${index + 1000}`,
        player_id: playerId,
        session_id: `session-${300 + index}`,
        game_id: `gsp_slots_${(index % 5) + 1}`,
        round_id: `round-${400 + index}`,
        provider: 'GitSlotPark',
        type: index % 2 === 0 ? 'bet' : 'win',
        amount: index % 2 === 0 ? 10.00 + index : 15.00 + (index * 2),
        currency: GSP_CURRENCY,
        status: index % 5 === 0 ? 'pending' : (index % 5 === 1 ? 'failed' : 'completed'),
        balance_before: 1000.00 + (index * 5),
        balance_after: 1000.00 + (index * 5) + (index % 2 === 0 ? -(10.00 + index) : (15.00 + (index * 2))),
        created_at: new Date(Date.now() - index * 3600000).toISOString(),
        updated_at: new Date(Date.now() - index * 3600000).toISOString(),
        
        // UI-friendly properties
        transactionId: `gsp-tx-${index + 1000}`,
        userId: playerId,
        gameId: `gsp_slots_${(index % 5) + 1}`,
        roundId: `round-${400 + index}`,
        timestamp: new Date(Date.now() - index * 3600000).toISOString()
      }));
      
      return mockTransactions;
    } catch (error: any) {
      console.error('Error getting player transactions:', error);
      throw new Error(`Failed to get transactions: ${error.message || 'Unknown error'}`);
    }
  },

  /**
   * Credit funds to player wallet
   * @param playerId The player ID
   * @param amount The amount to credit
   * @returns Promise with result
   */
  credit: async (playerId: string, amount: number): Promise<{success: boolean, message?: string, balance?: number}> => {
    try {
      if (amount <= 0) {
        return {
          success: false,
          message: "Amount must be greater than zero"
        };
      }
      
      console.log(`Crediting ${amount} to player ${playerId}`);
      
      // Simulate a successful credit transaction
      return {
        success: true,
        message: "Deposit successful",
        balance: 1000.00 + amount
      };
    } catch (error: any) {
      console.error('Error crediting funds:', error);
      return {
        success: false,
        message: error.message || "Unknown error occurred"
      };
    }
  },

  /**
   * Debit funds from player wallet
   * @param playerId The player ID
   * @param amount The amount to debit
   * @returns Promise with result
   */
  debit: async (playerId: string, amount: number): Promise<{success: boolean, message?: string, balance?: number}> => {
    try {
      if (amount <= 0) {
        return {
          success: false,
          message: "Amount must be greater than zero"
        };
      }
      
      console.log(`Debiting ${amount} from player ${playerId}`);
      
      // Get current balance
      const { balance } = await gitSlotParkService.getBalance(playerId);
      
      // Check if player has sufficient balance
      if (amount > balance) {
        return {
          success: false,
          message: "Insufficient funds for this transaction"
        };
      }
      
      // Simulate a successful debit transaction
      return {
        success: true,
        message: "Withdrawal successful",
        balance: balance - amount
      };
    } catch (error: any) {
      console.error('Error debiting funds:', error);
      return {
        success: false,
        message: error.message || "Unknown error occurred"
      };
    }
  }
};

export default gitSlotParkService;

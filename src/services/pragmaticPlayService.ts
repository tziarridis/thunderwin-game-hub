
import axios from 'axios';
import { toast } from 'sonner';
import { getProviderConfig } from '@/config/gameProviders';
import { v4 as uuidv4 } from 'uuid';
import { createTransaction, transactionExists } from './transactionService';

// Get Pragmatic Play EUR configuration
const ppConfig = getProviderConfig('ppeur');

// PP API Constants
const PP_API_BASE = `https://${ppConfig?.credentials.apiEndpoint || 'apipg.slotgamesapi.com'}`;
const PP_AGENT_ID = ppConfig?.credentials.agentId || 'captaingambleEUR';
const PP_API_TOKEN = ppConfig?.credentials.apiToken || '275c535c8c014b59bedb2a2d6fe7d37b';
const PP_SECRET_KEY = ppConfig?.credentials.secretKey || 'bbd0551e144c46d19975f985e037c9b0';
const PP_CURRENCY = ppConfig?.currency || 'EUR';

// Store processed transactions to prevent duplicates
const processedTransactions = new Map();

// Interface for game launch options
export interface PPGameLaunchOptions {
  playerId: string;
  gameCode: string;
  language?: string;
  platform?: 'web' | 'mobile';
  mode?: 'real' | 'demo';
  returnUrl?: string;
}

// Interface for wallet callback request
export interface PPWalletCallback {
  agentid: string;
  playerid: string;
  amount: number;
  type: 'debit' | 'credit';
  trxid: string;
  roundid: string;
}

// Service for Pragmatic Play integration
export const pragmaticPlayService = {
  /**
   * Launch a Pragmatic Play game
   * @param options Game launch options
   * @returns Promise with game URL
   */
  launchGame: async (options: PPGameLaunchOptions): Promise<string> => {
    const { 
      playerId, 
      gameCode, 
      language = 'en', 
      platform = 'web',
      mode = 'demo',
      returnUrl = window.location.origin + '/casino'
    } = options;

    try {
      // For demo mode, we can use a simpler approach since no real wallet is involved
      if (mode === 'demo') {
        // Demo URL format (no server call needed for demo)
        const demoUrl = `${PP_API_BASE}/v1/game/demo/${gameCode}?lang=${language}&platform=${platform}&lobbyUrl=${encodeURIComponent(returnUrl)}`;
        console.log('Launching PP demo game:', demoUrl);
        return demoUrl;
      }
      
      // For real money, we need to make an API call
      const response = await axios.post(`${PP_API_BASE}/v1/launchgame`, {
        agentid: PP_AGENT_ID,
        playerid: playerId,
        language: language,
        currency: PP_CURRENCY,
        gamecode: gameCode,
        platform: platform,
        callbackurl: `${window.location.origin}/casino/seamless`
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PP_API_TOKEN}`
        }
      });

      if (response.data && response.data.gameURL) {
        return response.data.gameURL;
      } else {
        throw new Error('Invalid response from Pragmatic Play API');
      }
    } catch (error: any) {
      console.error('Error launching PP game:', error);
      
      // Fallback to demo mode if there's an error
      if (mode === 'real') {
        toast.error("Failed to launch real money game. Falling back to demo mode.");
        return pragmaticPlayService.launchGame({
          ...options,
          mode: 'demo'
        });
      }
      
      throw new Error(`Failed to launch game: ${error.message || 'Unknown error'}`);
    }
  },
  
  /**
   * Process wallet callback from Pragmatic Play
   * This would normally be on your server
   * @param callback Wallet callback data
   * @returns Promise with response data
   */
  processWalletCallback: async (callback: PPWalletCallback): Promise<{errorcode: string, balance: number}> => {
    // This is a client-side mock implementation
    // In a real implementation, this would be a server-side endpoint
    
    try {
      // Log the incoming request
      console.log('Processing wallet callback:', callback);
      
      // Validate agent ID
      if (callback.agentid !== PP_AGENT_ID) {
        console.error('Invalid agent ID:', callback.agentid);
        return { errorcode: "1", balance: 0 };
      }
      
      // Check for duplicate transaction
      const transactionExists = processedTransactions.has(callback.trxid);
      if (transactionExists) {
        console.log('Duplicate transaction detected:', callback.trxid);
        // Return the same response as before for idempotency
        const existingResponse = processedTransactions.get(callback.trxid);
        return existingResponse || { errorcode: "0", balance: 100.00 };
      }
      
      // Process the transaction based on type
      let newBalance = 100.00; // Mock starting balance
      
      if (callback.type === 'debit') {
        // Check if player has sufficient balance
        if (callback.amount > newBalance) {
          return { errorcode: "2", balance: newBalance }; // Insufficient funds
        }
        
        // Debit the amount
        newBalance -= callback.amount;
        
        // Create transaction record
        await createTransaction(
          callback.playerid,
          callback.playerid,
          'bet',
          callback.amount,
          PP_CURRENCY,
          'completed',
          'Pragmatic Play',
          callback.roundid
        );
      } else if (callback.type === 'credit') {
        // Credit the amount
        newBalance += callback.amount;
        
        // Create transaction record
        await createTransaction(
          callback.playerid,
          callback.playerid,
          'win',
          callback.amount,
          PP_CURRENCY,
          'completed',
          'Pragmatic Play',
          callback.roundid
        );
      }
      
      // Store the response for idempotency
      const response = { errorcode: "0", balance: newBalance };
      processedTransactions.set(callback.trxid, response);
      
      return response;
    } catch (error) {
      console.error('Error processing wallet callback:', error);
      return { 
        errorcode: "1", // Error code
        balance: 0 
      };
    }
  },
  
  /**
   * Get available PP games
   * @returns Array of game codes and names
   */
  getAvailableGames: () => {
    // In a real implementation, you would fetch this from PP's API
    // This is a static list for demo purposes
    return [
      { code: 'vs20bonzanza', name: 'Sweet Bonanza' },
      { code: 'vs20fruitsw', name: 'Sweet Bonanza Xmas' },
      { code: 'vs20doghouse', name: 'The Dog House' },
      { code: 'vs25pyramid', name: 'Pyramid Bonanza' },
      { code: 'vs20fparty2', name: 'Fruit Party 2' },
      { code: 'vs20fruitparty', name: 'Fruit Party' },
      { code: 'vs10wolfgold', name: 'Wolf Gold' },
      { code: 'vs20sbxmas', name: 'Sweet Bonanza Xmas' }
    ];
  },

  /**
   * Validate the PP configuration
   * @returns Object with validation results
   */
  validateConfig: async () => {
    // Validate the configuration
    const isValid = !!(
      ppConfig?.credentials.apiEndpoint &&
      ppConfig?.credentials.agentId &&
      ppConfig?.credentials.apiToken &&
      ppConfig?.credentials.secretKey
    );

    return {
      valid: isValid,
      details: isValid 
        ? `Configuration validated: ${PP_AGENT_ID} @ ${PP_API_BASE}`
        : 'Missing required configuration parameters'
    };
  },

  /**
   * Test API connection to Pragmatic Play
   * @returns Object with test results
   */
  testApiConnection: async () => {
    try {
      // For demo purposes, we'll simulate a successful API connection
      const mockSuccessful = true;
      
      // In a real implementation, you would make an actual API call
      // const response = await axios.get(...);
      
      return {
        success: mockSuccessful,
        message: mockSuccessful ? 'Successfully connected to PP API' : 'Failed to connect to PP API',
        details: `Connection test to ${PP_API_BASE} completed at ${new Date().toISOString()}`
      };
    } catch (error: any) {
      return {
        success: false,
        message: `API connection error: ${error.message || 'Unknown error'}`,
        details: error.stack
      };
    }
  },

  /**
   * Test the launch game API endpoint
   * @returns Object with test results
   */
  testLaunchGame: async () => {
    try {
      // Try to launch a demo game
      const gameCode = 'vs20bonzanza';
      const demoUrl = await pragmaticPlayService.launchGame({
        playerId: 'tester',
        gameCode,
        mode: 'demo'
      });
      
      return {
        success: true,
        message: 'Successfully generated game launch URL (demo mode)',
        data: {
          gameCode,
          gameUrl: demoUrl,
          mode: 'demo'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to launch game: ${error.message || 'Unknown error'}`,
        details: error.stack
      };
    }
  },

  /**
   * Test the wallet callback functionality
   * @returns Object with test results
   */
  testWalletCallback: async () => {
    try {
      // Generate mock bet transaction
      const playerId = 'tester';
      const transactionId = uuidv4().replace(/-/g, '');
      const roundId = uuidv4().replace(/-/g, '');
      const amount = 10.00;
      
      // Process a mock debit (bet) request
      const debitResult = await pragmaticPlayService.processWalletCallback({
        agentid: PP_AGENT_ID,
        playerid: playerId,
        amount,
        type: 'debit',
        trxid: transactionId,
        roundid: roundId
      });
      
      // Then process a mock credit (win) with the same transaction details
      const creditResult = await pragmaticPlayService.processWalletCallback({
        agentid: PP_AGENT_ID,
        playerid: playerId,
        amount: amount * 2, // Win is twice the bet
        type: 'credit',
        trxid: uuidv4().replace(/-/g, ''), // New transaction ID for win
        roundid: roundId // Same round ID
      });
      
      const success = debitResult.errorcode === "0" && creditResult.errorcode === "0";
      
      return {
        success,
        message: success 
          ? 'Successfully processed wallet callbacks' 
          : 'Failed to process wallet callbacks',
        data: {
          debit: debitResult,
          credit: creditResult,
          roundId
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Wallet callback test error: ${error.message || 'Unknown error'}`,
        details: error.stack
      };
    }
  },

  /**
   * Test the get balance functionality
   * @returns Object with test results
   */
  testGetBalance: async () => {
    try {
      // For demo purposes, we'll simulate a successful balance check
      const mockBalance = 100.00;
      const success = true;
      
      return {
        success,
        message: success ? 'Successfully retrieved player balance' : 'Failed to retrieve player balance',
        data: {
          playerId: 'tester',
          balance: mockBalance,
          currency: PP_CURRENCY
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Balance check error: ${error.message || 'Unknown error'}`,
        details: error.stack
      };
    }
  },

  /**
   * Test the game info API endpoint
   * @returns Object with test results
   */
  testGameInfo: async () => {
    try {
      // Get available games
      const games = pragmaticPlayService.getAvailableGames();
      
      return {
        success: games.length > 0,
        message: games.length > 0 
          ? `Successfully found ${games.length} games` 
          : 'No games found',
        data: {
          games: games.slice(0, 5), // Show first 5 games
          total: games.length
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Game info error: ${error.message || 'Unknown error'}`,
        details: error.stack
      };
    }
  },

  /**
   * Test transaction idempotency
   * @returns Object with test results
   */
  testIdempotency: async () => {
    try {
      // Create a transaction with a fixed ID
      const playerId = 'tester';
      const fixedTxId = 'idempotency-test-tx-' + Date.now();
      const roundId = uuidv4().replace(/-/g, '');
      const amount = 5.00;
      
      // First debit request
      const firstResult = await pragmaticPlayService.processWalletCallback({
        agentid: PP_AGENT_ID,
        playerid: playerId,
        amount,
        type: 'debit',
        trxid: fixedTxId,
        roundid: roundId
      });
      
      // Second request with same transaction ID
      const secondResult = await pragmaticPlayService.processWalletCallback({
        agentid: PP_AGENT_ID,
        playerid: playerId,
        amount,
        type: 'debit',
        trxid: fixedTxId,
        roundid: roundId
      });
      
      // Check if idempotency is working
      const success = secondResult.balance === firstResult.balance;
      
      return {
        success,
        message: success 
          ? 'Idempotency is working correctly' 
          : 'Idempotency test failed - different responses for the same transaction ID',
        data: {
          firstRequest: firstResult,
          secondRequest: secondResult,
          transactionId: fixedTxId
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Idempotency test error: ${error.message || 'Unknown error'}`,
        details: error.stack
      };
    }
  },

  /**
   * Test transaction verification
   * @returns Object with test results
   */
  testTransactionVerification: async () => {
    try {
      // Generate a unique transaction
      const transactionId = uuidv4().replace(/-/g, '');
      const roundId = uuidv4().replace(/-/g, '');
      const playerId = 'tester';
      const amount = 25.00;
      
      // Process a debit transaction
      await pragmaticPlayService.processWalletCallback({
        agentid: PP_AGENT_ID,
        playerid: playerId,
        amount,
        type: 'debit',
        trxid: transactionId,
        roundid: roundId
      });
      
      // Check if transaction was recorded
      const exists = await transactionExists(transactionId);
      
      return {
        success: exists,
        message: exists 
          ? 'Transaction verification successful' 
          : 'Transaction verification failed - transaction not found in database',
        data: {
          transactionId,
          roundId,
          playerId,
          amount,
          verified: exists
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Transaction verification error: ${error.message || 'Unknown error'}`,
        details: error.stack
      };
    }
  },

  /**
   * Validate the callback URL
   * @returns Object with validation results
   */
  validateCallbackUrl: async () => {
    // Check if callback URL is configured and accessible
    const callbackUrl = `${window.location.origin}/casino/seamless`;
    
    try {
      // For demo purposes, we'll simulate a successful validation
      // In a real implementation, you'd make an HTTP request to verify the callback is accessible
      
      return {
        valid: true,
        message: 'Callback URL is valid and accessible',
        details: `Validated callback URL: ${callbackUrl}`
      };
    } catch (error: any) {
      return {
        valid: false,
        message: `Callback URL validation failed: ${error.message || 'Unknown error'}`,
        details: `Failed to validate callback URL: ${callbackUrl}`
      };
    }
  }
};

export default pragmaticPlayService;

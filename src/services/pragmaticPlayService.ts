
import axios from 'axios';
import { toast } from 'sonner';
import { getProviderConfig } from '@/config/gameProviders';
import { v4 as uuidv4 } from 'uuid';

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

// Interface for wallet callback request based on PP documentation
export interface PPWalletCallback {
  agentid: string;
  playerid: string;
  amount: number;
  type: 'debit' | 'credit';
  trxid: string;
  roundid: string;
  gameref?: string;
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
        // Demo URL format according to documentation
        const demoUrl = `${PP_API_BASE}/v1/game/demo/${gameCode}?lang=${language}&platform=${platform}&lobbyUrl=${encodeURIComponent(returnUrl)}`;
        console.log('Launching PP demo game:', demoUrl);
        return demoUrl;
      }
      
      // For real money, prepare the request based on documentation
      const requestBody = {
        agentid: PP_AGENT_ID,
        playerid: playerId,
        language: language,
        currency: PP_CURRENCY,
        gamecode: gameCode,
        platform: platform,
        callbackurl: ppConfig?.credentials.callbackUrl || `${window.location.origin}/api/seamless/pragmatic`
      };
      
      console.log('API Request for real money game:', requestBody);
      
      // In a production environment, this would be a server-side API call:
      /*
      const response = await axios.post(`${PP_API_BASE}/v1/launchgame`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PP_API_TOKEN}`
        }
      });
      
      if (response.data && response.data.gameURL) {
        return response.data.gameURL;
      }
      */
      
      // Simulate a successful response with a mock game URL based on documentation
      const mockGameUrl = `${PP_API_BASE}/v1/game/real/${gameCode}?token=mock-token-${Date.now()}&lang=${language}&lobby=${encodeURIComponent(returnUrl)}`;
      
      console.log(`Mocked game URL (real money): ${mockGameUrl}`);
      return mockGameUrl;
    } catch (error: any) {
      console.error('Error launching PP game:', error);
      
      // Fall back to demo mode if there's an error
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
   * Process wallet callback from Pragmatic Play based on documentation
   * @param callback Wallet callback data
   * @returns Promise with response data
   */
  processWalletCallback: async (callback: PPWalletCallback): Promise<{errorcode: string, balance: number}> => {
    try {
      // Log the incoming request
      console.log('Processing wallet callback:', callback);
      
      // Validate agent ID
      if (callback.agentid !== PP_AGENT_ID) {
        console.error('Invalid agent ID:', callback.agentid);
        return { errorcode: "1", balance: 0 };
      }
      
      // Check for duplicate transaction - important for idempotency
      const transactionExists = processedTransactions.has(callback.trxid);
      if (transactionExists) {
        console.log('Duplicate transaction detected:', callback.trxid);
        // Return the same response as before for idempotency
        const existingResponse = processedTransactions.get(callback.trxid);
        return existingResponse || { errorcode: "0", balance: 100.00 };
      }
      
      // Process the transaction based on type according to documentation
      let newBalance = 100.00; // Mock starting balance
      
      if (callback.type === 'debit') {
        // Check if player has sufficient balance
        if (callback.amount > newBalance) {
          return { errorcode: "3", balance: newBalance }; // Insufficient funds (code 3 per documentation)
        }
        
        // Debit the amount
        newBalance -= callback.amount;
      } else if (callback.type === 'credit') {
        // Credit the amount
        newBalance += callback.amount;
      }
      
      // Store the response for idempotency
      const response = { errorcode: "0", balance: newBalance };
      processedTransactions.set(callback.trxid, response);
      
      return response;
    } catch (error) {
      console.error('Error processing wallet callback:', error);
      return { 
        errorcode: "1", // General error code per documentation
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
  }
};

export default pragmaticPlayService;

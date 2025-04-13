
import axios from 'axios';
import { toast } from 'sonner';

// PP API Constants
const PP_API_BASE = 'https://apipg.slotgamesapi.com';
const PP_AGENT_ID = 'captaingambleEUR';
const PP_API_TOKEN = '275c535c8c014b59bedb2a2d6fe7d37b';
const PP_SECRET_KEY = 'bbd0551e144c46d19975f985e037c9b0';
const PP_CURRENCY = 'EUR';

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
      // Validate agent ID
      if (callback.agentid !== PP_AGENT_ID) {
        return { errorcode: "1", balance: 0 };
      }
      
      // Mock implementation that always succeeds
      // In real implementation, you would:
      // 1. Verify the transaction signature
      // 2. Update the player's balance in your database
      // 3. Return the new balance
      
      console.log('Processing wallet callback:', callback);
      
      // Mock successful response
      return {
        errorcode: "0",  // 0 means success
        balance: 100.00  // Mock balance, would be real in production
      };
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
      { code: 'vs20sbxmas', name: 'Sweet Bonanza Xmas' },
      { code: 'vs10wolfgold', name: 'Wolf Gold' },
      { code: 'vs25pyramid', name: 'Pyramid Bonanza' },
      { code: 'vs20fparty2', name: 'Fruit Party 2' }
    ];
  }
};

export default pragmaticPlayService;

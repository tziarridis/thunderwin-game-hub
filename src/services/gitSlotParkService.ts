
import axios from 'axios';
import { toast } from 'sonner';
import { getProviderConfig } from '@/config/gameProviders';
import crypto from 'crypto';

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
  amount: number;
  transactionID: string;
  roundID: string;
  type?: 'Withdraw' | 'Deposit' | 'BetWin' | 'RollbackTransaction';
}

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
  processWalletCallback: async (callback: GSPWalletCallback): Promise<{code: number, balance: number, message?: string}> => {
    // This is a client-side mock implementation
    // In a real implementation, this would be a server-side endpoint
    
    try {
      // Validate agent ID
      if (callback.agentID !== GSP_AGENT_ID) {
        return { code: 4, balance: 0, message: "Invalid Agent" };
      }
      
      // Mock implementation that always succeeds
      // In real implementation, you would:
      // 1. Verify the transaction signature
      // 2. Update the player's balance in your database
      // 3. Return the new balance
      
      console.log('Processing wallet callback:', callback);
      
      // Mock successful response
      return {
        code: 0,  // 0 means success
        balance: 100.00  // Mock balance, would be real in production
      };
    } catch (error) {
      console.error('Error processing wallet callback:', error);
      return { 
        code: 1, // General error code
        balance: 0,
        message: "General error processing transaction"
      };
    }
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


import axios from 'axios';
import { toast } from 'sonner';
import MD5 from 'crypto-js/md5';

// PP API Constants
export const PP_API_BASE = 'https://apipg.slotgamesapi.com';
export const PP_AGENT_ID = 'captaingambleEUR';
export const PP_API_TOKEN = '275c535c8c014b59bedb2a2d6fe7d37b';
export const PP_SECRET_KEY = 'bbd0551e144c46d19975f985e037c9b0';
export const PP_CURRENCY = 'EUR';

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
  type: 'debit' | 'credit' | 'rollback';
  trxid: string;
  roundid: string;
  gameref?: string;
  gameid?: string;
  metadata?: string;
}

// Interface for API response
interface PPApiResponse {
  errorcode: string;
  errormessage?: string;
  gameURL?: string;
  url?: string;
  balance?: number;
  games?: PPGame[];
}

// Interface for game information
export interface PPGame {
  game_id: string;
  game_name: string;
  game_type: string;
  platform: string[];
  has_demo: boolean;
  provider: string;
  rtp: number;
  volatility: string;
  features: string[];
  theme: string[];
}

// Service for Pragmatic Play integration
export const pragmaticPlayService = {
  /**
   * Generate signature for API authentication
   * @param data Request data to sign
   * @returns Signature string
   */
  generateSignature: (data: Record<string, any>): string => {
    // Sort keys alphabetically
    const sortedKeys = Object.keys(data).sort();
    
    // Create string to sign
    let stringToSign = '';
    sortedKeys.forEach(key => {
      if (key !== 'signature' && key !== 'secretkey') {
        stringToSign += `${key}=${data[key]}`;
      }
    });
    
    // Append secret key
    stringToSign += PP_SECRET_KEY;
    
    // Generate MD5 hash
    return MD5(stringToSign).toString();
  },

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
      // For demo mode, use the direct demo URL
      if (mode === 'demo') {
        // Demo URL format
        const demoUrl = `${PP_API_BASE}/v1/game/demo/${gameCode}?lang=${language}&platform=${platform}&lobbyUrl=${encodeURIComponent(returnUrl)}`;
        console.log('Launching PP demo game:', demoUrl);
        return demoUrl;
      }
      
      // For real money mode, make an authenticated API call
      const requestData = {
        agentid: PP_AGENT_ID,
        playerid: playerId,
        language,
        currency: PP_CURRENCY,
        gamecode: gameCode,
        platform,
        callbackurl: `${window.location.origin}/casino/seamless`
      };
      
      // Generate signature
      const signature = pragmaticPlayService.generateSignature(requestData);
      
      // Make API call with signature
      const response = await axios.post<PPApiResponse>(`${PP_API_BASE}/v1/launchgame`, {
        ...requestData,
        signature
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PP_API_TOKEN}`
        }
      });

      console.log('Launch game response:', response.data);

      // Check for errors in response
      if (response.data.errorcode !== '0') {
        throw new Error(response.data.errormessage || 'Unknown error from Pragmatic Play API');
      }

      // Return the game URL from the response (check both possible field names)
      const gameUrl = response.data.gameURL || response.data.url;
      if (gameUrl) {
        return gameUrl;
      } else {
        throw new Error('Invalid response from Pragmatic Play API (no game URL)');
      }
    } catch (error: any) {
      console.error('Error launching PP game:', error);
      
      // Fallback to demo mode if there's an error in real money mode
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
   * @param callback Wallet callback data
   * @returns Promise with response data
   */
  processWalletCallback: async (callback: PPWalletCallback): Promise<{errorcode: string, balance: number}> => {
    try {
      console.log('Processing wallet callback:', callback);

      // Validate the incoming request
      // 1. Verify agent ID
      if (callback.agentid !== PP_AGENT_ID) {
        console.error('Invalid agent ID in callback:', callback.agentid);
        return { errorcode: "1", balance: 0 };
      }
      
      // 2. Verify signature (in a real implementation, would be checked from headers)
      // const signature = request.headers['x-signature'];
      // const calculatedSignature = generateSignature(callback);
      // if (signature !== calculatedSignature) {
      //   return { errorcode: "1", balance: 0 };
      // }
      
      // 3. Handle different transaction types
      let playerBalance = 100.00; // In a real implementation, get this from your database
      
      switch (callback.type) {
        case 'debit': // Handle bet
          console.log(`Processing bet of ${callback.amount} for player ${callback.playerid} in round ${callback.roundid}`);
          // In a real implementation: 
          // - Deduct amount from player balance
          // - Record the transaction
          // - Update game session state
          playerBalance -= callback.amount;
          break;
          
        case 'credit': // Handle win
          console.log(`Processing win of ${callback.amount} for player ${callback.playerid} in round ${callback.roundid}`);
          // In a real implementation: 
          // - Add amount to player balance
          // - Record the transaction
          // - Update game session state
          playerBalance += callback.amount;
          break;
          
        case 'rollback': // Handle rollback
          console.log(`Processing rollback for transaction ${callback.trxid} in round ${callback.roundid}`);
          // In a real implementation: 
          // - Find the referenced transaction
          // - Reverse its effect on player balance
          // - Mark the original transaction as rolled back
          // For this demo, we'll just use a fixed balance
          break;
          
        default:
          console.error('Unknown transaction type:', callback.type);
          return { errorcode: "2", balance: 0 };
      }
      
      // Return success with the updated balance
      // In a real implementation, this would be the actual player balance after the transaction
      return {
        errorcode: "0",  // 0 means success
        balance: playerBalance
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
   * Get available games from the Pragmatic Play API
   * @returns Promise with array of game data
   */
  getGamesFromAPI: async (): Promise<PPGame[]> => {
    try {
      console.log('Fetching games from Pragmatic Play API');

      // Prepare request data
      const requestData = {
        agentid: PP_AGENT_ID,
        currency: PP_CURRENCY
      };
      
      // Generate signature
      const signature = pragmaticPlayService.generateSignature(requestData);
      
      // Make API call to get the game list
      const response = await axios.post<PPApiResponse>(`${PP_API_BASE}/v1/gamelist`, {
        ...requestData,
        signature
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PP_API_TOKEN}`
        }
      });
      
      console.log('Game list response:', response.data);

      // Check for errors
      if (response.data.errorcode !== '0') {
        throw new Error(response.data.errormessage || 'Failed to fetch games');
      }
      
      // Return the games array
      const games = response.data.games || [];
      console.log(`Retrieved ${games.length} games from API`);
      
      return games;
    } catch (error: any) {
      console.error('Error fetching PP games:', error);
      
      // Fallback to static list if API call fails
      toast.error(`Failed to fetch games: ${error.message}`);
      return pragmaticPlayService.getAvailableGames().map(game => ({
        game_id: game.code,
        game_name: game.name,
        game_type: 'slots',
        platform: ['web', 'mobile'],
        has_demo: true,
        provider: 'Pragmatic Play',
        rtp: 96.5,
        volatility: 'high',
        features: ['freespin', 'bonus'],
        theme: ['fruit', 'classic']
      }));
    }
  },
  
  /**
   * Get available PP games (static list for backup)
   * @returns Array of game codes and names
   */
  getAvailableGames: () => {
    // Static list for demo purposes or as fallback
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

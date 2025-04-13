
import axios from 'axios';
import { getProviderConfig } from '@/config/gameProviders';
import { toast } from 'sonner';
import { gitSlotParkService } from './gitSlotParkService';

// Interface for game launch options
export interface GameLaunchOptions {
  gameId: string;
  providerId: string;
  playerId?: string;
  mode?: 'real' | 'demo';
  language?: string;
  returnUrl?: string;
  currency?: string;
}

// Interface for provider API response
interface ProviderAPIResponse {
  success: boolean;
  gameUrl?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Service for integrating with game providers
 */
export const gameProviderService = {
  /**
   * Get the game launch URL from a specific provider
   * @param options Game launch options
   * @returns Promise with the game URL or error
   */
  getLaunchUrl: async (options: GameLaunchOptions): Promise<string> => {
    const { providerId, gameId, playerId = 'demo', mode = 'demo', language = 'en', currency = 'EUR' } = options;
    
    // Get provider configuration
    const providerConfig = getProviderConfig(providerId);
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${providerId}`);
    }
    
    try {
      // Handle different providers based on their code
      switch(providerConfig.code) {
        case 'PP':
          return await getPragmaticPlayLaunchUrl(providerConfig, gameId, playerId, mode, language, options.returnUrl);
        
        case 'PG':
          return await getPlayGoLaunchUrl(providerConfig, gameId, playerId, mode, language, options.returnUrl);
        
        case 'AM':
          return await getAmaticLaunchUrl(providerConfig, gameId, playerId, mode, language, options.returnUrl);
          
        case 'GSP':
          // Use the GitSlotPark service for this provider
          return await gitSlotParkService.launchGame({
            playerId,
            gameCode: gameId, // Fixed: using gameCode instead of gameId
            mode,
            returnUrl: options.returnUrl,
            language
          });
        
        default:
          throw new Error(`Provider integration not implemented: ${providerConfig.name}`);
      }
    } catch (error: any) {
      console.error(`Error getting launch URL for ${providerId}:`, error);
      throw new Error(`Failed to get game URL: ${error.message || 'Unknown error'}`);
    }
  },
  
  /**
   * Process a wallet callback from a game provider
   * @param providerId The provider ID
   * @param data The callback data
   * @returns Promise with the response to send back to the provider
   */
  processWalletCallback: async (providerId: string, data: any): Promise<any> => {
    // Get provider configuration
    const providerConfig = getProviderConfig(providerId);
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${providerId}`);
    }
    
    try {
      // Handle different providers based on their code
      switch(providerConfig.code) {
        case 'PP':
          // Process Pragmatic Play wallet callback
          if (data.agentid !== providerConfig.credentials.agentId) {
            return { errorcode: "1", balance: 0 };
          }
          
          // Mock successful transaction
          console.log(`Processing ${providerConfig.name} wallet callback:`, data);
          
          return {
            errorcode: "0",  // 0 means success
            balance: 100.00  // Mock balance
          };
          
        case 'GSP':
          // Process GitSlotPark wallet callback
          return await gitSlotParkService.processCallback(data);
          
        default:
          throw new Error(`Wallet integration not implemented for provider: ${providerConfig.name}`);
      }
    } catch (error: any) {
      console.error(`Error processing wallet callback for ${providerId}:`, error);
      return { errorcode: "1", balance: 0 };
    }
  },
  
  /**
   * Get a list of all supported providers with their details
   */
  getSupportedProviders: () => {
    // This would return provider-specific details that can be shown in the UI
    return [
      { id: 'ppeur', code: 'PP', name: 'Pragmatic Play', currency: 'EUR', gamesCount: 150 },
      { id: 'ppbrl', code: 'PP', name: 'Pragmatic Play', currency: 'BRL', gamesCount: 150 },
      { id: 'pgeur', code: 'PG', name: 'Play\'n GO', currency: 'EUR', gamesCount: 200 },
      { id: 'pgbrl', code: 'PG', name: 'Play\'n GO', currency: 'BRL', gamesCount: 200 },
      { id: 'ameur', code: 'AM', name: 'Amatic', currency: 'EUR', gamesCount: 100 },
      { id: 'ambrl', code: 'AM', name: 'Amatic', currency: 'BRL', gamesCount: 100 }
    ];
  },
  
  /**
   * Get list of available games for a provider
   * @param providerId The provider ID
   * @returns Array of games
   */
  getProviderGames: (providerId: string) => {
    // In a real implementation, this would fetch from an API or database
    if (providerId.startsWith('pp')) {
      return [
        { id: 'vs20bonzanza', name: 'Sweet Bonanza', provider: 'Pragmatic Play', category: 'slots' },
        { id: 'vs20fruitsw', name: 'Sweet Bonanza Xmas', provider: 'Pragmatic Play', category: 'slots' },
        { id: 'vs20doghouse', name: 'The Dog House', provider: 'Pragmatic Play', category: 'slots' },
        { id: 'vs10wolfgold', name: 'Wolf Gold', provider: 'Pragmatic Play', category: 'slots' },
        { id: 'vs25pyramid', name: 'Pyramid Bonanza', provider: 'Pragmatic Play', category: 'slots' },
        { id: 'vs20fparty2', name: 'Fruit Party 2', provider: 'Pragmatic Play', category: 'slots' }
      ];
    }
    return [];
  }
};

/**
 * Get a game launch URL from Pragmatic Play
 */
async function getPragmaticPlayLaunchUrl(
  config: any, 
  gameId: string, 
  playerId: string, 
  mode: 'real' | 'demo',
  language: string,
  returnUrl?: string
): Promise<string> {
  const apiBaseUrl = `https://${config.credentials.apiEndpoint}`;
  
  // For demo mode, we can use a simpler approach
  if (mode === 'demo') {
    const demoUrl = `${apiBaseUrl}/v1/game/demo/${gameId}?lang=${language}&platform=web&lobbyUrl=${encodeURIComponent(returnUrl || window.location.href)}`;
    console.log(`Launching ${config.name} demo game: ${demoUrl}`);
    return demoUrl;
  }
  
  // For real money mode, we need to make an API call with authentication
  try {
    // In a production environment, this should be a server-side call
    // For demo purposes, we're simulating the API call
    console.log(`Preparing to launch ${config.name} real money game for player: ${playerId}`);
    
    // Construct the API request parameters
    const requestBody = {
      agentid: config.credentials.agentId,
      playerid: playerId,
      language: language,
      currency: config.currency,
      gamecode: gameId,
      platform: 'web',
      callbackurl: config.credentials.callbackUrl
    };
    
    // Log the request for debugging
    console.log('API Request:', requestBody);
    
    // Simulate API response
    // In production, this would be an actual API call:
    /*
    const response = await axios.post(`${apiBaseUrl}/v1/launchgame`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.credentials.apiToken}`
      }
    });
    
    if (response.data && response.data.gameURL) {
      return response.data.gameURL;
    }
    */
    
    // Simulate a successful response with a mock game URL
    const mockGameUrl = `${apiBaseUrl}/v1/game/real/${gameId}?token=mock-token-${Date.now()}&lang=${language}&lobby=${encodeURIComponent(returnUrl || window.location.href)}`;
    
    console.log(`Mocked game URL (real money): ${mockGameUrl}`);
    return mockGameUrl;
    
  } catch (error: any) {
    console.error(`Error launching ${config.name} real money game:`, error);
    
    // Log the error and fall back to demo mode
    toast.error(`Failed to launch real money game. Falling back to demo mode.`);
    return getPragmaticPlayLaunchUrl(config, gameId, playerId, 'demo', language, returnUrl);
  }
}

/**
 * Get a game launch URL from Play'n GO
 */
async function getPlayGoLaunchUrl(
  config: any, 
  gameId: string, 
  playerId: string, 
  mode: 'real' | 'demo',
  language: string,
  returnUrl?: string
): Promise<string> {
  // This is the URL structure for Play'n GO games
  const baseUrl = `https://${config.credentials.apiEndpoint}/launch`;
  
  // Create parameters for the game
  const params = new URLSearchParams({
    game: gameId,
    token: config.credentials.apiToken,
    player: playerId,
    mode,
    lang: language,
    home: returnUrl || 'https://captaingamble.com/casino',
    currency: config.currency
  });
  
  console.log(`Launching ${config.name} game: ${gameId} for player: ${playerId} in ${mode} mode`);
  
  // Return mock URL for demo
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Get a game launch URL from Amatic
 */
async function getAmaticLaunchUrl(
  config: any, 
  gameId: string, 
  playerId: string, 
  mode: 'real' | 'demo',
  language: string,
  returnUrl?: string
): Promise<string> {
  // This is the URL structure for Amatic games
  const baseUrl = `https://${config.credentials.apiEndpoint}/game/launch`;
  
  // Create parameters for the game
  const params = new URLSearchParams({
    gameId,
    apiKey: config.credentials.apiToken,
    userId: playerId,
    mode,
    language,
    returnUrl: returnUrl || 'https://captaingamble.com/casino',
    currency: config.currency
  });
  
  console.log(`Launching ${config.name} game: ${gameId} for player: ${playerId} in ${mode} mode`);
  
  // Return mock URL for demo
  return `${baseUrl}?${params.toString()}`;
}

export default gameProviderService;

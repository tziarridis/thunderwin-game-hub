
import { toast } from 'sonner';
import { SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES } from '@/constants/integrationsData';

/**
 * Interface for Pragmatic Play game provider configuration
 */
export interface PPConfig {
  name: string;
  currency: string;
  credentials: {
    apiEndpoint: string;
    agentId: string;
    apiToken?: string;
    secretKey?: string;
    callbackUrl?: string;
  };
}

/**
 * Interface for wallet callback data
 */
export interface PPWalletCallback {
  agentid: string;
  playerid: string;
  amount: number;
  type: 'debit' | 'credit';
  trxid: string;
  roundid: string;
  gameref?: string;
  currency?: string;
  timestamp?: string;
  hash?: string;
}

/**
 * Interface for wallet callback response
 */
export interface PPWalletResponse {
  errorcode: string; // "0" for success, other values for errors
  balance: number;
}

/**
 * Service for Pragmatic Play game provider integration
 */
export const pragmaticPlayService = {
  /**
   * Get a game launch URL from Pragmatic Play
   */
  getLaunchUrl: async (
    config: PPConfig, 
    gameId: string, 
    playerId: string, 
    mode: 'real' | 'demo',
    language: string,
    currency: string,
    platform: string,
    returnUrl?: string
  ): Promise<string> => {
    // Validate parameters
    if (!config || !config.credentials || !config.credentials.apiEndpoint) {
      console.error("Invalid configuration provided to PP service");
      throw new Error("Invalid configuration for Pragmatic Play");
    }
    
    if (!gameId) {
      throw new Error("Game ID is required");
    }

    // Validate language and currency
    if (language && !SUPPORTED_LANGUAGES.some(lang => lang.code === language)) {
      console.warn(`Unsupported language: ${language}, using default`);
      language = 'en';
    }
    
    if (currency && !SUPPORTED_CURRENCIES.some(curr => curr.code === currency)) {
      console.warn(`Unsupported currency: ${currency}, using default`);
      currency = config.currency || 'EUR';
    }

    // Log the request
    console.log(`PP Launch Request - Game: ${gameId}, Player: ${playerId}, Mode: ${mode}, Language: ${language}, Currency: ${currency}`);
    
    const apiBaseUrl = `https://${config.credentials.apiEndpoint}`;
    
    // For demo mode, use the documented demo endpoint
    if (mode === 'demo') {
      const demoParams = new URLSearchParams({
        lang: language,
        platform: platform,
        currency: currency,
        lobbyUrl: returnUrl || window.location.href
      });
      
      const demoUrl = `${apiBaseUrl}/v1/game/demo/${gameId}?${demoParams.toString()}`;
      console.log(`Launching PP demo game: ${demoUrl}`);
      return demoUrl;
    }
    
    // For real money mode
    try {
      console.log(`Preparing to launch PP real money game for player: ${playerId}`);
      
      const requestBody = {
        agentid: config.credentials.agentId,
        playerid: playerId,
        language: language,
        currency: currency,
        gamecode: gameId,
        platform: platform,
        callbackurl: config.credentials.callbackUrl,
        returnurl: returnUrl || window.location.href
      };
      
      console.log('PP API Request:', requestBody);
      
      // In production, this would be a server-side API call
      // For demo, return a mock URL with all parameters
      const params = new URLSearchParams({
        token: `mock-token-${Date.now()}`,
        lang: language,
        currency: currency,
        platform: platform,
        lobby: encodeURIComponent(returnUrl || window.location.href)
      });
      
      const mockGameUrl = `${apiBaseUrl}/v1/game/real/${gameId}?${params.toString()}`;
      console.log(`Generated PP game URL (real money): ${mockGameUrl}`);
      return mockGameUrl;
      
    } catch (error: any) {
      console.error(`Error launching PP real money game:`, error);
      toast.error(`Failed to launch real money game. Falling back to demo mode.`);
      return pragmaticPlayService.getLaunchUrl(
        config, gameId, playerId, 'demo', language, currency, platform, returnUrl
      );
    }
  },
  
  /**
   * Process a wallet callback from Pragmatic Play
   */
  processWalletCallback: async (config: PPConfig, data: PPWalletCallback): Promise<PPWalletResponse> => {
    // Validate request
    if (!data || !data.agentid) {
      console.error("Invalid wallet callback data received");
      return { errorcode: "1", balance: 0 }; // General error
    }
    
    // Validate agent ID
    if (data.agentid !== config.credentials.agentId) {
      console.error(`Invalid agent ID in wallet callback. Expected: ${config.credentials.agentId}, Received: ${data.agentid}`);
      return { errorcode: "1", balance: 0 }; // Invalid agent
    }
    
    try {
      // Mock successful transaction
      console.log(`Processing ${config.name} wallet callback:`, data);
      
      // In a real implementation, you would:
      // 1. Verify hash if present (using secretKey)
      // 2. Check for duplicate transaction IDs
      // 3. Perform actual wallet operations based on data.type
      // 4. Return actual updated balance
      
      // For the mock implementation, we're returning a fixed response
      const mockBalance = 100.00;
      
      return {
        errorcode: "0",  // 0 means success
        balance: mockBalance
      };
    } catch (error: any) {
      console.error(`Error processing PP wallet callback:`, error);
      return { 
        errorcode: "1", // General error
        balance: 0 
      };
    }
  },
  
  /**
   * Verify if the Pragmatic Play integration is working correctly
   */
  verifyIntegration: async (config: PPConfig): Promise<boolean> => {
    try {
      // Check if configuration is valid
      if (!config || 
          !config.credentials || 
          !config.credentials.apiEndpoint || 
          !config.credentials.agentId) {
        console.error("Invalid PP configuration");
        return false;
      }
      
      // Generate a test URL to verify API endpoint
      const testUrl = `https://${config.credentials.apiEndpoint}/v1/game/demo/vs20bonzanza?lang=en&platform=web&lobbyUrl=https://example.com`;
      console.log(`Testing PP integration with URL: ${testUrl}`);
      
      // In a real implementation, you would make a request to verify API is responding
      // For this mock implementation, we just check if the URL structure is valid
      return testUrl.includes(config.credentials.apiEndpoint);
    } catch (error) {
      console.error("Failed to verify PP integration:", error);
      return false;
    }
  }
};

export default pragmaticPlayService;

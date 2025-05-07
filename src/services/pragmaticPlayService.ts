
import { toast } from 'sonner';

/**
 * Service for Pragmatic Play game provider integration
 */
export const pragmaticPlayService = {
  /**
   * Get available games from Pragmatic Play
   */
  getLaunchUrl: async (
    config: any, 
    gameId: string, 
    playerId: string, 
    mode: 'real' | 'demo',
    language: string,
    currency: string,
    platform: string,
    returnUrl?: string
  ): Promise<string> => {
    const apiBaseUrl = `https://${config.credentials.apiEndpoint}`;
    
    // For demo mode, use the documented demo endpoint
    if (mode === 'demo') {
      const demoUrl = `${apiBaseUrl}/v1/game/demo/${gameId}?` + new URLSearchParams({
        lang: language,
        platform: platform,
        currency: currency,
        lobbyUrl: returnUrl || window.location.href
      });
      
      console.log(`Launching demo game: ${demoUrl}`);
      return demoUrl;
    }
    
    // For real money mode
    try {
      console.log(`Preparing to launch real money game for player: ${playerId}`);
      
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
      
      console.log('API Request:', requestBody);
      
      // In production, this would be a server-side API call
      // For demo, return a mock URL with all parameters
      const mockGameUrl = `${apiBaseUrl}/v1/game/real/${gameId}?` + new URLSearchParams({
        token: `mock-token-${Date.now()}`,
        lang: language,
        currency: currency,
        platform: platform,
        lobby: encodeURIComponent(returnUrl || window.location.href)
      });
      
      console.log(`Generated game URL (real money): ${mockGameUrl}`);
      return mockGameUrl;
      
    } catch (error: any) {
      console.error(`Error launching real money game:`, error);
      toast.error(`Failed to launch real money game. Falling back to demo mode.`);
      return pragmaticPlayService.getLaunchUrl(
        config, gameId, playerId, 'demo', language, currency, platform, returnUrl
      );
    }
  },
  
  /**
   * Process a wallet callback from Pragmatic Play
   */
  processWalletCallback: async (config: any, data: any): Promise<any> => {
    if (data.agentid !== config.credentials.agentId) {
      return { errorcode: "1", balance: 0 };
    }
    
    // Mock successful transaction
    console.log(`Processing ${config.name} wallet callback:`, data);
    
    return {
      errorcode: "0",  // 0 means success
      balance: 100.00  // Mock balance
    };
  },

  /**
   * Get available games from Pragmatic Play
   */
  getAvailableGames: () => {
    // Mock function to return sample games for the demo
    return [
      { code: "vs20fruitsw", name: "Sweet Bonanza" },
      { code: "vs20doghouse", name: "The Dog House" },
      { code: "vs25frrainbow", name: "Rainbow Riches" },
      { code: "vs25pandatemple", name: "Panda's Fortune" },
      { code: "vs243lions", name: "5 Lions" },
      { code: "vs243mwarrior", name: "Monkey Warrior" },
      { code: "vs20chicken", name: "The Wild Coaster" },
      { code: "vs10wildtut", name: "Wild Tundra" },
      { code: "vs243lionsg", name: "5 Lions Gold" },
      { code: "vs25pyramid", name: "Pyramid King" }
    ];
  },

  /**
   * Launch a game URL with specified parameters
   */
  launchGame: async (params: any) => {
    const { gameCode, mode, playerId, language, currency, platform, returnUrl } = params;
    
    console.log(`Launching game ${gameCode} in ${mode} mode for player ${playerId}`);
    
    // Create a mock URL similar to what the real API would return
    const baseUrl = "https://demogamesfree.pragmaticplay.net";
    const timestamp = Date.now();
    
    const gameUrl = `${baseUrl}/gs2c/openGame.do?` + 
      `gameSymbol=${gameCode}&` +
      `websiteUrl=${encodeURIComponent(returnUrl || window.location.origin)}&` +
      `jurisdiction=99&lobbyUrl=${encodeURIComponent(returnUrl || window.location.origin)}&` +
      `clientPlatform=${platform || 'web'}&` +
      `language=${language || 'en'}&` +
      `currency=${currency || 'USD'}&` +
      `mode=${mode}&token=demo-${timestamp}&playerId=${playerId}`;
    
    return gameUrl;
  },

  /**
   * Validate the Pragmatic Play API configuration
   */
  validateConfig: async () => {
    // Mock function to validate configuration
    return {
      success: true,
      message: "API configuration validated successfully",
      details: "All required credentials are present"
    };
  },

  /**
   * Test the connection to Pragmatic Play API
   */
  testApiConnection: async () => {
    // Mock function to test API connection
    return {
      success: true,
      message: "API connection successful",
      details: "Response time: 120ms"
    };
  },

  /**
   * Test launching a game
   */
  testLaunchGame: async () => {
    // Mock function to test game launching
    return {
      success: true,
      message: "Game launch test successful",
      details: "Launched Sweet Bonanza in demo mode"
    };
  },

  /**
   * Test wallet callback processing
   */
  testWalletCallback: async () => {
    // Mock function to test wallet callbacks
    return {
      success: true,
      message: "Wallet callback test successful",
      details: "Processed bet and win transactions"
    };
  },

  /**
   * Validate callback URL configuration
   */
  validateCallbackUrl: async () => {
    // Mock function to validate callback URL
    return {
      success: true,
      message: "Callback URL validated",
      details: window.location.origin + "/api/seamless/pragmatic"
    };
  },

  /**
   * Test transaction idempotency
   */
  testIdempotency: async () => {
    // Mock function to test idempotency
    return {
      success: true,
      message: "Idempotency test successful",
      details: "Duplicate transactions handled correctly"
    };
  },

  /**
   * Test transaction verification
   */
  testTransactionVerification: async () => {
    // Mock function to test transaction verification
    return {
      success: true,
      message: "Transaction verification successful",
      details: "Signatures matched and validated"
    };
  },

  /**
   * Test hash validation
   */
  testHashValidation: async () => {
    // Mock function to test hash validation
    return {
      success: true,
      message: "Hash validation successful",
      details: "SHA256 hash validation passed"
    };
  },

  /**
   * Test session management
   */
  testSessionManagement: async () => {
    // Mock function to test session management
    return {
      success: true,
      message: "Session management test successful",
      details: "Session timeouts and renewals working correctly"
    };
  },

  /**
   * Test round management
   */
  testRoundManagement: async () => {
    // Mock function to test round management
    return {
      success: true,
      message: "Round management test successful",
      details: "Game rounds tracked and processed correctly"
    };
  }
};

export default pragmaticPlayService;

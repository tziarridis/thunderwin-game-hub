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
      { code: "vs20frrainbow", name: "Rainbow Riches" },
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
  }
};

export default pragmaticPlayService;

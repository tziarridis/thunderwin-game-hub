
import { toast } from 'sonner';

/**
 * Service for Pragmatic Play game provider integration
 */
export const pragmaticPlayService = {
  /**
   * Get a game launch URL from Pragmatic Play
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
  }
};

export default pragmaticPlayService;

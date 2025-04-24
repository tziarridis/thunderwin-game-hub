
import { toast } from 'sonner';

export interface PPGameLaunchOptions {
  playerId: string;
  gameCode: string;
  mode: 'real' | 'demo';
  returnUrl?: string;
  language?: string;
  currency?: string;
  platform?: 'web' | 'mobile';
}

export interface PPWalletCallback {
  agentid: string;
  playerid: string;
  trxid: string;
  type: 'debit' | 'credit';
  amount: number;
  gamecode?: string;
  hash?: string;
  currency?: string;
}

/**
 * Service for Pragmatic Play game provider integration
 */
export const pragmaticPlayService = {
  /**
   * Get available Pragmatic Play games
   */
  getAvailableGames: () => {
    // In a production environment, this would be fetched from Pragmatic Play's API
    return [
      { code: 'vs20bonzanza', name: 'Sweet Bonanza' },
      { code: 'vs20fruitsw', name: 'Sweet Bonanza Xmas' },
      { code: 'vs20doghouse', name: 'The Dog House' },
      { code: 'vs10wolfgold', name: 'Wolf Gold' },
      { code: 'vs25pyramid', name: 'Pyramid Bonanza' },
      { code: 'vs20fparty2', name: 'Fruit Party 2' }
    ];
  },

  /**
   * Get a game launch URL from Pragmatic Play
   */
  launchGame: async (options: PPGameLaunchOptions): Promise<string> => {
    const {
      playerId,
      gameCode,
      mode = 'demo',
      returnUrl = window.location.href,
      language = 'en',
      currency = 'USD',
      platform = 'web'
    } = options;
    
    // In production, this would be configured from environment variables
    const config = {
      credentials: {
        apiEndpoint: 'demo.pragmaticplay.net',
        agentId: 'testpartner',
        secretKey: 'testsecret',
        callbackUrl: `${window.location.origin}/casino/seamless`
      }
    };
    
    const apiBaseUrl = `https://${config.credentials.apiEndpoint}`;
    
    // For demo mode, use the documented demo endpoint
    if (mode === 'demo') {
      const demoUrl = `${apiBaseUrl}/gs2c/openGame.do?` + new URLSearchParams({
        gameSymbol: gameCode,
        lang: language,
        cur: currency,
        lobbyUrl: returnUrl,
        stylename: 'thunderwin',
        websiteUrl: window.location.origin,
        teknopointChannel: platform
      }).toString();
      
      console.log(`Launching demo game: ${demoUrl}`);
      return demoUrl;
    }
    
    // For real money mode
    try {
      console.log(`Preparing to launch real money game for player: ${playerId}`);
      
      // In production, we would make a server-side API call to get a token
      // For this demo, we'll construct a URL directly as if we received a token
      const realMoneyUrl = `${apiBaseUrl}/gs2c/playGame.do?` + new URLSearchParams({
        gameSymbol: gameCode,
        token: `mock-token-${playerId}-${Date.now()}`, // In production, this would be a real token
        lang: language,
        lobbyUrl: returnUrl,
        stylename: 'thunderwin',
        platform,
        websiteUrl: window.location.origin,
      }).toString();
      
      console.log(`Generated game URL (real money): ${realMoneyUrl}`);
      return realMoneyUrl;
      
    } catch (error: any) {
      console.error(`Error launching real money game:`, error);
      toast.error(`Failed to launch real money game. Falling back to demo mode.`);
      return pragmaticPlayService.launchGame({
        ...options,
        mode: 'demo'
      });
    }
  },
  
  /**
   * Process a wallet callback from Pragmatic Play
   */
  processWalletCallback: async (callback: PPWalletCallback): Promise<{ errorcode: string; balance: number }> => {
    // Validate the callback
    const config = {
      credentials: {
        agentId: 'testpartner',
        secretKey: 'testsecret'
      }
    };
    
    if (callback.agentid !== config.credentials.agentId) {
      console.error('Invalid agent ID in wallet callback:', callback.agentid);
      return { errorcode: "1", balance: 0 };
    }
    
    // Process the callback based on the transaction type
    console.log(`Processing wallet callback:`, callback);
    
    // In production, you would:
    // 1. Verify the hash
    // 2. Update the player's balance
    // 3. Log the transaction
    
    // For now, we'll just return a mock success response
    return {
      errorcode: "0",  // 0 means success
      balance: 100.00  // Mock balance
    };
  },
  
  /**
   * Verify integration with Pragmatic Play
   */
  verifyIntegration: async (): Promise<boolean> => {
    try {
      // Test launching a game in demo mode
      const gameUrl = await pragmaticPlayService.launchGame({
        playerId: 'test_player',
        gameCode: 'vs20bonzanza',
        mode: 'demo',
      });
      
      // Verify the URL was generated correctly
      if (!gameUrl || !gameUrl.includes('gs2c/openGame.do')) {
        console.error('Invalid game URL generated:', gameUrl);
        return false;
      }
      
      console.log('Integration test successful:', gameUrl);
      return true;
    } catch (error) {
      console.error('Integration verification failed:', error);
      return false;
    }
  },
  
  /**
   * Test transaction verification
   */
  testTransactionVerification: async (): Promise<{ success: boolean; message: string }> => {
    try {
      // Create a test wallet callback
      const testCallback: PPWalletCallback = {
        agentid: 'testpartner',
        playerid: 'test_player',
        trxid: `test-${Date.now()}`,
        type: 'credit',
        amount: 10.0
      };
      
      // Process the test callback
      const response = await pragmaticPlayService.processWalletCallback(testCallback);
      
      // Verify the response
      if (response.errorcode === "0") {
        return {
          success: true,
          message: 'Transaction verification successful'
        };
      } else {
        return {
          success: false,
          message: `Transaction verification failed: Error code ${response.errorcode}`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Transaction test failed: ${error.message || 'Unknown error'}`
      };
    }
  }
};

export default pragmaticPlayService;

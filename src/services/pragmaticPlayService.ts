/**
 * Service for handling Pragmatic Play API interactions
 */

import { PPGameConfig, PPWalletCallback, generatePragmaticPlayHash } from './providers/pragmaticPlayConfig';

/**
 * Launch a Pragmatic Play game
 */
export const launchPragmaticPlayGame = async (gameId: string, config: PPGameConfig) => {
  try {
    // Construct the game URL based on the configuration
    const gameUrl = `${config.apiEndpoint}/game/launch?agentId=${config.agentId}&gameId=${gameId}&apiKey=${config.apiKey}&currency=${config.currency}&language=${config.language}&returnUrl=${config.returnUrl}&platform=${config.platform}`;
    
    // Redirect the user to the game URL
    window.location.href = gameUrl;
    
    return { success: true, message: 'Game launched successfully' };
  } catch (error: any) {
    console.error("Error launching Pragmatic Play game:", error);
    return { success: false, message: error.message || 'Failed to launch game' };
  }
};

/**
 * Handle wallet callback from Pragmatic Play
 */
export const handlePragmaticPlayWalletCallback = async (data: PPWalletCallback, secretKey: string) => {
  try {
    // Validate the hash
    const expectedHash = generatePragmaticPlayHash(data, secretKey);
    if (data.hash !== expectedHash) {
      console.error("Invalid hash received:", { received: data.hash, expected: expectedHash });
      return { success: false, error: 'Invalid hash' };
    }
    
    // Process the wallet callback data
    // This is where you would update the user's wallet balance in your database
    console.log("Pragmatic Play wallet callback data:", data);
    
    // Return a success response
    return { success: true, message: 'Wallet callback processed successfully' };
  } catch (error: any) {
    console.error("Error handling Pragmatic Play wallet callback:", error);
    return { success: false, error: error.message || 'Failed to process wallet callback' };
  }
};

// Mock function to simulate processing a response
// Replace this with your actual logic
export const processResponse = (response: unknown) => {
  if (typeof response === 'object' && response !== null) {
    const typedResponse = response as Record<string, any>;
    return {
      success: true,
      sessionId: typedResponse.sessionId || '',
      roundId: typedResponse.roundId || '',
      // Add other properties as needed
    };
  }
  
  return {
    success: false,
    error: 'Invalid response format',
  };
};

export default {
  launchPragmaticPlayGame,
  handlePragmaticPlayWalletCallback,
  processResponse
};

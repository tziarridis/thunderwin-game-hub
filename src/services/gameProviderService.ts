
import axios from 'axios';
import { getProviderConfig } from '@/config/gameProviders';

// Interface for game launch options
export interface GameLaunchOptions {
  gameId: string;
  providerId: string;
  playerId?: string;
  mode?: 'real' | 'demo';
  language?: string;
  returnUrl?: string;
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
    const { providerId, gameId, playerId = 'demo', mode = 'demo', language = 'en' } = options;
    
    // Get provider configuration
    const providerConfig = getProviderConfig(providerId);
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${providerId}`);
    }
    
    try {
      // Handle Pragmatic Play integration
      if (providerConfig.code === 'PP') {
        return await getPragmaticPlayLaunchUrl(providerConfig, gameId, playerId, mode, language, options.returnUrl);
      }
      
      // Add handlers for other providers as needed
      
      throw new Error(`Provider integration not implemented: ${providerConfig.name}`);
    } catch (error: any) {
      console.error(`Error getting launch URL for ${providerId}:`, error);
      throw new Error(`Failed to get game URL: ${error.message || 'Unknown error'}`);
    }
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
  // In real implementation, this would be a secure server-side call
  // For demo purposes, we're creating a mock implementation
  
  // This is the URL structure for Pragmatic Play games
  // In production, this would be a real API call
  
  // For demo purposes, create a simulated URL
  const baseUrl = `https://${config.credentials.apiEndpoint}/game`;
  
  // Create parameters for the game
  const params = new URLSearchParams({
    gameId,
    token: config.credentials.apiToken,
    player: playerId,
    mode,
    lang: language,
    lobby: returnUrl || 'https://captaingamble.com/casino',
  });
  
  // In a real implementation, we would make an actual API call
  // return axios.post(`https://${config.credentials.apiEndpoint}/api/games/getGameUrl`, {...})
  
  console.log(`Launching ${config.name} game: ${gameId} for player: ${playerId} in ${mode} mode`);
  
  // Return mock URL for demo
  return `${baseUrl}?${params.toString()}`;
}

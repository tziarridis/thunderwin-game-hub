
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
        
        default:
          throw new Error(`Provider integration not implemented: ${providerConfig.name}`);
      }
    } catch (error: any) {
      console.error(`Error getting launch URL for ${providerId}:`, error);
      throw new Error(`Failed to get game URL: ${error.message || 'Unknown error'}`);
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
  const baseUrl = `https://${config.credentials.apiEndpoint}/game`;
  
  // Create parameters for the game
  const params = new URLSearchParams({
    gameId,
    token: config.credentials.apiToken,
    player: playerId,
    mode,
    lang: language,
    lobby: returnUrl || 'https://captaingamble.com/casino',
    currency: config.currency
  });
  
  console.log(`Launching ${config.name} game: ${gameId} for player: ${playerId} in ${mode} mode`);
  
  // Return mock URL for demo
  return `${baseUrl}?${params.toString()}`;
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

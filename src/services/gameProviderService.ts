
import axios from 'axios';
import { getProviderConfig, GameProviderConfig } from '@/config/gameProviders';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { pragmaticPlayService } from './pragmaticPlayService';
import { gitSlotParkService } from './gitSlotParkService';

// Interface for game launch options
export interface GameLaunchOptions {
  gameId: string;
  providerId: string;
  playerId?: string;
  mode?: 'real' | 'demo';
  language?: string;
  currency?: string;
  returnUrl?: string;
  platform?: 'web' | 'mobile';
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
    const { 
      providerId, 
      gameId, 
      playerId = 'demo', 
      mode = 'demo',
      language = 'en',
      currency = 'EUR',
      platform = 'web'
    } = options;
    
    const providerConfig = getProviderConfig(providerId);
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${providerId}`);
    }
    
    console.log(`Launching game with provider ${providerId}:`, {
      gameId,
      playerId,
      mode,
      language,
      currency,
      platform
    });
    
    // Log this game launch attempt to the database
    try {
      await supabase.from('transactions').insert({
        player_id: playerId,
        type: 'game_launch',
        amount: 0,
        currency: currency,
        provider: providerConfig.name,
        game_id: gameId,
        status: 'pending'
      });
    } catch (error) {
      console.error("Failed to log game launch:", error);
      // Continue with game launch even if logging fails
    }
    
    try {
      let gameUrl = '';
      
      // Use the provider code from the config
      switch(providerConfig.code) {
        case 'PP':
          gameUrl = await pragmaticPlayService.getLaunchUrl(
            providerConfig, 
            gameId, 
            playerId, 
            mode, 
            language, 
            currency,
            platform,
            options.returnUrl
          );
          break;
        
        case 'GSP':
          gameUrl = await gitSlotParkService.launchGame({
            playerId,
            gameCode: gameId,
            mode,
            returnUrl: options.returnUrl,
            language,
            currency,
            platform
          });
          break;
        
        default:
          throw new Error(`Provider integration not implemented: ${providerConfig.name}`);
      }
      
      // Update transaction status to completed
      await updateTransactionStatus(playerId, gameId, 'completed');
      
      return gameUrl;
      
    } catch (error: any) {
      console.error(`Error getting launch URL for ${providerId}:`, error);
      
      // Update the transaction status to failed
      await updateTransactionStatus(playerId, gameId, 'failed');
      
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
          return await pragmaticPlayService.processWalletCallback(providerConfig, data);
          
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
 * Helper function to update transaction status
 */
async function updateTransactionStatus(playerId: string, gameId: string, status: string): Promise<void> {
  try {
    const { data } = await supabase
      .from('transactions')
      .select('id')
      .eq('player_id', playerId)
      .eq('game_id', gameId)
      .eq('type', 'game_launch')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (data?.id) {
      await supabase
        .from('transactions')
        .update({ status })
        .eq('id', data.id);
    }
  } catch (dbError) {
    console.error(`Failed to update transaction status to ${status}:`, dbError);
  }
}

export default gameProviderService;

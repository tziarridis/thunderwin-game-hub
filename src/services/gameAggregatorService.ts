
import axios from 'axios';
import { getProviderConfig, gameProviderConfigs } from '@/config/gameProviders';
import { createGame, getGameByGameId, updateGame } from './gamesService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateMockGamesForProvider } from '@/utils/mockGameGenerator';
import { gameProviderSyncService } from './gameProviderSyncService';

interface GameInfo {
  game_id: string;
  game_name: string;
  game_code?: string;
  type?: string;
  theme?: string;
  is_mobile?: boolean;
  is_desktop?: boolean;
  thumbnail?: string;
  background?: string;
}

interface ProviderGameResponse {
  success: boolean;
  games?: GameInfo[];
  errorMessage?: string;
}

// In-memory storage for games (since we don't have a games table in Supabase yet)
let inMemoryGames: {[key: string]: GameInfo[]} = {};

/**
 * Game Aggregator Service
 * Handles fetching and syncing games from all configured providers
 */
export const gameAggregatorService = {
  /**
   * Fetch games from a specific provider
   * @param providerKey The provider configuration key
   * @returns Promise with games information
   */
  fetchGamesFromProvider: async (providerKey: string): Promise<ProviderGameResponse> => {
    const providerConfig = getProviderConfig(providerKey);
    if (!providerConfig) {
      return { success: false, errorMessage: `Unknown provider: ${providerKey}` };
    }

    try {
      // Log the provider fetch attempt
      console.log(`Fetching games for ${providerConfig.name} (${providerConfig.currency})`);
      
      // Check if we already have games from this provider in our in-memory storage
      if (inMemoryGames[providerKey] && inMemoryGames[providerKey].length > 0) {
        return { success: true, games: inMemoryGames[providerKey] };
      }
      
      // Generate mock data for this provider
      const mockGames = generateMockGamesForProvider(
        providerConfig.code, 
        Math.floor(Math.random() * 30) + 20
      );
      
      // Store mock games in our in-memory storage
      inMemoryGames[providerKey] = mockGames;
      
      return { success: true, games: mockGames };
    } catch (error: any) {
      console.error(`Error fetching games from ${providerConfig.name}:`, error);
      
      // Return a structured error response
      return {
        success: false,
        errorMessage: error.message || `Failed to connect to ${providerConfig.name}`
      };
    }
  },

  /**
   * Sync games from all configured providers
   * @returns Promise with sync results
   */
  syncAllProviders: async () => {
    return await gameProviderSyncService.syncAllProviders(inMemoryGames);
  },

  /**
   * Get all available games from all providers
   * @returns Promise with all games
   */
  getAllGames: async () => {
    try {
      // Combine all games from all providers
      const allGames: GameInfo[] = [];
      
      for (const [providerKey, games] of Object.entries(inMemoryGames)) {
        allGames.push(...games);
      }
      
      return {
        success: true,
        games: allGames
      };
    } catch (error: any) {
      console.error('Error fetching all games:', error);
      return {
        success: false,
        errorMessage: error.message || 'Unknown error'
      };
    }
  },
  
  /**
   * Get scheduled sync status
   */
  getSyncStatus: async () => {
    return gameProviderSyncService.getSyncStatus();
  },

  /**
   * Manually trigger a sync
   */
  triggerSync: async () => {
    return await gameProviderSyncService.syncAllProviders(inMemoryGames);
  },
  
  /**
   * Store a transaction for game play
   * @param data Transaction data
   */
  storeGameTransaction: async (data: { 
    player_id: string; 
    game_id: string; 
    provider: string; 
    type: string;
    amount: number;
    currency: string;
  }) => {
    try {
      // Store the transaction in Supabase
      const { data: result, error } = await supabase
        .from('transactions')
        .insert({
          player_id: data.player_id,
          game_id: data.game_id,
          provider: data.provider,
          type: data.type,
          amount: data.amount,
          currency: data.currency,
          status: 'completed'
        });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error storing game transaction:', error);
      return { 
        success: false, 
        errorMessage: error.message 
      };
    }
  }
};

export default gameAggregatorService;

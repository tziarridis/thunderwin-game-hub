
import { toast } from 'sonner';
import { getProviderConfig, gameProviderConfigs } from '@/config/gameProviders';
import { supabase } from '@/integrations/supabase/client';
import { GameInfo, ProviderGameResponse, GameTransactionData, SyncResults } from '@/types/gameAggregator';
import { generateMockGamesForProvider } from '@/utils/mockGameGenerator';
import { gameStore } from './gameStore';

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
      if (gameStore.hasGamesForProvider(providerKey)) {
        return { 
          success: true, 
          games: gameStore.getGamesForProvider(providerKey)
        };
      }
      
      // Generate mock data for this provider
      const mockGames = generateMockGamesForProvider(
        providerConfig.code, 
        Math.floor(Math.random() * 30) + 20
      );
      
      // Store mock games in our in-memory storage
      gameStore.storeGamesForProvider(providerKey, mockGames);
      
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
  syncAllProviders: async (): Promise<SyncResults> => {
    const results: Record<string, {
      success: boolean;
      gamesAdded: number;
      gamesUpdated: number;
      error?: string;
    }> = {};

    toast.info("Starting game sync from all providers");
    
    // Process each provider
    for (const [providerKey, config] of Object.entries(gameProviderConfigs)) {
      try {
        console.log(`Syncing games from ${config.name} (${config.currency})...`);
        
        const providerResponse = await gameAggregatorService.fetchGamesFromProvider(providerKey);
        
        if (!providerResponse.success || !providerResponse.games) {
          results[providerKey] = {
            success: false,
            gamesAdded: 0,
            gamesUpdated: 0,
            error: providerResponse.errorMessage || 'Unknown error'
          };
          continue;
        }

        // Process each game from the provider
        let gamesAdded = 0;
        let gamesUpdated = 0;

        for (const game of providerResponse.games) {
          const wasAdded = gameStore.upsertGame(providerKey, game);
          if (wasAdded) {
            gamesAdded++;
          } else {
            gamesUpdated++;
          }
        }

        // Store results
        results[providerKey] = {
          success: true,
          gamesAdded,
          gamesUpdated
        };
        
        toast.success(`Synced ${gamesAdded + gamesUpdated} games from ${config.name}`);

      } catch (error: any) {
        console.error(`Error syncing ${config.name} (${config.currency}):`, error);
        results[providerKey] = {
          success: false,
          gamesAdded: 0,
          gamesUpdated: 0,
          error: error.message || 'Unknown error'
        };
        
        toast.error(`Failed to sync games from ${config.name}`);
      }
    }

    return {
      success: Object.values(results).some(r => r.success),
      results,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Get all available games from all providers
   * @returns Promise with all games
   */
  getAllGames: async (): Promise<ProviderGameResponse> => {
    try {
      const allGames = gameStore.getAllGames();
      
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
    // This would connect to your database or cache to get the last sync status
    // For browser environment, we'll return mock data
    return {
      lastSync: new Date().toISOString(),
      nextScheduledSync: new Date(Date.now() + 3600000).toISOString(),
      isRunning: false,
      status: 'idle'
    };
  },

  /**
   * Manually trigger a sync
   */
  triggerSync: async () => {
    // This would trigger your cron job or background process
    // For demonstration, we'll call the sync directly
    return await gameAggregatorService.syncAllProviders();
  },
  
  /**
   * Store a transaction for game play
   * @param data Transaction data
   */
  storeGameTransaction: async (data: GameTransactionData) => {
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


import { toast } from 'sonner';
import { gameProviderConfigs } from '@/config/gameProviders';
import { gameAggregatorService } from './gameAggregatorService';

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

/**
 * Game Provider Sync Service
 * Handles synchronization operations with game providers
 */
export const gameProviderSyncService = {
  /**
   * Sync games from all configured providers
   * @returns Promise with sync results
   */
  syncAllProviders: async (inMemoryGames: {[key: string]: GameInfo[]}) => {
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
          // Check if game already exists in our in-memory storage
          const existingGames = inMemoryGames[providerKey] || [];
          const existingGameIndex = existingGames.findIndex(g => g.game_id === game.game_id);
          
          if (existingGameIndex !== -1) {
            // Update existing game
            existingGames[existingGameIndex] = {
              ...existingGames[existingGameIndex],
              ...game,
            };
            gamesUpdated++;
          } else {
            // Add new game
            if (!inMemoryGames[providerKey]) {
              inMemoryGames[providerKey] = [];
            }
            inMemoryGames[providerKey].push(game);
            gamesAdded++;
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
  }
};

export default gameProviderSyncService;

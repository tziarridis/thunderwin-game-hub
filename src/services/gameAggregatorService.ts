
import axios from 'axios';
import { getProviderConfig, gameProviderConfigs } from '@/config/gameProviders';
import { createGame, getGameByGameId, updateGame } from './gamesService';

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
      // Different providers might have slightly different API formats
      // Here we'll implement a general approach that can be extended for each provider
      
      // In a real implementation, this would call the actual provider's API
      console.log(`Fetching games for ${providerConfig.name} (${providerConfig.currency})`);

      // Mocked API call for development/testing
      // In production, this would be an actual API call to the provider's endpoint
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock response with random games
        const mockGames = generateMockGamesForProvider(
          providerConfig.code, 
          Math.floor(Math.random() * 100) + 50
        );

        return { success: true, games: mockGames };
      }

      // Real API implementation for production
      const apiUrl = `https://${providerConfig.credentials.apiEndpoint}/api/games/list`;
      
      const response = await axios.post(apiUrl, {
        agent_id: providerConfig.credentials.agentId,
        api_token: providerConfig.credentials.apiToken,
        currency: providerConfig.currency
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.data && response.data.success) {
        // Each provider might format their games differently
        // We would need to normalize their format to our schema
        return {
          success: true,
          games: normalizeGames(response.data.games, providerConfig)
        };
      } else {
        return {
          success: false,
          errorMessage: response.data.message || `Failed to fetch games from ${providerConfig.name}`
        };
      }
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
    const results: Record<string, {
      success: boolean;
      gamesAdded: number;
      gamesUpdated: number;
      error?: string;
    }> = {};

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
          // Check if game already exists
          const existingGame = await getGameByGameId(game.game_id);

          if (existingGame) {
            // Update existing game
            await updateGame(existingGame.id, {
              ...game,
              provider_id: providerKey,
              distribution: config.code,
              updated_at: new Date().toISOString()
            });
            gamesUpdated++;
          } else {
            // Add new game
            await createGame({
              ...game,
              provider_id: providerKey,
              distribution: config.code,
              status: 'active',
              views: 0,
              popularity: 0,
              is_featured: false,
              show_home: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            gamesAdded++;
          }
        }

        // Store results
        results[providerKey] = {
          success: true,
          gamesAdded,
          gamesUpdated
        };

      } catch (error: any) {
        console.error(`Error syncing ${config.name} (${config.currency}):`, error);
        results[providerKey] = {
          success: false,
          gamesAdded: 0,
          gamesUpdated: 0,
          error: error.message || 'Unknown error'
        };
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
  },

  /**
   * Manually trigger a sync
   */
  triggerSync: async () => {
    // This would trigger your cron job or background process
    // For demonstration, we'll call the sync directly
    return await gameAggregatorService.syncAllProviders();
  }
};

/**
 * Normalize games from various provider formats to our schema
 */
function normalizeGames(games: any[], providerConfig: any): GameInfo[] {
  if (!games || !Array.isArray(games)) {
    return [];
  }

  // Different providers might use different field names
  // This function handles the mapping
  return games.map(game => {
    // Default mappings for common provider formats
    return {
      game_id: game.id || game.game_id || game.gameId || '',
      game_name: game.name || game.title || game.game_name || game.gameName || '',
      game_code: game.code || game.game_code || game.gameCode || '',
      type: game.category || game.type || game.gameType || 'slots',
      theme: game.theme || game.genre || '',
      is_mobile: game.mobile_support !== false && game.isMobile !== false,
      is_desktop: game.desktop_support !== false && game.isDesktop !== false,
      thumbnail: game.thumbnail || game.image || game.icon || '',
      background: game.background || game.banner || game.bgImage || ''
    };
  });
}

/**
 * Generate mock games for development
 */
function generateMockGamesForProvider(providerCode: string, count: number): GameInfo[] {
  const gameTypes = ['slots', 'table', 'live', 'jackpot', 'crash'];
  const gameThemes = ['classic', 'adventure', 'fantasy', 'fruit', 'egypt', 'animal', 'space'];
  
  const mockGames: GameInfo[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = gameTypes[Math.floor(Math.random() * gameTypes.length)];
    const theme = gameThemes[Math.floor(Math.random() * gameThemes.length)];
    
    const game = {
      game_id: `${providerCode.toLowerCase()}_game_${i}`,
      game_name: `${providerCode} ${type.charAt(0).toUpperCase() + type.slice(1)} ${i}`,
      game_code: `${providerCode.toLowerCase()}_${type}_${i}`,
      type,
      theme,
      is_mobile: Math.random() > 0.1, // 90% mobile compatible
      is_desktop: true,
      thumbnail: `/games/${providerCode.toLowerCase()}/${type}_${i}.jpg`,
      background: `/games/bg/${providerCode.toLowerCase()}_${i}.jpg`
    };
    
    mockGames.push(game);
  }
  
  return mockGames;
}

export default gameAggregatorService;

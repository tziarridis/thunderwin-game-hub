
import axios from 'axios';
import { getProviderConfig, gameProviderConfigs } from '@/config/gameProviders';
import { createGame, getGameByGameId, updateGame } from './gamesService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

export default gameAggregatorService;

import axios from 'axios';
import { getProviderConfig, gameProviderConfigs } from '@/config/gameProviders';
import { createGame, getGameByGameId, updateGame } from './gamesService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      // Log the provider fetch attempt
      console.log(`Fetching games for ${providerConfig.name} (${providerConfig.currency})`);
      
      // In a real implementation, this would call the actual provider's API
      // For this demo, we'll use mockData and store it in the database
      
      // Check if we already have games from this provider in the database
      const { data: existingGames, error: queryError } = await supabase
        .from('games')
        .select('*')
        .eq('provider_id', providerKey)
        .limit(1);
      
      if (queryError) {
        console.error(`Error checking for existing games: ${queryError.message}`);
      }
      
      // If we don't have any games from this provider yet, generate mock games
      if (!existingGames || existingGames.length === 0) {
        // Generate mock data
        const mockGames = generateMockGamesForProvider(
          providerConfig.code, 
          Math.floor(Math.random() * 30) + 20
        );
        
        // Store mock games in the database for future use
        for (const game of mockGames) {
          try {
            await supabase.from('games').insert({
              game_id: game.game_id,
              name: game.game_name,
              provider_id: providerKey,
              type: game.type || 'slots',
              thumbnail: game.thumbnail || '',
              is_mobile: game.is_mobile || true,
              is_featured: Math.random() > 0.8, // Random 20% are featured
              show_home: Math.random() > 0.3, // Random 70% shown on home
              status: 'active'
            });
          } catch (insertError) {
            console.error(`Error inserting game ${game.game_name}:`, insertError);
          }
        }
        
        return { success: true, games: mockGames };
      } else {
        // Fetch existing games from database
        const { data: games, error } = await supabase
          .from('games')
          .select('*')
          .eq('provider_id', providerKey)
          .order('name', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        // Map database games to GameInfo format
        const mappedGames: GameInfo[] = games.map(game => ({
          game_id: game.game_id,
          game_name: game.name,
          game_code: game.game_id,
          type: game.type,
          is_mobile: game.is_mobile,
          is_desktop: true,
          thumbnail: game.thumbnail
        }));
        
        return { success: true, games: mappedGames };
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
          // Check if game already exists in the database
          const { data: existingGame, error } = await supabase
            .from('games')
            .select('*')
            .eq('game_id', game.game_id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error(`Error checking for existing game ${game.game_id}:`, error);
            continue;
          }

          if (existingGame) {
            // Update existing game
            const { error: updateError } = await supabase
              .from('games')
              .update({
                name: game.game_name,
                type: game.type || 'slots',
                thumbnail: game.thumbnail || '',
                is_mobile: game.is_mobile || true,
                updated_at: new Date().toISOString()
              })
              .eq('game_id', game.game_id);
            
            if (updateError) {
              console.error(`Error updating game ${game.game_name}:`, updateError);
            } else {
              gamesUpdated++;
            }
          } else {
            // Add new game
            const { error: insertError } = await supabase
              .from('games')
              .insert({
                game_id: game.game_id,
                name: game.game_name,
                provider_id: providerKey,
                type: game.type || 'slots',
                thumbnail: game.thumbnail || '',
                is_mobile: game.is_mobile || true,
                is_featured: Math.random() > 0.8, // Random 20% are featured
                show_home: Math.random() > 0.3, // Random 70% shown on home
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (insertError) {
              console.error(`Error adding game ${game.game_name}:`, insertError);
            } else {
              gamesAdded++;
            }
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
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        games: data
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

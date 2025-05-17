import { supabase } from '@/integrations/supabase/client';
import { Game, GameProvider, GameCategory } from '@/types'; // Will use consolidated types
import { PostgrestError } from '@supabase/supabase-js';

const mapDbGameToGame = (dbGame: any, providerName?: string): Game => {
  return {
    id: dbGame.id,
    provider_id: dbGame.provider_id,
    name: dbGame.game_name || dbGame.title, // Prefer game_name from DB
    title: dbGame.title || dbGame.game_name, // Fallback
    slug: dbGame.slug, // Assuming slug might be in DB or added later
    image: dbGame.cover || dbGame.image, // Prefer cover from DB
    description: dbGame.description,
    category: dbGame.category, // This might need joining or separate logic if it's a category ID
    category_slugs: dbGame.category_slugs || (dbGame.category ? [dbGame.category.toLowerCase().replace(/\s+/g, '-')] : []), // Handle if category_slugs is stored directly or derive
    provider: providerName || dbGame.provider_name || 'Unknown Provider', // Provider name
    provider_slug: dbGame.provider_slug, // Assuming provider_slug might be in DB
    minBet: dbGame.min_bet,
    maxBet: dbGame.max_bet,
    rtp: dbGame.rtp,
    volatility: dbGame.volatility,
    isPopular: dbGame.is_popular,
    isNew: dbGame.is_new,
    isFavorite: dbGame.is_favorite, // This usually comes from a join or separate query
    jackpot: dbGame.jackpot,
    isLive: dbGame.is_live,
    views: dbGame.views,
    gameIdentifier: dbGame.game_identifier, // This is likely the external ID
    gameCode: dbGame.game_code, // From DB
    game_id: dbGame.game_id, // From DB (external game ID)
    technology: dbGame.technology,
    launchUrl: dbGame.launch_url,
    supportedDevices: dbGame.supported_devices,
    is_featured: dbGame.is_featured, // From DB
    show_home: dbGame.show_home, // From DB
    game_type: dbGame.game_type, // From DB
    status: dbGame.status, // From DB
    distribution: dbGame.distribution, // From DB
    game_server_url: dbGame.game_server_url, // From DB
    has_lobby: dbGame.has_lobby, // From DB
    is_mobile: dbGame.is_mobile, // From DB
    has_freespins: dbGame.has_freespins, // From DB
    has_tables: dbGame.has_tables, // From DB
    only_demo: dbGame.only_demo, // From DB
    createdAt: dbGame.created_at,
    updatedAt: dbGame.updated_at,
    cover: dbGame.cover, // From DB
    // features, tags, releaseDate might need specific handling if not direct DB columns
    features: dbGame.features || [],
    tags: dbGame.tags || [],
    releaseDate: dbGame.release_date,
  };
};

export const gamesDatabaseService = {
  async getAllGames(): Promise<Game[]> {
    try {
      const { data: gamesData, error } = await supabase
        .from('games')
        .select(`
          *,
          provider:providers (name)
        `); // Fetch provider name

      if (error) throw error;
      if (!gamesData) return [];
      
      return gamesData.map(dbGame => {
        // The 'provider' field in gamesData will be an object like { name: 'ProviderName' } or null
        const providerName = dbGame.provider && typeof dbGame.provider === 'object' 
                             ? (dbGame.provider as any).name 
                             : 'Unknown Provider';
        return mapDbGameToGame(dbGame, providerName);
      });
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  },

  async getGameById(id: string): Promise<Game | null> {
    try {
      const { data: gameData, error } = await supabase
        .from('games')
        .select(`
          *,
          provider:providers (name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      if (!gameData) return null;

      const providerName = gameData.provider && typeof gameData.provider === 'object'
                           ? (gameData.provider as any).name
                           : 'Unknown Provider';
      return mapDbGameToGame(gameData, providerName);
    } catch (error) {
      console.error(`Error fetching game by ID ${id}:`, error);
      return null;
    }
  },
  
  async getGamesByCategory(categorySlug: string): Promise<Game[]> {
    // This requires a way to link games to categories by slug.
    // If 'games' table has a 'category_slugs' (jsonb array) or a 'category_id' linking to a 'game_categories' table.
    // For now, assuming 'category_slugs' array in 'games' table or direct 'category' text field.
    try {
      // Example: if games have a direct text category field that can be mapped to slug
      // Or if games have category_slugs JSONB array: .contains('category_slugs', `["${categorySlug}"]`)
      const { data, error } = await supabase
        .from('games')
        .select(`*, provider:providers (name)`)
        // This is a placeholder. Actual filtering depends on your schema.
        // Option 1: Game has a 'category' text field matching the slug (less flexible)
        // .eq('category', categorySlug) 
        // Option 2: Game has 'category_slugs' array field
        .filter('category_slugs', 'cs', `{${categorySlug}}`) // Assumes category_slugs is array of text

      if (error) throw error;
      return data ? data.map(dbGame => mapDbGameToGame(dbGame, (dbGame.provider as any)?.name)) : [];
    } catch (err) {
      console.error(`Error fetching games for category ${categorySlug}:`, err);
      return [];
    }
  },

  async getGameProviders(): Promise<GameProvider[]> {
    try {
      const { data, error } = await supabase.from('providers').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching game providers:', error);
      return [];
    }
  },

  async getGameCategories(): Promise<GameCategory[]> {
    try {
      const { data, error } = await supabase.from('game_categories').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching game categories:', error);
      return [];
    }
  },
  
  async getFavoriteGames(userId: string): Promise<Game[]> {
    try {
      const { data: favData, error: favError } = await supabase
        .from('favorite_games')
        .select('game_id')
        .eq('user_id', userId);

      if (favError) throw favError;
      if (!favData || favData.length === 0) return [];

      const gameIds = favData.map(f => f.game_id);

      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`*, provider:providers (name)`)
        .in('id', gameIds); // Assuming game_id in favorite_games maps to id in games

      if (gamesError) throw gamesError;
      return gamesData ? gamesData.map(dbGame => mapDbGameToGame(dbGame, (dbGame.provider as any)?.name)) : [];
    } catch (err) {
      console.error('Error fetching favorite games:', err);
      return [];
    }
  },

  async toggleFavorite(gameId: string, userId: string, isCurrentlyFavorite: boolean): Promise<boolean> {
    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_games')
          .delete()
          .match({ user_id: userId, game_id: gameId }); // game_id here should match the column name in 'favorite_games'
        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_games')
          .insert({ user_id: userId, game_id: gameId });
        if (error) throw error;
      }
      return true;
    } catch (err) {
      console.error('Error toggling favorite game:', err);
      return false;
    }
  },

  async incrementGameView(gameId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_game_view', { game_id_param: gameId }); // Ensure RPC name and param match
      if (error) throw error;
    } catch (err) {
      console.error('Error incrementing game view:', err);
    }
  },

  // Admin functions for game management
  async createGame(gameData: Partial<Game>): Promise<Game | null> {
    try {
      // Map Game type to DB schema. 'games' table columns:
      // id, provider_id, game_name, game_code, description, cover, status, technology,
      // has_lobby, is_mobile, has_freespins, has_tables, only_demo, rtp, distribution,
      // views, is_featured, show_home, game_type, game_id (external), category_slugs (if added)
      const dbGameData: any = {
        provider_id: gameData.provider_id,
        game_name: gameData.title || gameData.name,
        title: gameData.title, // Supabase might ignore this if no 'title' column
        game_code: gameData.gameCode,
        description: gameData.description,
        cover: gameData.image || gameData.cover,
        status: gameData.status || 'active',
        technology: gameData.technology,
        has_lobby: gameData.has_lobby,
        is_mobile: gameData.is_mobile,
        has_freespins: gameData.has_freespins,
        has_tables: gameData.has_tables,
        only_demo: gameData.only_demo,
        rtp: gameData.rtp,
        distribution: gameData.distribution,
        is_featured: gameData.is_featured,
        show_home: gameData.show_home,
        game_type: gameData.game_type,
        game_id: gameData.game_id, // External game ID
        // category_slugs: gameData.category_slugs, // If you have this column
        // slug: gameData.slug, // Only if 'slug' column exists
      };
      // Remove undefined properties
      Object.keys(dbGameData).forEach(key => dbGameData[key] === undefined && delete dbGameData[key]);


      const { data, error } = await supabase.from('games').insert(dbGameData).select().single();
      if (error) throw error;
      return data ? mapDbGameToGame(data) : null;
    } catch (err) {
      console.error("Error creating game:", err);
      return null;
    }
  },

  async updateGame(gameId: string, gameData: Partial<Game>): Promise<Game | null> {
    try {
      const dbGameData: any = {
        provider_id: gameData.provider_id,
        game_name: gameData.title || gameData.name,
        title: gameData.title,
        game_code: gameData.gameCode,
        description: gameData.description,
        cover: gameData.image || gameData.cover,
        status: gameData.status,
        technology: gameData.technology,
        has_lobby: gameData.has_lobby,
        is_mobile: gameData.is_mobile,
        has_freespins: gameData.has_freespins,
        has_tables: gameData.has_tables,
        only_demo: gameData.only_demo,
        rtp: gameData.rtp,
        distribution: gameData.distribution,
        is_featured: gameData.is_featured,
        show_home: gameData.show_home,
        game_type: gameData.game_type,
        game_id: gameData.game_id, // External game ID
        // category_slugs: gameData.category_slugs,
        // slug: gameData.slug,
      };
      Object.keys(dbGameData).forEach(key => dbGameData[key] === undefined && delete dbGameData[key]);


      const { data, error } = await supabase.from('games').update(dbGameData).eq('id', gameId).select().single();
      if (error) throw error;
      return data ? mapDbGameToGame(data) : null;
    } catch (err) {
      console.error("Error updating game:", err);
      return null;
    }
  },

  async deleteGame(gameId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('games').delete().eq('id', gameId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error deleting game:", err);
      return false;
    }
  },
};

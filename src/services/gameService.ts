
import { supabase } from '@/integrations/supabase/client'; // Corrected Supabase client import
import { Game, GameProvider, GameCategory, GameLaunchOptions, DbGame, ApiResponse } from '@/types';

const mapDbGameToGame = (dbGame: DbGame): Game => {
  // Ensure this mapping is comprehensive and correct based on your Game and DbGame types
  return {
    id: dbGame.id,
    title: dbGame.title || 'Unknown Title',
    provider: dbGame.provider_slug || dbGame.provider_id || 'unknown-provider',
    category: Array.isArray(dbGame.category_slugs) ? (dbGame.category_slugs[0] || 'unknown-category') : (dbGame.category_slugs || 'unknown-category'),
    image: dbGame.cover || dbGame.image_url || '/placeholder.svg',
    // Map all other necessary fields from DbGame to Game
    game_id: dbGame.game_id,
    name: dbGame.title,
    providerName: dbGame.provider_slug, 
    categoryName: Array.isArray(dbGame.category_slugs) ? dbGame.category_slugs.join(', ') : dbGame.category_slugs,
    category_slugs: dbGame.category_slugs,
    description: dbGame.description,
    rtp: dbGame.rtp,
    volatility: dbGame.volatility,
    minBet: dbGame.min_bet,
    maxBet: dbGame.max_bet,
    isNew: dbGame.is_new,
    isPopular: dbGame.is_popular,
    is_featured: dbGame.is_featured,
    show_home: dbGame.show_home,
    tags: dbGame.tags,
    launchUrl: dbGame.launch_url, // Ensure launch_url is part of DbGame or constructed
    jackpot: undefined, // Placeholder, adjust if DbGame has jackpot
    releaseDate: dbGame.release_date,
    release_date: dbGame.release_date,
    views: dbGame.views,
    created_at: dbGame.created_at,
    updated_at: dbGame.updated_at,
    provider_id: dbGame.provider_id,
    provider_slug: dbGame.provider_slug,
    features: dbGame.features,
    themes: dbGame.themes,
    lines: dbGame.lines,
    cover: dbGame.cover,
    banner: dbGame.banner,
    image_url: dbGame.image_url,
    status: dbGame.status,
    slug: dbGame.slug,
    game_code: dbGame.game_code,
  };
};


export const gameService = {
  getAllGames: async (): Promise<ApiResponse<DbGame[]>> => {
    const { data, error } = await supabase.from('games').select('*');
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as DbGame[] };
  },

  getGameById: async (id: string): Promise<ApiResponse<DbGame | null>> => {
    const { data, error } = await supabase.from('games').select('*').eq('id', id).single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as DbGame | null };
  },
  
  getAllProviders: async (): Promise<ApiResponse<GameProvider[]>> => {
    const { data, error } = await supabase.from('game_providers').select('*'); // Assuming table name is 'game_providers'
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as GameProvider[] };
  },

  getAllCategories: async (): Promise<ApiResponse<GameCategory[]>> => {
    const { data, error } = await supabase.from('game_categories').select('*');
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as GameCategory[] };
  },

  // Placeholder for createSession - implement actual logic
  createSession: async (game: Game, options: GameLaunchOptions): Promise<ApiResponse<null> & { gameUrl?: string }> => {
    // This should call your backend or a game provider's API to get a launch URL
    console.log('Creating session for game:', game.id, 'with options:', options);
    // Example:
    // const response = await fetch(`/api/launch-game/${game.id}`, { method: 'POST', body: JSON.stringify(options) });
    // const data = await response.json();
    // if (!response.ok) return { success: false, error: data.error || 'Failed to launch game' };
    // return { success: true, gameUrl: data.launchUrl };
    
    // Mock implementation for now:
    const MOCK_GAME_URL_TEMPLATE = "https://example-provider.com/launch?game_id={GAME_ID}&token={TOKEN}&mode={MODE}";
    const token = "mock_user_session_token"; // Should be a real session token
    const gameUrl = MOCK_GAME_URL_TEMPLATE
        .replace("{GAME_ID}", game.game_id || game.id) // Use game_id if available, otherwise fallback to id
        .replace("{TOKEN}", token)
        .replace("{MODE}", options.mode);

    return { success: true, gameUrl: gameUrl };
  },

  getFavoriteGames: async (userId: string): Promise<ApiResponse<DbGame[]>> => {
    const { data: favoriteLinks, error: favError } = await supabase
      .from('favorite_games')
      .select('game_id')
      .eq('user_id', userId);

    if (favError) return { success: false, error: favError.message };
    if (!favoriteLinks || favoriteLinks.length === 0) return { success: true, data: [] };

    const gameIds = favoriteLinks.map(fav => fav.game_id);
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .in('id', gameIds);
    
    if (gamesError) return { success: false, error: gamesError.message };
    return { success: true, data: games as DbGame[] };
  },

  toggleFavoriteGame: async (userId: string, gameId: string, isFavorite: boolean): Promise<ApiResponse<null>> => {
    if (isFavorite) { // Add to favorites
      const { error } = await supabase.from('favorite_games').insert({ user_id: userId, game_id: gameId });
      if (error) return { success: false, error: error.message };
    } else { // Remove from favorites
      const { error } = await supabase.from('favorite_games').delete().match({ user_id: userId, game_id: gameId });
      if (error) return { success: false, error: error.message };
    }
    return { success: true, data: null };
  },

  incrementGameView: async (gameId: string): Promise<ApiResponse<null>> => {
    // This requires an RPC function or careful handling of RLS if views column is directly updatable
    // For simplicity, let's assume an RPC function `increment_game_view` exists
    const { error } = await supabase.rpc('increment_game_view', { game_id_param: gameId });
    if (error) {
      console.error('Error incrementing game view:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data: null };
  },
  
  addGame: async (gameData: Partial<DbGame>): Promise<DbGame | null> => {
    // Ensure essential fields like title, provider_slug, category_slugs are present if required by DB
    const { data, error } = await supabase.from('games').insert(gameData).select().single();
    if (error) {
      console.error("Error adding game in service:", error);
      throw new Error(error.message);
    }
    return data as DbGame;
  },

  updateGame: async (gameId: string, gameData: Partial<DbGame>): Promise<DbGame | null> => {
    const { data, error } = await supabase.from('games').update(gameData).eq('id', gameId).select().single();
    if (error) {
      console.error("Error updating game in service:", error);
      throw new Error(error.message);
    }
    return data as DbGame;
  },

  deleteGame: async (gameId: string): Promise<boolean> => {
    const { error } = await supabase.from('games').delete().eq('id', gameId);
    if (error) {
      console.error("Error deleting game in service:", error);
      throw new Error(error.message);
    }
    return !error;
  },
};


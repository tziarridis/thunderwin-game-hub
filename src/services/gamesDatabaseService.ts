import { supabase } from '@/integrations/supabase/client';
import { Game, GameProvider, GameCategory, DbGame, GameTag, GameToGameTag } from '@/types'; // Assuming DbGame, GameTag, GameToGameTag are defined for DB mapping
import { toast } from 'sonner';

// Basic mapping, extend as needed
const mapDbGameToGame = (dbGame: DbGame, categories?: GameCategory[], providers?: GameProvider[]): Game => {
  const gameCategories = Array.isArray(dbGame.category_slugs) ? dbGame.category_slugs : (typeof dbGame.category_slugs === 'string' ? [dbGame.category_slugs] : []);
  const provider = providers?.find(p => p.slug === dbGame.provider_slug);

  return {
    id: dbGame.id,
    title: dbGame.title,
    provider: provider?.name || dbGame.provider_slug || 'Unknown Provider',
    provider_slug: dbGame.provider_slug,
    category_slugs: gameCategories,
    image: dbGame.image_url || dbGame.cover, // Assuming image_url or cover
    cover: dbGame.cover || dbGame.image_url,
    description: dbGame.description,
    rtp: dbGame.rtp,
    volatility: dbGame.volatility,
    isPopular: dbGame.is_popular,
    isNew: dbGame.is_new,
    status: dbGame.status as Game['status'],
    game_id: dbGame.external_game_id || dbGame.game_id, // Assuming external_game_id or game_id
    gameCode: dbGame.game_code,
    slug: dbGame.slug,
    is_featured: dbGame.is_featured,
    show_home: dbGame.show_home,
    game_type: dbGame.game_type,
    technology: dbGame.technology,
    distribution: dbGame.distribution,
    game_server_url: dbGame.game_server_url,
    has_lobby: dbGame.has_lobby,
    is_mobile: dbGame.is_mobile,
    has_freespins: dbGame.has_freespins,
    has_tables: dbGame.has_tables,
    only_demo: dbGame.only_demo,
    views: dbGame.views || 0,
    created_at: dbGame.created_at,
    updated_at: dbGame.updated_at,
    // isFavorite can be set based on user's favorites list
  };
};


export const gamesDatabaseService = {
  getAllGames: async (): Promise<Game[]> => {
    try {
      const { data, error } = await supabase.from('games').select('*').order('title', { ascending: true });
      if (error) throw error;
      // Assuming data items are DbGame[] and need mapping
      return data.map(dbGame => mapDbGameToGame(dbGame as DbGame)) as Game[];
    } catch (error: any) {
      console.error('Error fetching all games:', error);
      toast.error(error.message || 'Failed to fetch games.');
      return [];
    }
  },
  getGameById: async (id: string): Promise<Game | null> => {
    try {
      const { data, error } = await supabase.from('games').select('*').eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data ? mapDbGameToGame(data as DbGame) as Game : null;
    } catch (error: any) {
      console.error(`Error fetching game by id ${id}:`, error);
      toast.error(error.message || `Failed to fetch game ${id}.`);
      return null;
    }
  },
  
  getGameProviders: async (): Promise<GameProvider[]> => {
    try {
      const { data, error } = await supabase.from('game_providers').select('*').order('order', { ascending: true });
      if (error) throw error;
      return data as GameProvider[];
    } catch (error: any) {
      console.error('Error fetching game providers:', error);
      toast.error(error.message || 'Failed to fetch game providers.');
      return [];
    }
  },
  
  getGameCategories: async (): Promise<GameCategory[]> => {
    try {
      const { data, error } = await supabase.from('game_categories').select('*').order('name', { ascending: true });
      if (error) throw error;
      // Ensure status is correctly typed
      return data.map(cat => ({
        ...cat,
        status: cat.status as "active" | "inactive", // Casting to fix TS error
      })) as GameCategory[];
    } catch (error: any) {
      console.error('Error fetching game categories:', error);
      toast.error(error.message || 'Failed to fetch game categories.');
      return [];
    }
  },

  getFavoriteGames: async (userId: string): Promise<Game[]> => {
    try {
      const { data: favoriteIdsData, error: favError } = await supabase
        .from('user_favorite_games')
        .select('game_id')
        .eq('user_id', userId);

      if (favError) throw favError;
      if (!favoriteIdsData || favoriteIdsData.length === 0) return [];

      const gameIds = favoriteIdsData.map(fav => fav.game_id);
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .in('id', gameIds);
      
      if (gamesError) throw gamesError;
      return gamesData.map(dbGame => mapDbGameToGame(dbGame as DbGame)) as Game[];
    } catch (error: any) {
      console.error('Error fetching favorite games:', error);
      toast.error(error.message || 'Failed to fetch favorite games.');
      return [];
    }
  },

  toggleFavorite: async (gameId: string, userId: string, isCurrentlyFavorite: boolean): Promise<boolean> => {
    try {
      if (isCurrentlyFavorite) {
        const { error } = await supabase
          .from('user_favorite_games')
          .delete()
          .match({ user_id: userId, game_id: gameId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_favorite_games')
          .insert({ user_id: userId, game_id: gameId });
        if (error) throw error;
      }
      return true;
    } catch (error: any) {
      console.error('Error toggling favorite game:', error);
      toast.error(error.message || 'Failed to update favorite status.');
      return false;
    }
  },

  incrementGameView: async (gameId: string): Promise<void> => {
    try {
      // Assuming your RPC function is named 'increment_game_view' or 'increment_game_view_rpc'
      // And it expects a parameter like 'p_game_id' or 'game_id_in'
      // The error TS2589 / TS2353 Object literal may only specify known properties, and 'game_id_param' does not exist
      // This implies the RPC call should be:
      const { error } = await supabase.rpc('increment_game_view', { p_game_id: gameId }); 
      // OR if the param is 'game_id':
      // const { error } = await supabase.rpc('increment_game_view', { gameid: gameId }); // Check exact RPC param name
      // For now, using a common pattern p_game_id. The error message { game_id: string; } suggests the param is simply 'game_id' for the RPC
      // const { error } = await supabase.rpc('increment_game_view_rpc', { game_id: gameId }); // Based on error hint
      // The specific error `src/services/gamesDatabaseService.ts(204,69): error TS2353: Object literal may only specify known properties, and 'game_id_param' does not exist in type '{ game_id: string; }'.`
      // This means the type hint for the RPC expects `{ game_id: string }`. So the call should be:
      const { error: rpcError } = await supabase.rpc('increment_game_view_rpc', { game_id: gameId });


      if (rpcError) throw rpcError;
    } catch (error: any) {
      // This is a background task, so maybe don't toast error to user unless critical
      console.warn(`Failed to increment view for game ${gameId}:`, error.message);
    }
  },
   createGame: async (gameData: Partial<Game>): Promise<Game | null> => {
    try {
      // Map Partial<Game> to what the 'games' table expects (DbGame like structure)
      const dbGameData = {
        title: gameData.title,
        provider_slug: gameData.provider_slug,
        // ... other fields from Game to DbGame fields ...
        // Ensure all required DB fields are present or have defaults
        image_url: gameData.image || gameData.cover,
        external_game_id: gameData.game_id,
        game_code: gameData.gameCode,
        slug: gameData.slug,
        is_featured: gameData.is_featured,
        // ... map all relevant fields
      };
      const { data, error } = await supabase.from('games').insert(dbGameData).select().single();
      if (error) throw error;
      return data ? mapDbGameToGame(data as DbGame) : null;
    } catch (error: any) {
      console.error('Error creating game:', error);
      toast.error(error.message || 'Failed to create game.');
      return null;
    }
  },

  updateGame: async (gameId: string, gameData: Partial<Game>): Promise<Game | null> => {
    try {
      const dbGameData = { /* map Game to DbGame fields selectively */ };
      // Construct dbGameData carefully from gameData
      if (gameData.title !== undefined) (dbGameData as any).title = gameData.title;
      if (gameData.provider_slug !== undefined) (dbGameData as any).provider_slug = gameData.provider_slug;
      if (gameData.image !== undefined || gameData.cover !== undefined) (dbGameData as any).image_url = gameData.image || gameData.cover;
      // ... map other updatable fields
      
      const { data, error } = await supabase.from('games').update(dbGameData).eq('id', gameId).select().single();
      if (error) throw error;
      return data ? mapDbGameToGame(data as DbGame) : null;
    } catch (error: any) {
      console.error(`Error updating game ${gameId}:`, error);
      toast.error(error.message || `Failed to update game ${gameId}.`);
      return null;
    }
  },

  deleteGame: async (gameId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('games').delete().eq('id', gameId);
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error(`Error deleting game ${gameId}:`, error);
      toast.error(error.message || `Failed to delete game ${gameId}.`);
      return false;
    }
  },
};

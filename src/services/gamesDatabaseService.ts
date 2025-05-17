import { supabase } from "@/integrations/supabase/client";
import { Game, GameCategory, GameProvider } from "@/types";
import { toast } from "sonner";

// Helper function to map Supabase game data to our Game type
const mapSupabaseGameToGame = (dbGame: any): Game => {
  return {
    id: dbGame.id,
    // provider_id: dbGame.provider_id, // Use provider_slug or map to provider object
    name: dbGame.game_name,
    title: dbGame.game_name, // Assuming title is same as name initially
    slug: dbGame.game_code, // Assuming slug is game_code
    image: dbGame.cover, // Assuming image is cover
    cover: dbGame.cover,
    category_slugs: dbGame.category_slugs || [], // Make sure this is in your db or handled
    provider_slug: dbGame.provider_slug || '', // Make sure this is in your db or handled
    provider: dbGame.provider_name || (dbGame.providers?.name) || '', // provider_name from a join or providers table
    rtp: dbGame.rtp,
    views: dbGame.views,
    is_featured: dbGame.is_featured,
    show_home: dbGame.show_home,
    game_type: dbGame.game_type,
    description: dbGame.description,
    status: dbGame.status,
    technology: dbGame.technology,
    distribution: dbGame.distribution,
    game_server_url: dbGame.game_server_url,
    game_id: dbGame.game_id, // External game ID
    gameCode: dbGame.game_code, // Internal game code/slug
    has_lobby: dbGame.has_lobby,
    is_mobile: dbGame.is_mobile,
    has_freespins: dbGame.has_freespins,
    has_tables: dbGame.has_tables,
    only_demo: dbGame.only_demo,
    isLive: dbGame.is_live || dbGame.game_type === 'live_dealer', // Example logic for isLive
    // category: (dbGame.game_categories?.name) || '', // Example if joined with game_categories
    // minBet, maxBet, volatility would typically come from game details, not always in main list
    createdAt: dbGame.created_at,
    updatedAt: dbGame.updated_at
  };
};

export const gamesDatabaseService = {
  async getAllGames(): Promise<Game[]> {
    try {
      // Example: Fetch games with provider name (if providers table is separate)
      // const { data, error } = await supabase.from("games").select("*, providers(name)");
      const { data, error } = await supabase.from("games").select("*");
      if (error) throw error;
      return data.map(mapSupabaseGameToGame);
    } catch (error: any) {
      console.error("Error fetching all games:", error);
      toast.error("Failed to load games.");
      return [];
    }
  },

  async getGameById(id: string): Promise<Game | null> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*") // Potentially join with providers or categories if needed for full detail
        .eq("id", id)
        .single();
      if (error) throw error;
      return data ? mapSupabaseGameToGame(data) : null;
    } catch (error:any) {
      console.error(`Error fetching game ${id}:`, error);
      // toast.error("Failed to load game details."); // Toast can be repetitive, use with care
      return null;
    }
  },

  async getGamesByCategory(categorySlug: string): Promise<Game[]> {
    try {
      // This implementation needs to correctly filter by category_slugs array
      // For now, it fetches games that have the categorySlug in their category_slugs array.
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .contains("category_slugs", [categorySlug]) // Use 'contains' for array filtering
        .limit(50); 
      if (error) throw error;
      return data.map(mapSupabaseGameToGame);
    } catch (error: any) {
      console.error(`Error fetching games for category ${categorySlug}:`, error);
      toast.error(`Failed to load games for category ${categorySlug}.`);
      return [];
    }
  },
  
  async getGamesByProviderSlug(providerSlug: string): Promise<Game[]> {
    try {
      // This assumes 'provider_slug' is a column in your 'games' table.
      // If not, you'd need to join with a 'providers' table first.
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq('provider_slug', providerSlug)
        .limit(50);
      if (error) throw error;
      return data.map(mapSupabaseGameToGame);
    } catch (error: any) {
      console.error(`Error fetching games for provider ${providerSlug}:`, error);
      toast.error(`Failed to load games for provider ${providerSlug}.`);
      return [];
    }
  },

  async searchGames(query: string): Promise<Game[]> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .ilike("game_name", `%${query}%`) 
        .limit(20);
      if (error) throw error;
      return data.map(mapSupabaseGameToGame);
    } catch (error: any) {
      console.error(`Error searching games with query "${query}":`, error);
      toast.error("Game search failed.");
      return [];
    }
  },

  async getFeaturedGames(): Promise<Game[]> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("is_featured", true)
        .limit(10);
      if (error) throw error;
      return data.map(mapSupabaseGameToGame);
    } catch (error: any) {
      console.error("Error fetching featured games:", error);
      toast.error("Failed to load featured games.");
      return [];
    }
  },

  async getPopularGames(): Promise<Game[]> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("views", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data.map(mapSupabaseGameToGame);
    } catch (error: any) {
      console.error("Error fetching popular games:", error);
      toast.error("Failed to load popular games.");
      return [];
    }
  },

  async getGameProviders(): Promise<GameProvider[]> {
    try {
      const { data, error } = await supabase.from("providers").select("*");
      if (error) throw error;
      // Ensure mapping matches GameProvider type
      return data.map(item => ({
        id: item.id,
        name: item.name, 
        logo: item.logo,
        description: item.description,
        status: item.status,
        // gamesCount: item.games_count, // if you have this field
        // isPopular: item.is_popular,
        // featured: item.featured,
        api_endpoint: item.api_endpoint,
        api_key: item.api_key, 
        api_secret: item.api_secret,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })) as GameProvider[];
    } catch (error: any) {
      console.error("Error fetching game providers:", error);
      toast.error("Failed to load game providers.");
      return [];
    }
  },

  async getGameCategories(): Promise<GameCategory[]> {
    try {
      const { data, error } = await supabase.from("game_categories").select("*");
      if (error) throw error;
      return data as GameCategory[]; // Assuming direct mapping is fine
    } catch (error: any) {
      console.error("Error fetching game categories:", error);
      toast.error("Failed to load game categories.");
      return [];
    }
  },

  async addGame(gameData: Partial<Game>): Promise<Game | null> { // Use Partial<Game> for flexibility
    try {
      // Map Game type to Supabase 'games' table structure carefully
      const dbGameData: any = {
        // provider_id: gameData.provider_id, // If you have a providers table and link by ID
        game_name: gameData.name || gameData.title,
        game_code: gameData.gameCode || gameData.slug,
        cover: gameData.image || gameData.cover,
        rtp: gameData.rtp,
        is_featured: gameData.is_featured,
        show_home: gameData.show_home,
        game_type: gameData.game_type,
        description: gameData.description,
        status: gameData.status,
        technology: gameData.technology,
        distribution: gameData.distribution,
        game_server_url: gameData.game_server_url,
        game_id: gameData.game_id, // External game ID
        has_lobby: gameData.has_lobby,
        is_mobile: gameData.is_mobile,
        has_freespins: gameData.has_freespins,
        has_tables: gameData.has_tables,
        only_demo: gameData.only_demo,
        is_live: gameData.isLive,
        category_slugs: gameData.category_slugs,
        provider_slug: gameData.provider_slug,
        // provider_name: gameData.provider // If storing provider name directly on games table
      };
      // Remove undefined fields before insert
      Object.keys(dbGameData).forEach(key => dbGameData[key] === undefined && delete dbGameData[key]);

      const { data, error } = await supabase.from("games").insert(dbGameData).select().single();
      if (error) throw error;
      return data ? mapSupabaseGameToGame(data) : null;
    } catch (error: any) {
      console.error("Error adding game:", error);
      toast.error(`Failed to add game: ${error.message}`);
      return null;
    }
  },

  async updateGame(gameId: string, updates: Partial<Game>): Promise<Game | null> { // Use Partial<Game>
    try {
      const dbUpdates: { [key: string]: any } = {};
      // Map only the fields present in 'updates' to their DB column names
      if (updates.name !== undefined) dbUpdates.game_name = updates.name;
      if (updates.title !== undefined) dbUpdates.game_name = updates.title; // Assuming title updates game_name
      if (updates.slug !== undefined) dbUpdates.game_code = updates.slug;
      if (updates.gameCode !== undefined) dbUpdates.game_code = updates.gameCode;
      if (updates.image !== undefined) dbUpdates.cover = updates.image;
      if (updates.cover !== undefined) dbUpdates.cover = updates.cover;
      if (updates.rtp !== undefined) dbUpdates.rtp = updates.rtp;
      if (updates.is_featured !== undefined) dbUpdates.is_featured = updates.is_featured;
      if (updates.show_home !== undefined) dbUpdates.show_home = updates.show_home;
      if (updates.game_type !== undefined) dbUpdates.game_type = updates.game_type;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.technology !== undefined) dbUpdates.technology = updates.technology;
      if (updates.distribution !== undefined) dbUpdates.distribution = updates.distribution;
      if (updates.game_server_url !== undefined) dbUpdates.game_server_url = updates.game_server_url;
      if (updates.game_id !== undefined) dbUpdates.game_id = updates.game_id;
      if (updates.has_lobby !== undefined) dbUpdates.has_lobby = updates.has_lobby;
      if (updates.is_mobile !== undefined) dbUpdates.is_mobile = updates.is_mobile;
      if (updates.has_freespins !== undefined) dbUpdates.has_freespins = updates.has_freespins;
      if (updates.has_tables !== undefined) dbUpdates.has_tables = updates.has_tables;
      if (updates.only_demo !== undefined) dbUpdates.only_demo = updates.only_demo;
      if (updates.isLive !== undefined) dbUpdates.is_live = updates.isLive;
      if (updates.category_slugs !== undefined) dbUpdates.category_slugs = updates.category_slugs;
      if (updates.provider_slug !== undefined) dbUpdates.provider_slug = updates.provider_slug;
      // if (updates.provider !== undefined) dbUpdates.provider_name = updates.provider; // If storing provider name

      if (Object.keys(dbUpdates).length === 0) {
        toast.info("No changes to update.");
        const currentGame = await this.getGameById(gameId); // Return current game if no updates
        return currentGame;
      }

      const { data, error } = await supabase
        .from("games")
        .update(dbUpdates)
        .eq("id", gameId)
        .select()
        .single();
      if (error) throw error;
      return data ? mapSupabaseGameToGame(data) : null;
    } catch (error: any) {
      console.error(`Error updating game ${gameId}:`, error);
      toast.error(`Failed to update game: ${error.message}`);
      return null;
    }
  },

  async deleteGame(gameId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("games").delete().eq("id", gameId);
      if (error) throw error;
      toast.success("Game deleted successfully.");
      return true;
    } catch (error: any) {
      console.error(`Error deleting game ${gameId}:`, error);
      toast.error("Failed to delete game.");
      return false;
    }
  },

  async incrementGameView(gameId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_game_view', { game_id_param: gameId }); // Ensure RPC param name matches
      if (error) throw error;
    } catch (error: any) {
      console.error(`Error incrementing view for game ${gameId}:`, error);
      // Do not toast here, it's a background task
    }
  },
  
  async getFavoriteGames(userId: string): Promise<Game[]> {
    try {
      const { data: favoriteEntries, error: favError } = await supabase
        .from('favorite_games')
        .select('game_id')
        .eq('user_id', userId); // Assuming favorite_games.user_id maps to your public.users.id

      if (favError) throw favError;
      if (!favoriteEntries || favoriteEntries.length === 0) return [];

      const gameIds = favoriteEntries.map(fav => fav.game_id);
      
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*') // Consider joining with providers if needed for favorite list display
        .in('id', gameIds);

      if (gamesError) throw gamesError;
      return gamesData.map(mapSupabaseGameToGame);
    } catch (error: any) {
      console.error('Error fetching favorite games:', error);
      toast.error('Failed to load favorite games.');
      return [];
    }
  },

  async toggleFavorite(gameId: string, userId: string, isCurrentlyFavorite: boolean): Promise<boolean> {
    try {
      if (isCurrentlyFavorite) {
        const { error } = await supabase
          .from('favorite_games')
          .delete()
          .match({ user_id: userId, game_id: gameId }); // Match on user_id from public.users
        if (error) throw error;
      } else { 
        const { error } = await supabase
          .from('favorite_games')
          .insert({ user_id: userId, game_id: gameId }); // user_id from public.users
        if (error) throw error;
      }
      return true;
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      // toast.error("Failed to update favorite status."); // Can be part of useGames hook
      return false;
    }
  },
};

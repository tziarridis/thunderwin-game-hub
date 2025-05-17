
import { supabase } from "@/integrations/supabase/client";
import { Game, GameProvider as SupabaseGameProvider } from "@/types"; // Assuming Game is from here
import { GameCategory, GameProvider } from "@/types/additional"; // Use newly defined GameProvider
import { toast } from "sonner";

// Helper function to map Supabase game data to our Game type
const mapSupabaseGameToGame = (dbGame: any): Game => {
  return {
    id: dbGame.id,
    provider_id: dbGame.provider_id,
    name: dbGame.game_name, // Supabase has game_name
    title: dbGame.game_name, // Assuming title is same as name
    slug: dbGame.game_code, // Assuming slug can be game_code
    image: dbGame.cover,
    category_slugs: [], // This needs to be populated if used
    provider_slug: '', // This needs to be populated if used
    tags: [], // This needs to be populated if used
    rtp: dbGame.rtp,
    views: dbGame.views,
    is_featured: dbGame.is_featured,
    show_home: dbGame.show_home,
    created_at: dbGame.created_at,
    updated_at: dbGame.updated_at,
    game_type: dbGame.game_type,
    description: dbGame.description,
    cover: dbGame.cover,
    status: dbGame.status,
    technology: dbGame.technology,
    distribution: dbGame.distribution,
    game_server_url: dbGame.game_server_url,
    game_id: dbGame.game_id,
    game_code: dbGame.game_code,
    has_lobby: dbGame.has_lobby,
    is_mobile: dbGame.is_mobile,
    has_freespins: dbGame.has_freespins,
    has_tables: dbGame.has_tables,
    only_demo: dbGame.only_demo,
    isLive: dbGame.is_live, // Assuming is_live column exists or will be added
    // Ensure all properties of Game type are covered
  };
};


export const gamesDatabaseService = {
  async getAllGames(): Promise<Game[]> {
    try {
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
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data ? mapSupabaseGameToGame(data) : null;
    } catch (error: any) {
      console.error(`Error fetching game ${id}:`, error);
      toast.error("Failed to load game details.");
      return null;
    }
  },

  async getGamesByCategory(categorySlug: string): Promise<Game[]> {
    try {
      // This requires a join or a way to link games to categories via categorySlug
      // For now, returning all games as a placeholder
      // You'll need to adjust this based on your schema (e.g., a game_categories_games link table)
      console.warn(`getGamesByCategory for ${categorySlug} is not fully implemented and returns all games.`);
      const { data, error } = await supabase.from("games").select("*").limit(20); // Example limit
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
      // This requires finding provider_id from providerSlug, then fetching games
      // Placeholder implementation
      console.warn(`getGamesByProviderSlug for ${providerSlug} is not fully implemented.`);
       const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('name', providerSlug) // Assuming slug is stored in name or a dedicated slug column
        .single();

      if (providerError || !providerData) {
        console.error(`Provider not found for slug ${providerSlug}:`, providerError);
        return [];
      }
      
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq('provider_id', providerData.id)
        .limit(20);
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
        .ilike("game_name", `%${query}%`) // Search by game_name
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
      // Ensure data matches GameProvider structure, especially 'name'
      return data.map(item => ({
        id: item.id,
        name: item.name, // This was the missing property
        logo: item.logo,
        description: item.description,
        status: item.status,
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
      return data as GameCategory[];
    } catch (error: any) {
      console.error("Error fetching game categories:", error);
      toast.error("Failed to load game categories.");
      return [];
    }
  },

  async addGame(gameData: Omit<Game, "id" | "created_at" | "updated_at" | "views">): Promise<Game | null> {
    try {
      // Map Game type to Supabase 'games' table structure
      const dbGameData = {
        provider_id: gameData.provider_id,
        game_name: gameData.name, // or gameData.title
        game_code: gameData.game_code, // or gameData.slug
        cover: gameData.image,
        rtp: gameData.rtp,
        is_featured: gameData.is_featured,
        show_home: gameData.show_home,
        game_type: gameData.game_type,
        description: gameData.description,
        status: gameData.status,
        technology: gameData.technology,
        distribution: gameData.distribution,
        game_server_url: gameData.game_server_url,
        game_id: gameData.game_id, // Ensure this is mapped
        has_lobby: gameData.has_lobby,
        is_mobile: gameData.is_mobile,
        has_freespins: gameData.has_freespins,
        has_tables: gameData.has_tables,
        only_demo: gameData.only_demo,
        is_live: gameData.isLive,
      };
      const { data, error } = await supabase.from("games").insert(dbGameData).select().single();
      if (error) throw error;
      return data ? mapSupabaseGameToGame(data) : null;
    } catch (error: any) {
      console.error("Error adding game:", error);
      toast.error("Failed to add game.");
      return null;
    }
  },

  async updateGame(gameId: string, updates: Partial<Game>): Promise<Game | null> {
    try {
      // Map partial Game type to Supabase 'games' table structure for updates
      const dbUpdates: { [key: string]: any } = {};
      if (updates.provider_id !== undefined) dbUpdates.provider_id = updates.provider_id;
      if (updates.name !== undefined) dbUpdates.game_name = updates.name; // or title
      if (updates.game_code !== undefined) dbUpdates.game_code = updates.game_code; // or slug
      // ... map other fields similarly ...
      if (updates.image !== undefined) dbUpdates.cover = updates.image;
      if (updates.rtp !== undefined) dbUpdates.rtp = updates.rtp;
      if (updates.is_featured !== undefined) dbUpdates.is_featured = updates.is_featured;

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
      toast.error("Failed to update game.");
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
      const { error } = await supabase.rpc('increment_game_view', { game_id: gameId });
      if (error) throw error;
    } catch (error: any) {
      console.error(`Error incrementing view for game ${gameId}:`, error);
      // Don't toast here, it might be too noisy
    }
  },
  
  async getFavoriteGames(userId: string): Promise<Game[]> {
    try {
      const { data: favoriteEntries, error: favError } = await supabase
        .from('favorite_games')
        .select('game_id')
        .eq('user_id', userId);

      if (favError) throw favError;
      if (!favoriteEntries || favoriteEntries.length === 0) return [];

      const gameIds = favoriteEntries.map(fav => fav.game_id);
      
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .in('id', gameIds); // Assuming 'game_id' in favorite_games refers to 'id' in 'games'

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
      if (isCurrentlyFavorite) { // User wants to unfavorite
        const { error } = await supabase
          .from('favorite_games')
          .delete()
          .match({ user_id: userId, game_id: gameId });
        if (error) throw error;
        toast.success('Removed from favorites.');
      } else { // User wants to favorite
        const { error } = await supabase
          .from('favorite_games')
          .insert({ user_id: userId, game_id: gameId });
        if (error) throw error;
        toast.success('Added to favorites.');
      }
      return true;
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites.');
      return false;
    }
  },
};


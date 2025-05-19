import { supabase } from '@/integrations/supabase/client';
import { Game, GameProvider, GameCategory, GameLaunchOptions, DbGame } from '@/types';
import { toast } from 'sonner';

// Centralized mapper from DbGame to Game
const mapDbGameToGame = (dbGame: DbGame): Game => {
  // Basic mapping, can be expanded
  return {
    id: dbGame.id,
    slug: dbGame.slug || undefined,
    title: dbGame.title || 'Unknown Title',
    provider: dbGame.provider_slug || dbGame.provider_id?.toString() || 'unknown-provider', // provider slug
    category: Array.isArray(dbGame.category_slugs) ? (dbGame.category_slugs[0] || 'unknown-category') : (dbGame.category_slugs || 'unknown-category'), // primary category slug
    image: dbGame.cover || dbGame.image_url || '/placeholder.svg', // Prefer cover, then image_url
    description: dbGame.description || undefined,
    rtp: dbGame.rtp || undefined,
    volatility: dbGame.volatility || undefined,
    minBet: dbGame.min_bet || undefined,
    maxBet: dbGame.max_bet || undefined,
    lines: dbGame.lines || undefined,
    isNew: dbGame.is_new || false,
    isPopular: dbGame.is_popular || false,
    is_featured: dbGame.is_featured || false,
    show_home: dbGame.show_home || false,
    tags: dbGame.tags || [],
    // jackpot: dbGame.jackpot_amount ? true : undefined, // Example logic
    releaseDate: dbGame.release_date || undefined, // Keep as string, format in UI
    views: dbGame.views || 0,
    features: dbGame.features || [],
    themes: dbGame.themes || [],
    game_id: dbGame.game_id || undefined,
    name: dbGame.title || 'Unknown Game', // Use title for name
    providerName: dbGame.provider_name || undefined,
    categoryName: Array.isArray(dbGame.category_names) ? dbGame.category_names.join(', ') : dbGame.category_names || undefined,
    category_slugs: dbGame.category_slugs || [],
    created_at: dbGame.created_at,
    updated_at: dbGame.updated_at,
    provider_id: dbGame.provider_id || undefined,
    provider_slug: dbGame.provider_slug || undefined,
    cover: dbGame.cover || undefined,
    banner: dbGame.banner || undefined,
    image_url: dbGame.image_url || undefined,
    status: dbGame.status || 'inactive',
    game_code: dbGame.game_code || undefined,
    isFavorite: false, // Default, will be updated by favorite logic
  };
};


export const gameService = {
  getAllGames: async (): Promise<{ data: DbGame[], success: boolean, error?: string }> => {
    const { data, error } = await supabase.from('games').select('*');
    if (error) {
      console.error("Error fetching games:", error);
      return { data: [], success: false, error: error.message };
    }
    return { data: data as DbGame[], success: true };
  },

  getAllProviders: async (): Promise<{ data: GameProvider[], success: boolean, error?: string }> => {
    const { data, error } = await supabase.from('providers').select('*');
    if (error) {
      console.error("Error fetching providers:", error);
      return { data: [], success: false, error: error.message };
    }
    return { data: data as GameProvider[], success: true };
  },

  getAllCategories: async (): Promise<{ data: GameCategory[], success: boolean, error?: string }> => {
    const { data, error } = await supabase.from('game_categories').select('*');
    if (error) {
      console.error("Error fetching categories:", error);
      return { data: [], success: false, error: error.message };
    }
    return { data: data as GameCategory[], success: true };
  },

  getGameById: async (id: string): Promise<{ data: DbGame | null, success: boolean, error?: string }> => {
    const { data, error } = await supabase.from('games').select('*').eq('id', id).single();
    if (error) {
      // Don't toast error for 'not found', just log it.
      if (error.code !== 'PGRST116') { // PGRST116: Row not found
          console.error("Error fetching game by ID:", error);
          toast.error(`Error fetching game: ${error.message}`);
      } else {
          console.warn(`Game with ID ${id} not found.`);
      }
      return { data: null, success: false, error: error.message };
    }
    return { data: data as DbGame, success: true };
  },

  getGameBySlug: async (slug: string): Promise<{ data: DbGame | null, success: boolean, error?: string }> => {
    console.log(`gameService: fetching game by slug: ${slug}`);
    const { data, error } = await supabase.from('games').select('*').eq('slug', slug).maybeSingle(); // Use maybeSingle
    if (error) {
      // Don't toast error for 'not found', just log it.
       if (error.code !== 'PGRST116' && !error.message.includes("JSON object requested, multiple (or no) rows returned")) {
        console.error("Error fetching game by slug:", error);
        toast.error(`Error fetching game by slug: ${error.message}`);
      } else {
        console.warn(`Game with slug ${slug} not found or multiple entries (should be unique).`);
      }
      return { data: null, success: false, error: error.message };
    }
    if (!data) {
        console.warn(`Game with slug ${slug} not found.`);
        return { data: null, success: true }; // Success false if not found and that's an error condition for caller
    }
    console.log(`gameService: found game by slug: ${slug}`, data);
    return { data: data as DbGame, success: true };
  },
  
  // Admin functions
  addGame: async (gameData: Partial<DbGame>): Promise<DbGame | null> => {
    // Remove id if present, as it's auto-generated or should not be set by client on add
    const { id, ...insertData } = gameData;
    const { data, error } = await supabase.from('games').insert([insertData]).select().single();
    if (error) {
      console.error("Error adding game:", error);
      toast.error(error.message || "Failed to add game.");
      return null;
    }
    toast.success("Game added successfully!");
    return data as DbGame;
  },

  updateGame: async (gameId: string, gameData: Partial<DbGame>): Promise<DbGame | null> => {
    const { data, error } = await supabase.from('games').update(gameData).eq('id', gameId).select().single();
    if (error) {
      console.error("Error updating game:", error);
      toast.error(error.message || "Failed to update game.");
      return null;
    }
    toast.success("Game updated successfully!");
    return data as DbGame;
  },

  deleteGame: async (gameId: string): Promise<boolean> => {
    const { error } = await supabase.from('games').delete().eq('id', gameId);
    if (error) {
      console.error("Error deleting game:", error);
      toast.error(error.message || "Failed to delete game.");
      return false;
    }
    toast.success("Game deleted successfully!");
    return true;
  },

  // Mock implementation, replace with actual API call to game provider
  createSession: async (gameId: string, providerSlug: string, options: GameLaunchOptions): Promise<{ data: { launch_url: string } | null, success: boolean, error?: string }> => {
    console.log("Attempting to create game session (mock):", { gameId, providerSlug, options });
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Basic validation
    if (!gameId || !providerSlug) {
      const errorMsg = "Game ID or Provider Slug is missing.";
      toast.error(errorMsg);
      return { data: null, success: false, error: errorMsg };
    }

    // Mock launch URL construction
    // In a real scenario, this URL would come from the game aggregator or provider API
    const mockLaunchUrl = `https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=${gameId}&lang=en&cur=USD&lobbyURL=https://example.com/lobby&stylename= prata_production_desktop_casino_1_pragmatic_blue_ sfondo_promo_basic`;
    // const mockLaunchUrl = `https://example-provider.com/launch?game_id=${gameId}&mode=${options.mode}&token=mock_session_token_for_${gameId}`;
    
    // For testing errors:
    // if (gameId === "error_game") {
    //   return { data: null, success: false, error: "Mock error: This game is currently unavailable." };
    // }

    toast.info(`Game session created (mock). Launching ${gameId}...`);
    return { data: { launch_url: mockLaunchUrl }, success: true };
  },

  getFavoriteGames: async (userId: string): Promise<{ data: DbGame[], success: boolean, error?: string }> => {
    // Fetch favorite game_ids for the user
    const { data: favoriteLinks, error: favError } = await supabase
      .from('favorite_games')
      .select('game_id')
      .eq('user_id', userId);

    if (favError) {
      console.error("Error fetching favorite game links:", favError);
      return { data: [], success: false, error: favError.message };
    }

    if (!favoriteLinks || favoriteLinks.length === 0) {
      return { data: [], success: true }; // No favorites
    }

    const gameIds = favoriteLinks.map(fav => fav.game_id);

    // Fetch the actual game details for these IDs
    // Assuming game_id in favorite_games corresponds to 'id' or 'game_id' in 'games' table.
    // Adjust 'id' to 'game_id' if that's the foreign key reference.
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .in('id', gameIds); // Or .in('game_id', gameIds) if `game_id` from favorites links to `game_id` (external) in games table

    if (gamesError) {
      console.error("Error fetching favorite games details:", gamesError);
      return { data: [], success: false, error: gamesError.message };
    }
    return { data: games as DbGame[], success: true };
  },

  toggleFavoriteGame: async (userId: string, gameId: string, isAdding: boolean): Promise<{ success: boolean, error?: string }> => {
    if (isAdding) {
      // Add to favorites
      const { error } = await supabase
        .from('favorite_games')
        .insert([{ user_id: userId, game_id: gameId }]);
      if (error) {
        console.error("Error adding favorite:", error);
        return { success: false, error: error.message };
      }
    } else {
      // Remove from favorites
      const { error } = await supabase
        .from('favorite_games')
        .delete()
        .eq('user_id', userId)
        .eq('game_id', gameId);
      if (error) {
        console.error("Error removing favorite:", error);
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  },
  
  incrementGameView: async (gameId: string): Promise<void> => {
    try {
      // Assuming 'id' is the primary key of the 'games' table and gameId matches this.
      // And your RLS policies allow updates to the 'views' column or you're calling this from a secure context.
      // If 'games' table RLS is strict, this might need to be a .rpc() call to a PostgreSQL function.
      const { error } = await supabase.rpc('increment_game_view', { game_id_input: gameId })
      // Old direct update:
      // const { error } = await supabase
      //   .from('games')
      //   .update({ views: supabase.sql`(views + 1)` as any }) // Increment atomically if possible, or fetch and update
      //   .eq('id', gameId);

      if (error) {
        console.error('Error incrementing game view:', error);
        // Do not toast here, as it might be too noisy for a background task
      }
    } catch (e) {
      console.error('Exception incrementing game view:', e);
    }
  },
};

// Export mapDbGameToGame if it needs to be used outside this service, e.g., in hooks directly.
// However, it's often better to have services return the final UI-ready Game type.
export { mapDbGameToGame };

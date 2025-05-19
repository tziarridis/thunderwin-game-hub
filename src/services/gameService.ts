
import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame } from '@/types'; // Ensure both types are available
import { PostgrestSingleResponse } from '@supabase/supabase-js';

// Adapter function (if not already in a separate file)
const mapDbGameToGame = (dbGame: DbGame): Game => {
  return {
    id: String(dbGame.id), // Ensure id is string for Game type
    title: dbGame.title,
    provider_slug: dbGame.provider_slug,
    providerName: dbGame.provider_name, // from join or denormalized
    category_slugs: dbGame.category_slugs,
    categoryName: Array.isArray(dbGame.category_names) ? dbGame.category_names.join(', ') : undefined, // from join or denormalized
    image: dbGame.image_url,
    cover: dbGame.cover,
    banner: dbGame.banner,
    description: dbGame.description,
    rtp: dbGame.rtp,
    volatility: dbGame.volatility,
    minBet: dbGame.min_bet,
    maxBet: dbGame.max_bet,
    lines: dbGame.lines,
    features: dbGame.features || [],
    tags: dbGame.tags || [],
    themes: dbGame.themes || [], // Add themes if it exists on DbGame
    status: dbGame.status,
    slug: dbGame.slug,
    isNew: dbGame.is_new,
    isPopular: dbGame.is_popular,
    is_featured: dbGame.is_featured,
    show_home: dbGame.show_home,
    release_date: dbGame.release_date,
    game_id: dbGame.game_id,
    game_code: dbGame.game_code,
    // provider_id: dbGame.provider_id, // Not on Game type by default
  };
};


export const gameService = {
  // Fetch a single game by its slug or ID (assuming ID is string for Game type)
  async getGameById(id: string): Promise<Game> {
    // If your 'games' table uses UUIDs, you might fetch by slug if id is not a UUID
    // Or adjust this to fetch by slug directly if that's the primary identifier
    const { data, error } = await supabase
      .from('games') // Assuming your table is named 'games'
      .select(`
        *,
        provider:providers (name, slug),
        categories:game_categories (name, slug) 
      `) // Example join, adjust to your schema
      .eq('id', id) // Or 'slug', id
      .single();

    if (error) throw error;
    if (!data) throw new Error('Game not found');
    
    // Adapt DbGame to Game
    const dbGame = data as unknown as DbGame; // Cast needed if joins add nested objects
    // Manual mapping for providerName and categoryName if joins are complex
    // For simplicity, assuming direct fields or adapt mapDbGameToGame
    return mapDbGameToGame(dbGame); 
  },

  // Fetch all games, potentially with filtering/pagination
  async getAllGames(options?: { limit?: number; offset?: number; category?: string, provider?: string, search?:string }): Promise<Game[]> {
    let query = supabase
      .from('games')
      .select(`
        *,
        provider:providers (name, slug),
        categories:game_categories (name, slug)
      `);

    if (options?.category) {
      // This might need to query a join table or a column with category slugs array
      // query = query.contains('category_slugs', [options.category]); // If category_slugs is array
      query = query.eq('category_slugs', options.category); // If category_slugs is single string matching slug
    }
    if (options?.provider) {
       query = query.eq('provider_slug', options.provider);
    }
    if(options?.search) {
        query = query.ilike('title', `%${options.search}%`);
    }

    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) -1);
    
    const { data, error } = await query;

    if (error) throw error;
    return data ? data.map(g => mapDbGameToGame(g as unknown as DbGame)) : [];
  },
  
  // Example: Update a game (expects data for DbGame)
  async updateGame(id: string, gameData: Partial<DbGame>): Promise<PostgrestSingleResponse<DbGame>> {
    // Remove fields not directly on 'games' table or handle them appropriately
    // e.g., provider_name, category_names might be from joins and not updatable directly
    const { provider_name, category_names, ...restOfGameData } = gameData as any;


    const response = await supabase
      .from('games')
      .update(restOfGameData)
      .eq('id', id)
      .select()
      .single();
    
    return response as PostgrestSingleResponse<DbGame>;
  },

  // Add other methods like createGame, deleteGame as needed
};


import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame } from '@/types'; // Ensure DbGame is the type for database interaction
import { PostgrestSingleResponse } from '@supabase/supabase-js';

// Helper to map DbGame from Supabase to frontend Game type
const mapDbGameToGame = (dbGame: DbGame): Game => {
  // Ensure all fields from DbGame are correctly mapped to Game
  // And all fields in Game are present or have defaults
  return {
    id: String(dbGame.id), // Ensure id is string
    title: dbGame.title || dbGame.game_name || 'Unknown Title',
    providerName: dbGame.providers?.name || dbGame.provider_slug || 'Unknown Provider',
    image: dbGame.cover || '/placeholder.svg',
    categoryName: dbGame.game_type || 'Unknown Category',
    rtp: typeof dbGame.rtp === 'string' ? parseFloat(dbGame.rtp) : dbGame.rtp,
    isPopular: dbGame.is_popular || dbGame.show_home || false,
    isNew: dbGame.is_new || (dbGame.created_at ? new Date(dbGame.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 : false),
    slug: dbGame.slug || (dbGame.title || dbGame.game_name || '').toLowerCase().replace(/\s+/g, '-'),
    // Ensure all other Game properties are mapped
    provider: dbGame.providers?.name || dbGame.provider_slug,
    category: dbGame.game_type,
    minBet: dbGame.min_bet,
    maxBet: dbGame.max_bet,
    volatility: dbGame.volatility,
    features: dbGame.features || [],
    tags: dbGame.tags || [],
    game_id: dbGame.game_id,
    game_code: dbGame.game_code,
    provider_slug: dbGame.provider_slug,
    category_slugs: dbGame.category_slugs,
    status: dbGame.status,
    description: dbGame.description,
    banner: dbGame.banner,
    is_featured: dbGame.is_featured,
    show_home: dbGame.show_home,
    themes: dbGame.themes,
    lines: dbGame.lines,
    release_date: dbGame.release_date,
    // Explicitly undefined for fields not in DbGame or handled differently
    // Example: isFavorite is client-side logic
  };
};

// Helper to map frontend Game type (or partial) to DbGame for Supabase
const mapGameToDbGame = (gameData: Partial<Game>): Partial<DbGame> => {
  const dbGamePayload: Partial<DbGame> = {};
  
  if (gameData.id) dbGamePayload.id = String(gameData.id); // Ensure ID is string
  if (gameData.title) dbGamePayload.game_name = gameData.title; // Map title to game_name
  if (gameData.title) dbGamePayload.title = gameData.title; // Keep title if DbGame has it
  if (gameData.slug) dbGamePayload.slug = gameData.slug;
  if (gameData.provider_slug || gameData.provider) dbGamePayload.provider_slug = gameData.provider_slug || gameData.provider;
  
  // category_slugs should be string[] for DbGame based on types/index.d.ts
  if (Array.isArray(gameData.category_slugs)) {
    dbGamePayload.category_slugs = gameData.category_slugs;
  } else if (typeof gameData.category_slugs === 'string') {
    dbGamePayload.category_slugs = [gameData.category_slugs];
  }
  
  if (gameData.categoryName || gameData.category) dbGamePayload.game_type = gameData.categoryName || gameData.category;

  if (gameData.rtp !== undefined) dbGamePayload.rtp = Number(gameData.rtp);
  if (gameData.status) dbGamePayload.status = gameData.status as DbGame['status'];
  if (gameData.description) dbGamePayload.description = gameData.description;
  if (gameData.image) dbGamePayload.cover = gameData.image; // Map image to cover
  if (gameData.banner) dbGamePayload.banner = gameData.banner;
  if (gameData.isPopular !== undefined) dbGamePayload.is_popular = gameData.isPopular;
  if (gameData.isNew !== undefined) dbGamePayload.is_new = gameData.isNew;
  if (gameData.is_featured !== undefined) dbGamePayload.is_featured = gameData.is_featured; // Keep is_featured
  if (gameData.show_home !== undefined) dbGamePayload.show_home = gameData.show_home; // Keep show_home
  
  if (gameData.tags) dbGamePayload.tags = gameData.tags;
  if (gameData.features) dbGamePayload.features = gameData.features;
  if (gameData.themes) dbGamePayload.themes = gameData.themes;
  if (gameData.volatility) dbGamePayload.volatility = gameData.volatility;
  if (gameData.lines !== undefined) dbGamePayload.lines = Number(gameData.lines);
  if (gameData.minBet !== undefined) dbGamePayload.min_bet = Number(gameData.minBet);
  if (gameData.maxBet !== undefined) dbGamePayload.max_bet = Number(gameData.maxBet);
  if (gameData.release_date) dbGamePayload.release_date = gameData.release_date;
  
  // These must be strings for DbGame
  if (gameData.game_id) dbGamePayload.game_id = String(gameData.game_id);
  if (gameData.game_code) dbGamePayload.game_code = String(gameData.game_code);

  // Add any other necessary mappings
  // provider_id might need to be fetched based on provider_slug if not directly provided
  
  return dbGamePayload;
};


export const gameService = {
  async getAllGames(options: { limit?: number; offset?: number; category?: string; provider?: string; search?: string } = {}): Promise<Game[]> {
    let query = supabase.from('games').select('*, providers(name)'); // Fetch provider name

    if (options.category && options.category !== 'all') {
      query = query.eq('game_type', options.category);
    }
    if (options.provider) {
      // This assumes you have a way to filter by provider name,
      // possibly by joining or if 'providers.name' is a direct column/view feature.
      // If 'games' has 'provider_id', you might need to fetch provider_id first.
      query = query.eq('providers.name', options.provider);
    }
    if (options.search) {
      query = query.or(`game_name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + options.limit! - 1);
    }
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data ? data.map(mapDbGameToGame) : [];
  },

  async getGameById(id: string): Promise<Game | null> {
    const { data, error }: PostgrestSingleResponse<DbGame> = await supabase
      .from('games')
      .select('*, providers(name)')
      .eq('id', id)
      .maybeSingle(); // Use maybeSingle to handle null case gracefully

    if (error) throw error;
    return data ? mapDbGameToGame(data) : null;
  },

  async createGame(gameData: Partial<Game>): Promise<Game> {
    const dbPayload = mapGameToDbGame(gameData);
    
    // Ensure required fields for DB are present
    if (!dbPayload.game_name) throw new Error("Game name (title) is required.");
    if (!dbPayload.game_id) dbPayload.game_id = dbPayload.slug || dbPayload.game_name.toLowerCase().replace(/\s+/g, '-'); // Fallback game_id
    if (!dbPayload.game_code) dbPayload.game_code = dbPayload.game_id; // Fallback game_code
    if (dbPayload.rtp === undefined) dbPayload.rtp = 0; // Default RTP if not provided
    
    // Remove undefined fields to prevent Supabase errors for missing columns in partial updates
    Object.keys(dbPayload).forEach(key => (dbPayload as any)[key] === undefined && delete (dbPayload as any)[key]);


    const { data, error } = await supabase
      .from('games')
      .insert(dbPayload as DbGame) // Cast after removing undefined keys and ensuring required fields
      .select('*, providers(name)')
      .single();

    if (error) throw error;
    return mapDbGameToGame(data as DbGame);
  },

  async updateGame(id: string, gameData: Partial<Game>): Promise<Game> {
    const dbPayload = mapGameToDbGame(gameData);
    // Remove undefined fields to prevent Supabase errors for missing columns in partial updates
    Object.keys(dbPayload).forEach(key => (dbPayload as any)[key] === undefined && delete (dbPayload as any)[key]);

    const { data, error } = await supabase
      .from('games')
      .update(dbPayload)
      .eq('id', id)
      .select('*, providers(name)')
      .single();

    if (error) throw error;
    return mapDbGameToGame(data as DbGame);
  },

  async deleteGame(id: string): Promise<void> {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

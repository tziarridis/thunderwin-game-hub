
import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame } from '@/types'; // Game is from game.ts, DbGame from types/index.d.ts
import { PostgrestSingleResponse } from '@supabase/supabase-js';

// Helper to map DbGame from Supabase to frontend Game type
const mapDbGameToGame = (dbGame: DbGame): Game => {
  return {
    id: String(dbGame.id),
    title: dbGame.game_name || dbGame.title || 'Unknown Title', // Prioritize game_name
    slug: dbGame.slug || (dbGame.game_name || dbGame.title || '').toLowerCase().replace(/\s+/g, '-'),
    
    providerName: dbGame.providers?.name || dbGame.provider_slug,
    provider_slug: dbGame.provider_slug || dbGame.providers?.slug,
    
    categoryName: dbGame.game_type,
    category_slugs: Array.isArray(dbGame.category_slugs) ? dbGame.category_slugs : (dbGame.category_slugs ? [dbGame.category_slugs] : []),

    image: dbGame.cover || dbGame.image_url || '/placeholder.svg',
    banner: dbGame.banner,
    
    description: dbGame.description,
    rtp: typeof dbGame.rtp === 'string' ? parseFloat(dbGame.rtp) : dbGame.rtp,
    
    isPopular: dbGame.is_popular ?? dbGame.show_home ?? false,
    isNew: dbGame.is_new ?? (dbGame.created_at ? new Date(dbGame.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 : false),
    is_featured: dbGame.is_featured ?? false,
    show_home: dbGame.show_home ?? false,
    
    volatility: dbGame.volatility,
    lines: dbGame.lines,
    minBet: dbGame.min_bet,
    maxBet: dbGame.max_bet,
    
    features: dbGame.features || [],
    tags: dbGame.tags || [],
    themes: dbGame.themes || [],
    
    releaseDate: dbGame.release_date,
    
    game_id: dbGame.game_id,
    game_code: dbGame.game_code,
    
    status: dbGame.status,
    
    // Fallback compatibility fields
    provider: dbGame.providers?.name || dbGame.provider_slug,
    category: dbGame.game_type,
    cover: dbGame.cover, // Keep for direct access if needed
    image_url: dbGame.image_url, // Keep for direct access

    // Fields from DbGame that might be useful on Game type
    technology: dbGame.technology,
    has_lobby: dbGame.has_lobby,
    is_mobile: dbGame.is_mobile,
    has_freespins: dbGame.has_freespins,
    has_tables: dbGame.has_tables,
    only_demo: dbGame.only_demo,
    distribution: dbGame.distribution,
    views: dbGame.views,
    created_at: dbGame.created_at,
    updated_at: dbGame.updated_at,
    provider_id: dbGame.provider_id,
    game_server_url: dbGame.game_server_url,
  };
};

// Helper to map frontend Game type (or partial) to DbGame for Supabase
const mapGameToDbGame = (gameData: Partial<Game>): Partial<DbGame> => {
  const dbGamePayload: Partial<DbGame> = {};
  
  // Ensure ID is string if provided, but typically not set on create/update directly for Supabase
  // if (gameData.id) dbGamePayload.id = String(gameData.id); 
  
  if (gameData.title) dbGamePayload.game_name = gameData.title;
  if (gameData.slug) dbGamePayload.slug = gameData.slug;
  
  // provider_slug is the source of truth for relation or denormalized storage
  if (gameData.provider_slug) dbGamePayload.provider_slug = gameData.provider_slug;
  // provider_id might be set if known, e.g. from a dropdown of providers
  if (gameData.provider_id) dbGamePayload.provider_id = gameData.provider_id;


  if (gameData.categoryName) dbGamePayload.game_type = gameData.categoryName;
  if (Array.isArray(gameData.category_slugs)) {
    dbGamePayload.category_slugs = gameData.category_slugs;
  } else if (typeof gameData.category_slugs === 'string' && gameData.category_slugs.length > 0) {
    dbGamePayload.category_slugs = gameData.category_slugs.split(',').map(s => s.trim()).filter(s => s);
  }


  if (gameData.image) dbGamePayload.cover = gameData.image;
  else if (gameData.cover) dbGamePayload.cover = gameData.cover;
  else if (gameData.image_url) dbGamePayload.cover = gameData.image_url;

  if (gameData.banner) dbGamePayload.banner = gameData.banner;
  
  if (gameData.description) dbGamePayload.description = gameData.description;
  if (gameData.rtp !== undefined) dbGamePayload.rtp = Number(gameData.rtp);
  
  if (gameData.isPopular !== undefined) dbGamePayload.is_popular = gameData.isPopular;
  if (gameData.isNew !== undefined) dbGamePayload.is_new = gameData.isNew;
  if (gameData.is_featured !== undefined) dbGamePayload.is_featured = gameData.is_featured;
  if (gameData.show_home !== undefined) dbGamePayload.show_home = gameData.show_home;
  
  if (gameData.volatility) dbGamePayload.volatility = gameData.volatility;
  if (gameData.lines !== undefined) dbGamePayload.lines = Number(gameData.lines);
  if (gameData.minBet !== undefined) dbGamePayload.min_bet = Number(gameData.minBet);
  if (gameData.maxBet !== undefined) dbGamePayload.max_bet = Number(gameData.maxBet);
  
  if (gameData.features) dbGamePayload.features = gameData.features;
  if (gameData.tags) dbGamePayload.tags = gameData.tags;
  if (gameData.themes) dbGamePayload.themes = gameData.themes;
  
  if (gameData.releaseDate) dbGamePayload.release_date = gameData.releaseDate;
  
  if (gameData.game_id) dbGamePayload.game_id = String(gameData.game_id);
  if (gameData.game_code) dbGamePayload.game_code = String(gameData.game_code);
  
  if (gameData.status) dbGamePayload.status = gameData.status;

  if (gameData.technology) dbGamePayload.technology = gameData.technology;
  if (gameData.distribution) dbGamePayload.distribution = gameData.distribution;
  if (gameData.game_server_url) dbGamePayload.game_server_url = gameData.game_server_url;
  if (gameData.has_lobby !== undefined) dbGamePayload.has_lobby = gameData.has_lobby;
  if (gameData.is_mobile !== undefined) dbGamePayload.is_mobile = gameData.is_mobile;
  if (gameData.has_freespins !== undefined) dbGamePayload.has_freespins = gameData.has_freespins;
  if (gameData.has_tables !== undefined) dbGamePayload.has_tables = gameData.has_tables;
  if (gameData.only_demo !== undefined) dbGamePayload.only_demo = gameData.only_demo;

  // For forms that might use 'title' directly on DbGame model before mapping
  if (gameData.title) dbGamePayload.title = gameData.title; 

  // Remove undefined fields to prevent Supabase errors
  Object.keys(dbGamePayload).forEach(key => (dbGamePayload as any)[key] === undefined && delete (dbGamePayload as any)[key]);
  
  return dbGamePayload;
};


export const gameService = {
  async getAllGames(options: { 
    limit?: number; 
    offset?: number; 
    category?: string; // category slug
    provider?: string; // provider slug
    search?: string;
    featured?: boolean;
    popular?: boolean;
    latest?: boolean; // to sort by created_at desc
  } = {}): Promise<{ games: Game[]; count: number | null }> {
    let query = supabase
      .from('games')
      .select('*, providers!left(name, slug)', { count: 'exact' }); // Ensure provider slug is selected if available

    if (options.category && options.category !== 'all') {
      query = query.eq('game_type', options.category); // Assuming game_type is the category slug
    }
    if (options.provider) {
      // If providers table has a 'slug' column and it's joined correctly
      query = query.eq('providers.slug', options.provider);
      // Or if games table has provider_slug directly:
      // query = query.eq('provider_slug', options.provider);
    }
    if (options.search) {
      query = query.or(`game_name.ilike.%${options.search}%,description.ilike.%${options.search}%,tags.cs.{${options.search}}`);
    }
    if (options.featured) {
      query = query.eq('is_featured', true);
    }
    if (options.popular) {
      // Assuming show_home or is_popular indicates popular
      query = query.or('is_popular.eq.true,show_home.eq.true');
    }
    
    if (options.latest) {
      query = query.order('created_at', { ascending: false });
    } else {
      // Default sort or other sort criteria
      query = query.order('game_name', { ascending: true });
    }

    const offset = options.offset || 0;
    const limit = options.limit || 12; // Default limit
    query = query.range(offset, offset + limit - 1);
    

    const { data, error, count } = await query;
    if (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
    return {
        games: data ? data.map(item => mapDbGameToGame(item as DbGame)) : [],
        count: count
    };
  },

  async getGameById(id: string): Promise<Game | null> {
    // Check if id is likely a slug or UUID
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
    
    let query = supabase
      .from('games')
      .select('*, providers!left(name, slug)');

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      // Assume it's a slug if not a UUID
      query = query.eq('slug', id);
    }
    
    const { data, error }: PostgrestSingleResponse<DbGame> = await query.maybeSingle();

    if (error) {
      console.error(`Error fetching game by ${isUUID ? 'ID' : 'slug'} ${id}:`, error);
      throw error;
    }
    return data ? mapDbGameToGame(data) : null;
  },
  
  async getGameBySlug(slug: string): Promise<Game | null> {
    const { data, error }: PostgrestSingleResponse<DbGame> = await supabase
      .from('games')
      .select('*, providers!left(name, slug)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching game by slug ${slug}:`, error);
      throw error;
    }
    return data ? mapDbGameToGame(data) : null;
  },

  async createGame(gameData: Partial<Game>): Promise<Game> {
    const dbPayload = mapGameToDbGame(gameData);
    
    if (!dbPayload.game_name && !dbPayload.title) throw new Error("Game name (title) is required.");
    if (!dbPayload.slug && dbPayload.game_name) dbPayload.slug = dbPayload.game_name.toLowerCase().replace(/\s+/g, '-');
    if (!dbPayload.game_id && dbPayload.slug) dbPayload.game_id = dbPayload.slug;
    if (!dbPayload.game_code && dbPayload.game_id) dbPayload.game_code = dbPayload.game_id;
    
    // Ensure required fields or provide defaults
    dbPayload.rtp = dbPayload.rtp ?? 0;
    dbPayload.status = dbPayload.status ?? 'draft';

    const { data, error } = await supabase
      .from('games')
      .insert(dbPayload as DbGame) 
      .select('*, providers!left(name, slug)')
      .single();

    if (error) {
        console.error('Error creating game:', error, 'Payload:', dbPayload);
        throw error;
    }
    return mapDbGameToGame(data as DbGame);
  },

  async updateGame(id: string, gameData: Partial<Game>): Promise<Game> {
    const dbPayload = mapGameToDbGame(gameData);
    // id should not be in the payload for an update operation
    if ('id' in dbPayload) delete (dbPayload as any).id;


    const { data, error } = await supabase
      .from('games')
      .update(dbPayload)
      .eq('id', id)
      .select('*, providers!left(name, slug)')
      .single();

    if (error) {
        console.error('Error updating game:', error, 'Payload:', dbPayload);
        throw error;
    }
    return mapDbGameToGame(data as DbGame);
  },

  async deleteGame(id: string): Promise<void> {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);

    if (error) {
        console.error('Error deleting game:', error);
        throw error;
    }
  }
};


import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame, GameProvider, GameCategory } from '@/types'; // Ensure correct types are imported
import { PostgrestResponse } from '@supabase/supabase-js';

// Function to map DbGame to Game (frontend model)
const mapDbGameToGame = (dbGame: DbGame & { providers?: { name: string; slug: string; }; game_categories?: { name: string; slug: string; }[] }): Game => {
  
  let categorySlugs: string[] = [];
  if (Array.isArray(dbGame.category_slugs)) {
    categorySlugs = dbGame.category_slugs;
  } else if (typeof dbGame.category_slugs === 'string') {
    categorySlugs = dbGame.category_slugs.split(',').map(s => s.trim());
  }

  let features: string[] = [];
  if (Array.isArray(dbGame.features)) {
    features = dbGame.features;
  } else if (typeof dbGame.features === 'string') {
    // Assuming features might also be a comma-separated string in some cases
     try {
      features = JSON.parse(dbGame.features as any); // If it's a JSON string array
    } catch (e) {
      features = (dbGame.features as unknown as string).split(',').map(s => s.trim()); // Fallback
    }
  }

  return {
    id: String(dbGame.id), // Ensure id is string
    title: dbGame.game_name,
    slug: dbGame.slug,
    
    providerName: dbGame.providers?.name || dbGame.provider_slug, // Use joined provider name
    provider_slug: dbGame.providers?.slug || dbGame.provider_slug, // Use joined provider slug
    
    // Use game_type for categoryName, and ensure category_slugs is an array
    categoryName: dbGame.game_type, 
    category_slugs: categorySlugs,

    image: dbGame.cover || dbGame.image_url, // Use cover, fallback to image_url
    banner: dbGame.banner,
    
    description: dbGame.description,
    rtp: typeof dbGame.rtp === 'string' ? parseFloat(dbGame.rtp) : dbGame.rtp,
    
    isPopular: dbGame.is_popular || dbGame.show_home,
    isNew: dbGame.is_new, // How is_new derived? from release_date or a flag?
    is_featured: dbGame.is_featured,
    show_home: dbGame.show_home,
    
    volatility: dbGame.volatility,
    lines: dbGame.lines,
    minBet: dbGame.min_bet,
    maxBet: dbGame.max_bet,
    
    features: features,
    tags: Array.isArray(dbGame.tags) ? dbGame.tags : (typeof dbGame.tags === 'string' ? dbGame.tags.split(',').map(s => s.trim()) : []),
    themes: Array.isArray(dbGame.themes) ? dbGame.themes : (typeof dbGame.themes === 'string' ? dbGame.themes.split(',').map(s => s.trim()) : []),
    
    releaseDate: dbGame.release_date,
    
    game_id: dbGame.game_id, // External game ID
    game_code: dbGame.game_code, // External game code
    
    status: dbGame.status,
    
    // Fallbacks for compatibility
    provider: dbGame.providers?.name || dbGame.provider_slug,
    category: dbGame.game_type,
    cover: dbGame.cover || dbGame.image_url,
    image_url: dbGame.cover || dbGame.image_url,

    // Client-side state (not from DB directly here)
    isFavorite: false, // This would be set based on user's favorites list

    // Less common frontend fields
    technology: dbGame.technology,
    has_lobby: dbGame.has_lobby,
    is_mobile: dbGame.is_mobile,
    has_freespins: dbGame.has_freespins,
    has_tables: dbGame.has_tables,
    only_demo: dbGame.only_demo,
    provider_id: dbGame.provider_id, // Keep for reference if needed elsewhere
  };
};


export const gameService = {
  // Fetch all games with optional filtering, pagination
  async getAllGames(
    options: {
      limit?: number;
      offset?: number;
      category?: string; // category slug
      provider?: string; // provider slug
      search?: string;
      featured?: boolean;
      popular?: boolean;
      latest?: boolean; // Sort by created_at desc
      tag?: string; // filter by tag
    } = {}
  ): Promise<{ games: Game[]; count: number | null }> {
    const { limit = 20, offset = 0, category, provider, search, featured, popular, latest, tag } = options;
    
    let query = supabase
      .from('games')
      .select('*, providers(name, slug)', { count: 'exact' }) 

    if (provider) {
      query = query.eq('providers.slug', provider);
    }

    if (category) {
      // If game_type is a simple string column for category slug
      query = query.eq('game_type', category);
    }
    
    if (search) {
      query = query.ilike('game_name', `%${search}%`);
    }
    if (featured) {
      query = query.is('is_featured', true);
    }
    if (popular) {
      query = query.is('is_popular', true); 
    }
    if (tag) {
        query = query.contains('tags', [tag]);
    }

    if (latest) {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('game_name', { ascending: true }); // Default sort
    }

    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count }: PostgrestResponse<DbGame & { providers: { name: string; slug: string; } }> = await query;

    if (error) {
      console.error('Error fetching games:', error);
      throw error;
    }

    const games = data ? data.map(dbGame => mapDbGameToGame(dbGame)) : [];
    return { games, count };
  },

  // Fetch a single game by its ID (UUID)
  async getGameById(id: string): Promise<Game | null> {
    const { data, error } = await supabase
      .from('games')
      .select('*, providers(name, slug)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching game by id ${id}:`, error);
      throw error;
    }
    return data ? mapDbGameToGame(data) : null;
  },

  // Fetch a single game by its slug
  async getGameBySlug(slug: string): Promise<Game | null> {
    const { data, error } = await supabase
      .from('games')
      .select('*, providers(name, slug)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching game by slug ${slug}:`, error);
      throw error;
    }
    return data ? mapDbGameToGame(data) : null;
  },
  
  // Fetch game providers
  async getGameProviders(): Promise<GameProvider[]> {
    const { data, error } = await supabase
      .from('providers') 
      .select('id, name, slug, logo_url, status') 
      .eq('status', 'active'); 

    if (error) {
      console.error('Error fetching game providers:', error);
      throw error;
    }
    return data ? data.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'), 
        logoUrl: p.logo_url || undefined, 
        status: p.status as GameProvider['status']
    })) : [];
  },

  // Fetch game categories
  async getGameCategories(): Promise<GameCategory[]> {
    const { data, error } = await supabase
      .from('game_categories') 
      .select('id, name, slug, icon, image, order') 
      .eq('status', 'active') 
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching game categories:', error);
      throw error;
    }
    return data ? data.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon || undefined,
        image: c.image || undefined,
        order: c.order || 0,
    })) : [];
  },
  
  // Add createGame and updateGame methods
  async createGame(gameData: Partial<DbGame>): Promise<Game | null> {
    const { data, error } = await supabase
      .from('games')
      .insert(gameData)
      .select('*, providers(name, slug)')
      .maybeSingle();

    if (error) {
      console.error('Error creating game:', error);
      throw error;
    }
    
    return data ? mapDbGameToGame(data) : null;
  },
  
  async updateGame(id: string, gameData: Partial<DbGame>): Promise<Game | null> {
    const { data, error } = await supabase
      .from('games')
      .update(gameData)
      .eq('id', id)
      .select('*, providers(name, slug)')
      .maybeSingle();
      
    if (error) {
      console.error('Error updating game:', error);
      throw error;
    }
    
    return data ? mapDbGameToGame(data) : null;
  }
};

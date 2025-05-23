
import { Game, DbGame, GameStatus, GameVolatility, GameTag, GameStatusEnum } from '@/types/game';

// Maps a DbGame (from Supabase 'games' table) to a Game (for frontend UI)
export const mapDbGameToGameAdapter = (dbGame: any): Game => {
  // Helper to safely cast string to GameStatusEnum
  const parseGameStatus = (statusStr: string | null | undefined): GameStatusEnum => {
    const validStatuses = Object.values(GameStatusEnum);
    if (statusStr && validStatuses.includes(statusStr as GameStatusEnum)) {
      return statusStr as GameStatusEnum;
    }
    return GameStatusEnum.INACTIVE; 
  };

  const parseGameVolatility = (volStr: string | null | undefined): GameVolatility | undefined => {
    const validVolatilities: GameVolatility[] = ['low', 'medium', 'high', 'low-medium', 'medium-high'];
     if (volStr && validVolatilities.includes(volStr as GameVolatility)) {
      return volStr as GameVolatility;
    }
    return undefined;
  };
  
  // Handle the providers field that comes from Supabase join
  let providerData = null;
  
  if (dbGame.providers) {
    if (typeof dbGame.providers === 'object' && dbGame.providers !== null) {
      providerData = {
        id: String(dbGame.providers.id || ''),
        name: dbGame.providers.name || '',
        slug: dbGame.providers.slug || dbGame.provider_slug || ''
      };
    }
  }

  return {
    id: String(dbGame.id), 
    game_id: dbGame.game_id, 
    title: dbGame.game_name || dbGame.title || 'N/A', 
    slug: dbGame.slug || String(dbGame.id), 
    
    providerName: providerData?.name || dbGame.provider_slug || dbGame.distribution || 'N/A',
    provider_slug: providerData?.slug || dbGame.provider_slug || dbGame.distribution || 'unknown-provider', 
    provider: providerData ? { ...providerData, slug: providerData.slug || dbGame.provider_slug || '' } : 
              (dbGame.provider_slug ? { name: dbGame.provider_slug, slug: dbGame.provider_slug } : undefined),

    categoryName: dbGame.game_type || undefined, 
    category: dbGame.game_type || undefined,
    category_slugs: Array.isArray(dbGame.category_slugs) 
      ? dbGame.category_slugs 
      : (typeof dbGame.category_slugs === 'string' ? [dbGame.category_slugs] : []),
    
    image: dbGame.cover || dbGame.image_url || undefined, 
    image_url: dbGame.cover || dbGame.image_url || undefined,
    cover: dbGame.cover || undefined,
    bannerUrl: dbGame.banner_url || dbGame.banner || dbGame.cover || undefined, 
    
    description: dbGame.description || undefined,
    rtp: typeof dbGame.rtp === 'string' ? parseFloat(dbGame.rtp) : (typeof dbGame.rtp === 'number' ? dbGame.rtp : undefined),
    
    volatility: parseGameVolatility(dbGame.volatility),
    
    isPopular: dbGame.is_popular ?? dbGame.is_featured ?? false,
    isNew: dbGame.is_new ?? false, 
    is_new: dbGame.is_new ?? false,
    is_featured: dbGame.is_featured ?? false,
    show_home: dbGame.show_home ?? false, 

    lines: dbGame.lines ?? undefined, 
    min_bet: dbGame.min_bet ?? undefined, 
    max_bet: dbGame.max_bet ?? undefined, 
    
    features: Array.isArray(dbGame.features) ? dbGame.features : [],
    tags: Array.isArray(dbGame.tags) ? dbGame.tags.map((tag: any) => typeof tag === 'string' ? tag : String(tag)) : [], 
    themes: Array.isArray(dbGame.themes) ? dbGame.themes : [],
    
    releaseDate: dbGame.release_date || dbGame.created_at || undefined, 
    
    game_code: dbGame.game_code || undefined, 
    
    status: parseGameStatus(dbGame.status),
    only_demo: dbGame.only_demo ?? false,
    only_real: dbGame.only_real ?? false,
    provider_id: String(dbGame.provider_id || ''),
    created_at: dbGame.created_at || new Date().toISOString(),
    updated_at: dbGame.updated_at || new Date().toISOString(),
    demo_url: dbGame.demo_url || undefined,
    external_url: dbGame.external_url || undefined,
    is_mobile_compatible: dbGame.is_mobile || dbGame.mobile_supported ?? true,
    has_lobby: dbGame.has_lobby ?? false,
    is_mobile: dbGame.is_mobile ?? true,
    has_freespins: dbGame.has_freespins ?? false,
    has_tables: dbGame.has_tables ?? false,
    views: dbGame.views ?? 0,
  };
};

// Maps a Game (from frontend/form) to a DbGame (for Supabase 'games' table)
export const mapGameToDbGameAdapter = (game: Partial<Game>): Partial<DbGame> => {
  const dbGame: Partial<DbGame> = {};

  if (game.id) dbGame.id = String(game.id); 
  
  if (game.title) dbGame.game_name = game.title;
  if (game.slug) dbGame.slug = game.slug;

  if (game.provider_slug) dbGame.provider_slug = game.provider_slug; 
  if (game.provider_id) dbGame.provider_id = String(game.provider_id); 

  
  if (game.categoryName) dbGame.game_type = game.categoryName;
  if (game.category_slugs) dbGame.category_slugs = game.category_slugs; 
  
  if (game.image) dbGame.cover = game.image; 
  if (game.image_url && !dbGame.cover) dbGame.image_url = game.image_url; 
  if (game.bannerUrl) dbGame.banner_url = game.bannerUrl;


  if (game.description) dbGame.description = game.description;
  if (game.rtp !== undefined && game.rtp !== null) dbGame.rtp = Number(game.rtp);

  if (game.volatility) {
    const validVolatilities: GameVolatility[] = ['low', 'medium', 'high', 'low-medium', 'medium-high'];
    if (validVolatilities.includes(game.volatility)) {
      dbGame.volatility = game.volatility;
    } else {
      console.warn(`Invalid volatility value: ${game.volatility}`);
    }
  }


  if (game.isPopular !== undefined) dbGame.is_popular = game.isPopular;
  if (game.isNew !== undefined) dbGame.is_new = game.isNew;
  if (game.is_featured !== undefined) dbGame.is_featured = game.is_featured;
  if (game.show_home !== undefined) dbGame.show_home = game.show_home;

  if (game.lines !== undefined && game.lines !== null) dbGame.lines = Number(game.lines);
  if (game.min_bet !== undefined && game.min_bet !== null) dbGame.min_bet = Number(game.min_bet);
  if (game.max_bet !== undefined && game.max_bet !== null) dbGame.max_bet = Number(game.max_bet);

  if (game.features) dbGame.features = game.features;
  
  // Convert Game.tags to DbGame.tags
  if (game.tags) {
    if (Array.isArray(game.tags)) {
      dbGame.tags = game.tags.map(tag => String(tag));
    }
  }
  
  if (game.themes) dbGame.themes = game.themes;
  
  if (game.releaseDate) dbGame.release_date = game.releaseDate; 
  
  if (game.game_id) dbGame.game_id = String(game.game_id);
  if (game.game_code) dbGame.game_code = String(game.game_code);
  
  if (game.status) {
    // Convert GameStatusEnum to string for database
    dbGame.status = game.status;
  }

  if (game.only_demo !== undefined) dbGame.only_demo = game.only_demo;
  if (game.only_real !== undefined) dbGame.only_real = game.only_real;
  
  // Set distribution if not already set
  if (!dbGame.distribution && game.provider) {
    dbGame.distribution = game.provider.slug || 'internal';
  }

  Object.keys(dbGame).forEach(key => {
    const dbGameKey = key as keyof DbGame;
    if (dbGame[dbGameKey] === undefined) {
      delete dbGame[dbGameKey];
    }
  });
  
  return dbGame;
};

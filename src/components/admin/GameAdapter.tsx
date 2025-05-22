
import { Game, DbGame, GameStatusEnum, GameVolatilityEnum, GameStatus, GameVolatility, GameTag, GameProvider } from '@/types/game';

// Maps a DbGame (from Supabase 'games' table) to a Game (for frontend UI)
export const mapDbGameToGameAdapter = (dbGame: DbGame): Game => {

  const parseGameStatus = (statusStr: string | null | undefined): GameStatus => {
    if (statusStr && Object.values(GameStatusEnum).includes(statusStr as GameStatusEnum)) {
      return statusStr as GameStatus;
    }
    return GameStatusEnum.INACTIVE; // Default status
  };

  const parseGameVolatility = (volStr: string | null | undefined): GameVolatility | undefined => {
    if (volStr && Object.values(GameVolatilityEnum).includes(volStr as GameVolatilityEnum)) {
      return volStr as GameVolatility;
    }
    return undefined;
  };
  
  // Example: If providers data is joined and available as dbGame.provider_meta (object)
  // For now, we assume provider_slug is the primary way to identify provider from DbGame.
  // Provider name would ideally come from a joined 'providers' table or fetched separately.
  const providerSlug = dbGame.provider_slug || dbGame.distribution || 'unknown-provider';
  let providerName = providerSlug; // Default to slug if name not available
  // If you pass a list of providers to the adapter, you could find the name:
  // providerName = providersList.find(p => p.slug === providerSlug)?.name || providerSlug;


  return {
    id: String(dbGame.id), 
    game_id: dbGame.game_id || String(dbGame.id), 
    title: dbGame.title || dbGame.game_name || 'N/A', 
    slug: dbGame.slug || String(dbGame.id), 
    
    provider_slug: providerSlug,
    providerName: providerName, // This would be more robust if resolved via a providers list or join
    provider_id: dbGame.provider_id || undefined,

    // categoryName: dbGame.game_type || undefined, // If 'game_type' is a single category name
    category_slugs: Array.isArray(dbGame.category_slugs) 
      ? dbGame.category_slugs 
      : (typeof dbGame.category_slugs === 'string' ? [dbGame.category_slugs] : []),
    // categoryNames would be resolved similarly to providerName

    image: dbGame.cover || dbGame.image_url || undefined, 
    image_url: dbGame.image_url || undefined, // Use existing image_url
    cover: dbGame.cover || dbGame.image_url || undefined,
    bannerUrl: dbGame.banner_url || dbGame.cover || undefined, 
    
    description: dbGame.description || undefined,
    rtp: typeof dbGame.rtp === 'number' ? dbGame.rtp : undefined,
    
    volatility: parseGameVolatility(dbGame.volatility),
    
    is_popular: dbGame.is_popular ?? dbGame.is_featured ?? false,
    is_new: dbGame.is_new ?? false, 
    is_featured: dbGame.is_featured ?? false,
    show_home: dbGame.show_home ?? false, 

    lines: dbGame.lines ?? undefined, 
    min_bet: dbGame.min_bet ?? undefined, 
    max_bet: dbGame.max_bet ?? undefined, 
    
    features: Array.isArray(dbGame.features) ? dbGame.features : [],
    tags: Array.isArray(dbGame.tags) ? dbGame.tags.map(tag => typeof tag === 'string' ? tag : tag) : [], // Assuming tags in DbGame are strings for now
    themes: Array.isArray(dbGame.themes) ? dbGame.themes : [],
    
    releaseDate: dbGame.release_date || dbGame.created_at || undefined, 
    
    game_code: dbGame.game_code || undefined, 
    
    status: parseGameStatus(dbGame.status),
    only_demo: dbGame.only_demo ?? false,
    only_real: dbGame.only_real ?? false,
    has_freespins: dbGame.has_freespins ?? false,
    mobile_friendly: dbGame.is_mobile ?? true, // Map from DbGame.is_mobile
  };
};

// Maps a Game (from frontend/form) to a DbGame (for Supabase 'games' table)
export const mapGameToDbGameAdapter = (game: Partial<Game>): Partial<DbGame> => {
  const dbGame: Partial<DbGame> = {};

  if (game.id) dbGame.id = String(game.id); 
  
  if (game.title) {
    dbGame.title = game.title;
    dbGame.game_name = game.title; // Keep game_name consistent if used
  }
  if (game.slug) dbGame.slug = game.slug;
  if (game.game_id) dbGame.game_id = String(game.game_id);
  if (game.game_code) dbGame.game_code = String(game.game_code);

  if (game.provider_slug) {
    dbGame.provider_slug = game.provider_slug;
    dbGame.distribution = game.provider_slug; // Ensure distribution is also set if it's the same
  }
  if (game.provider_id) dbGame.provider_id = String(game.provider_id); 

  if (game.category_slugs) dbGame.category_slugs = game.category_slugs; 
  if (game.categoryName && !dbGame.category_slugs?.length) { // If primary categoryName is provided
    dbGame.game_type = game.categoryName; // Map to game_type if it exists in your DbGame schema
  }
  
  if (game.image) dbGame.image_url = game.image; 
  if (game.image_url) dbGame.image_url = game.image_url; // Use image_url if available 
  if (game.cover && !dbGame.image_url) dbGame.image_url = game.cover; // Prioritize image, then cover
  if (game.cover) dbGame.cover = game.cover; // Explicit cover
  if (game.bannerUrl) dbGame.banner_url = game.bannerUrl;

  if (game.description) dbGame.description = game.description;
  if (game.rtp !== undefined && game.rtp !== null) dbGame.rtp = Number(game.rtp);

  if (game.volatility) {
    if (Object.values(GameVolatilityEnum).includes(game.volatility as GameVolatilityEnum)) {
      dbGame.volatility = game.volatility;
    } else {
      console.warn(`Invalid volatility value: ${game.volatility}`);
    }
  }

  if (game.is_popular !== undefined) dbGame.is_popular = game.is_popular;
  if (game.is_new !== undefined) dbGame.is_new = game.is_new;
  if (game.is_featured !== undefined) dbGame.is_featured = game.is_featured;
  if (game.show_home !== undefined) dbGame.show_home = game.show_home;

  if (game.lines !== undefined && game.lines !== null) dbGame.lines = Number(game.lines);
  if (game.min_bet !== undefined && game.min_bet !== null) dbGame.min_bet = Number(game.min_bet);
  if (game.max_bet !== undefined && game.max_bet !== null) dbGame.max_bet = Number(game.max_bet);

  if (game.features) dbGame.features = game.features;
  if (game.tags) {
    // Ensure tags are string[] for DbGame
    dbGame.tags = game.tags.map(tag => (typeof tag === 'string' ? tag : (tag as GameTag).name || String(tag)));
  }
  if (game.themes) dbGame.themes = game.themes;
  
  if (game.releaseDate) dbGame.release_date = game.releaseDate; 
  
  if (game.status) {
    if (Object.values(GameStatusEnum).includes(game.status as GameStatusEnum)) {
      dbGame.status = game.status;
    } else {
      console.warn(`Invalid status value: ${game.status}`);
      dbGame.status = GameStatusEnum.INACTIVE; // Default to inactive on invalid input
    }
  }

  if (game.only_demo !== undefined) dbGame.only_demo = game.only_demo;
  if (game.only_real !== undefined) dbGame.only_real = game.only_real;
  if (game.has_freespins !== undefined) dbGame.has_freespins = game.has_freespins;
  if (game.mobile_friendly !== undefined) dbGame.is_mobile = game.mobile_friendly; // Map Game.mobile_friendly to DbGame.is_mobile


  // Remove undefined properties to avoid issues with Supabase client partial updates
  Object.keys(dbGame).forEach(key => {
    const dbGameKey = key as keyof DbGame;
    if (dbGame[dbGameKey] === undefined) {
      delete dbGame[dbGameKey];
    }
  });
  
  return dbGame;
};

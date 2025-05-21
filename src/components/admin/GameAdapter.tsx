
import { Game, DbGame, GameStatus, GameVolatility } from '@/types'; 

// Maps a DbGame (from Supabase 'games' table) to a Game (for frontend UI)
export const mapDbGameToGameAdapter = (dbGame: DbGame): Game => {
  // console.log("Mapping DbGame to Game:", dbGame);

  // Helper to safely cast string to GameStatus
  const parseGameStatus = (statusStr: string | null | undefined): GameStatus => {
    const validStatuses: GameStatus[] = ['active', 'inactive', 'maintenance', 'pending_review', 'draft', 'archived'];
    if (statusStr && validStatuses.includes(statusStr as GameStatus)) {
      return statusStr as GameStatus;
    }
    return 'inactive'; // Default status if invalid or missing
  };

  // Helper to safely cast string to GameVolatility
  const parseGameVolatility = (volStr: string | null | undefined): GameVolatility | undefined => {
    const validVolatilities: GameVolatility[] = ['low', 'medium', 'high', 'low-medium', 'medium-high'];
     if (volStr && validVolatilities.includes(volStr as GameVolatility)) {
      return volStr as GameVolatility;
    }
    return undefined;
  };

  return {
    id: String(dbGame.id), 
    game_id: dbGame.game_id, 
    title: dbGame.game_name || dbGame.title || 'N/A', 
    slug: dbGame.slug || String(dbGame.id), 
    
    providerName: dbGame.providers?.name || dbGame.provider_slug || dbGame.distribution || 'N/A',
    provider_slug: dbGame.provider_slug || dbGame.providers?.slug || dbGame.distribution || 'unknown-provider', 

    categoryName: dbGame.game_type || undefined, 
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
    is_featured: dbGame.is_featured ?? false,
    show_home: dbGame.show_home ?? false, 

    lines: dbGame.lines ?? undefined, 
    min_bet: dbGame.min_bet ?? undefined, 
    max_bet: dbGame.max_bet ?? undefined, 
    
    features: Array.isArray(dbGame.features) ? dbGame.features : [],
    tags: Array.isArray(dbGame.tags) ? dbGame.tags : [],
    themes: Array.isArray(dbGame.themes) ? dbGame.themes : [],
    
    releaseDate: dbGame.release_date || dbGame.created_at || undefined, 
    
    game_code: dbGame.game_code || undefined, 
    
    status: parseGameStatus(dbGame.status), 
  };
};

// Maps a Game (from frontend/form) to a DbGame (for Supabase 'games' table)
export const mapGameToDbGameAdapter = (game: Partial<Game>): Partial<DbGame> => {
  const dbGame: Partial<DbGame> = {};

  if (game.id) dbGame.id = String(game.id); 
  
  if (game.title) dbGame.game_name = game.title;
  if (game.slug) dbGame.slug = game.slug;

  if (game.provider_slug) dbGame.provider_slug = game.provider_slug; 
  
  if (game.categoryName) dbGame.game_type = game.categoryName;
  if (game.category_slugs) dbGame.category_slugs = game.category_slugs; 
  
  if (game.image) dbGame.cover = game.image;
  if (game.bannerUrl) dbGame.banner_url = game.bannerUrl;


  if (game.description) dbGame.description = game.description;
  if (game.rtp !== undefined && game.rtp !== null) dbGame.rtp = Number(game.rtp);

  // Ensure GameVolatility is assigned correctly
  if (game.volatility) {
    const validVolatilities: GameVolatility[] = ['low', 'medium', 'high', 'low-medium', 'medium-high'];
    if (validVolatilities.includes(game.volatility)) {
      dbGame.volatility = game.volatility;
    } else {
      // Handle invalid volatility string if necessary, or leave as undefined
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
  if (game.tags) dbGame.tags = game.tags;
  if (game.themes) dbGame.themes = game.themes;
  
  if (game.releaseDate) dbGame.release_date = game.releaseDate; 
  
  if (game.game_id) dbGame.game_id = String(game.game_id);
  if (game.game_code) dbGame.game_code = String(game.game_code);
  
  // Ensure GameStatus is assigned correctly
  if (game.status) {
    const validStatuses: GameStatus[] = ['active', 'inactive', 'maintenance', 'pending_review', 'draft', 'archived'];
    if (validStatuses.includes(game.status)) {
      dbGame.status = game.status;
    } else {
      // Handle invalid status string if necessary
      console.warn(`Invalid status value: ${game.status}`);
      dbGame.status = 'inactive'; // Default to a valid status
    }
  }


  Object.keys(dbGame).forEach(key => {
    const dbGameKey = key as keyof DbGame;
    if (dbGame[dbGameKey] === undefined) {
      delete dbGame[dbGameKey];
    }
  });
  
  return dbGame;
};

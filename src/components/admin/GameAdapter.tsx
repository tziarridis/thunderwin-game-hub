
import { Game, DbGame } from '@/types';

// Maps a DbGame (from Supabase) to a Game (for frontend use, especially in forms/display)
export const mapDbGameToGameAdapter = (dbGame: DbGame): Game => {
  return {
    id: String(dbGame.id),
    title: dbGame.game_name || dbGame.title || 'N/A',
    slug: dbGame.slug || '',
    
    providerName: dbGame.providers?.name || dbGame.provider_slug,
    provider_slug: dbGame.provider_slug || dbGame.providers?.slug,

    categoryName: dbGame.game_type,
    category_slugs: Array.isArray(dbGame.category_slugs) ? dbGame.category_slugs : (dbGame.category_slugs ? [dbGame.category_slugs] : []),
    
    image: dbGame.cover || dbGame.image_url, // image_url is an alias we added to DbGame for flexibility
    banner: dbGame.banner,
    
    description: dbGame.description,
    rtp: typeof dbGame.rtp === 'string' ? parseFloat(dbGame.rtp) : dbGame.rtp,
    
    isPopular: dbGame.is_popular ?? dbGame.show_home ?? false,
    isNew: dbGame.is_new ?? false,
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
  };
};

// Maps a Game (from frontend/form) to a DbGame (for Supabase)
export const mapGameToDbGameAdapter = (game: Partial<Game>): Partial<DbGame> => {
  const dbGame: Partial<DbGame> = {};

  if (game.id) dbGame.id = String(game.id); // Usually not needed for insert/update payload directly
  if (game.title) dbGame.game_name = game.title;
  if (game.slug) dbGame.slug = game.slug;

  if (game.provider_slug) dbGame.provider_slug = game.provider_slug;
  // If game.provider_id is available (e.g. selected from a list), set it
  // if (game.provider_id) dbGame.provider_id = game.provider_id;


  if (game.categoryName) dbGame.game_type = game.categoryName;
  if (game.category_slugs) dbGame.category_slugs = game.category_slugs;
  
  if (game.image) dbGame.cover = game.image;
  else if (game.cover) dbGame.cover = game.cover; // If Game has cover directly
  if (game.banner) dbGame.banner = game.banner;
  
  if (game.description) dbGame.description = game.description;
  if (game.rtp !== undefined) dbGame.rtp = Number(game.rtp); // Ensure number

  if (game.isPopular !== undefined) dbGame.is_popular = game.isPopular;
  if (game.isNew !== undefined) dbGame.is_new = game.isNew;
  if (game.is_featured !== undefined) dbGame.is_featured = game.is_featured;
  if (game.show_home !== undefined) dbGame.show_home = game.show_home;

  if (game.volatility) dbGame.volatility = game.volatility;
  if (game.lines !== undefined) dbGame.lines = Number(game.lines); // Ensure number
  if (game.minBet !== undefined) dbGame.min_bet = Number(game.minBet);
  if (game.maxBet !== undefined) dbGame.max_bet = Number(game.maxBet);

  if (game.features) dbGame.features = game.features;
  if (game.tags) dbGame.tags = game.tags;
  if (game.themes) dbGame.themes = game.themes;
  
  if (game.releaseDate) dbGame.release_date = game.releaseDate;
  
  if (game.game_id) dbGame.game_id = String(game.game_id);
  if (game.game_code) dbGame.game_code = String(game.game_code);
  
  if (game.status) dbGame.status = game.status;

  // For form compatibility if 'title' is used directly with DbGame object
  if (game.title) dbGame.title = game.title;


  // Clean up undefined properties before sending to Supabase
  Object.keys(dbGame).forEach(key => (dbGame as any)[key] === undefined && delete (dbGame as any)[key]);
  
  return dbGame;
};

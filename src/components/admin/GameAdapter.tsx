
import { Game, DbGame } from '@/types'; // Assuming DbGame is a more raw DB structure if it differs

// Maps a DbGame (from Supabase) to a Game (for frontend use, especially in forms/display)
export const mapDbGameToGameAdapter = (dbGame: DbGame): Game => {
  return {
    id: String(dbGame.id),
    title: dbGame.game_name || dbGame.title || 'N/A',
    slug: dbGame.slug || '',
    
    providerName: dbGame.providers?.name || dbGame.provider_slug,
    provider_slug: dbGame.provider_slug || dbGame.providers?.slug,

    categoryName: dbGame.game_type, // Keep as is, or map to a primary category if needed
    category_slugs: Array.isArray(dbGame.category_slugs) ? dbGame.category_slugs : (dbGame.category_slugs ? [dbGame.category_slugs] : []),
    
    image: dbGame.cover || dbGame.image_url,
    bannerUrl: dbGame.banner_url || dbGame.banner, // Use bannerUrl, ensure DbGame has banner_url or banner
    
    description: dbGame.description,
    rtp: typeof dbGame.rtp === 'string' ? parseFloat(dbGame.rtp) : dbGame.rtp,
    
    isPopular: dbGame.is_popular ?? false,
    isNew: dbGame.is_new ?? false,
    is_featured: dbGame.is_featured ?? false,
    show_home: dbGame.show_home ?? false, // Use the new property

    volatility: dbGame.volatility as Game['volatility'], // Ensure type compatibility
    lines: dbGame.lines,
    min_bet: dbGame.min_bet, // Use min_bet
    max_bet: dbGame.max_bet, // Use max_bet
    
    features: dbGame.features || [],
    tags: dbGame.tags || [],
    themes: dbGame.themes || [], // Use the new property
    
    releaseDate: dbGame.release_date,
    
    game_id: dbGame.game_id, // This is provider's game ID
    game_code: dbGame.game_code, // This is provider's launch code
    
    status: dbGame.status as Game['status'], // Ensure type compatibility
  };
};

// Maps a Game (from frontend/form) to a DbGame (for Supabase)
export const mapGameToDbGameAdapter = (game: Partial<Game>): Partial<DbGame> => {
  const dbGame: Partial<DbGame> = {};

  if (game.id) dbGame.id = String(game.id);
  if (game.title) dbGame.game_name = game.title;
  if (game.slug) dbGame.slug = game.slug;

  if (game.provider_slug) dbGame.provider_slug = game.provider_slug;

  if (game.categoryName) dbGame.game_type = game.categoryName; // Or map from category_slugs[0]
  if (game.category_slugs) dbGame.category_slugs = game.category_slugs;
  
  if (game.image) dbGame.cover = game.image;
  else if (game.cover) dbGame.cover = game.cover;
  if (game.bannerUrl) dbGame.banner_url = game.bannerUrl; // Use bannerUrl for DbGame.banner_url
  
  if (game.description) dbGame.description = game.description;
  if (game.rtp !== undefined) dbGame.rtp = Number(game.rtp);

  if (game.isPopular !== undefined) dbGame.is_popular = game.isPopular;
  if (game.isNew !== undefined) dbGame.is_new = game.isNew;
  if (game.is_featured !== undefined) dbGame.is_featured = game.is_featured;
  if (game.show_home !== undefined) dbGame.show_home = game.show_home; // Use show_home

  if (game.volatility) dbGame.volatility = game.volatility;
  if (game.lines !== undefined) dbGame.lines = Number(game.lines);
  if (game.min_bet !== undefined) dbGame.min_bet = Number(game.min_bet); // Use min_bet
  if (game.max_bet !== undefined) dbGame.max_bet = Number(game.max_bet); // Use max_bet

  if (game.features) dbGame.features = game.features;
  if (game.tags) dbGame.tags = game.tags;
  if (game.themes) dbGame.themes = game.themes; // Use themes
  
  if (game.releaseDate) dbGame.release_date = game.releaseDate;
  
  if (game.game_id) dbGame.game_id = String(game.game_id);
  if (game.game_code) dbGame.game_code = String(game.game_code); // Use game_code
  
  if (game.status) dbGame.status = game.status;

  // For form compatibility if 'title' is used directly with DbGame object
  if (game.title) dbGame.title = game.title; // Keep if DbGame uses .title for some legacy reason, else remove

  Object.keys(dbGame).forEach(key => (dbGame as any)[key] === undefined && delete (dbGame as any)[key]);
  
  return dbGame;
};


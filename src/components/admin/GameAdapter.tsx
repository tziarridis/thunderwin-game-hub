
import { Game, DbGame } from '@/types'; 

// Maps a DbGame (from Supabase 'games' table) to a Game (for frontend UI)
export const mapDbGameToGameAdapter = (dbGame: DbGame): Game => {
  // console.log("Mapping DbGame to Game:", dbGame);
  return {
    id: String(dbGame.id), // Use DB's primary key 'id' as the main identifier for Game
    game_id: dbGame.game_id, // Provider's game ID
    title: dbGame.game_name || dbGame.title || 'N/A', // dbGame.title is fallback
    slug: dbGame.slug || String(dbGame.id), // Ensure slug exists, fallback to id
    
    providerName: dbGame.providers?.name || dbGame.provider_slug || dbGame.distribution,
    provider_slug: dbGame.provider_slug || dbGame.providers?.slug || dbGame.distribution, // Use provider_slug from DbGame if available

    categoryName: dbGame.game_type, 
    // Ensure category_slugs is an array, handle if it's a string or null/undefined
    category_slugs: Array.isArray(dbGame.category_slugs) 
      ? dbGame.category_slugs 
      : (typeof dbGame.category_slugs === 'string' ? [dbGame.category_slugs] : []),
    
    image: dbGame.cover || dbGame.image_url, // Use cover from DB
    image_url: dbGame.cover || dbGame.image_url,
    cover: dbGame.cover,
    bannerUrl: dbGame.banner_url || dbGame.banner || dbGame.cover, // Use cover as fallback for banner
    
    description: dbGame.description,
    rtp: typeof dbGame.rtp === 'string' ? parseFloat(dbGame.rtp) : dbGame.rtp,
    
    isPopular: dbGame.is_popular ?? dbGame.is_featured ?? false, // is_popular might not be in DbGame, fallback to is_featured
    isNew: dbGame.is_new ?? false, // is_new might not be in DbGame
    is_featured: dbGame.is_featured ?? false,
    show_home: dbGame.show_home ?? false, 

    volatility: (dbGame.volatility as Game['volatility']) || undefined, // Volatility is not in 'games' table, so dbGame.volatility will be undefined
    lines: dbGame.lines, // lines not in 'games' table
    min_bet: dbGame.min_bet, 
    max_bet: dbGame.max_bet, 
    
    features: Array.isArray(dbGame.features) ? dbGame.features : [],
    tags: Array.isArray(dbGame.tags) ? dbGame.tags : [],
    themes: Array.isArray(dbGame.themes) ? dbGame.themes : [],
    
    releaseDate: dbGame.release_date || dbGame.created_at, // release_date not in 'games' table, fallback to created_at
    
    game_code: dbGame.game_code, 
    
    status: (dbGame.status as Game['status']) || 'active', // Default to 'active' if status is missing or invalid
  };
};

// Maps a Game (from frontend/form) to a DbGame (for Supabase 'games' table)
export const mapGameToDbGameAdapter = (game: Partial<Game>): Partial<DbGame> => {
  const dbGame: Partial<DbGame> = {};

  // Important: 'id' in Game type maps to 'id' (PK) in DbGame/games table.
  // 'game_id' in Game type maps to 'game_id' (provider's ID) in DbGame/games table.
  if (game.id) dbGame.id = String(game.id); // This should be the DB PK if updating an existing game
  
  if (game.title) dbGame.game_name = game.title;
  if (game.slug) dbGame.slug = game.slug;

  // provider_slug from Game maps to provider_slug in DbGame (if exists) or could be used to find provider_id
  if (game.provider_slug) dbGame.provider_slug = game.provider_slug; 
  // If you have a providers table and provider_id is a FK in games table:
  // if (game.provider_id) dbGame.provider_id = game.provider_id;


  if (game.categoryName) dbGame.game_type = game.categoryName;
  if (game.category_slugs) dbGame.category_slugs = game.category_slugs; 
  
  if (game.image) dbGame.cover = game.image; // Map Game.image to DbGame.cover
  // Banner: 'games' table doesn't have a banner field. If forms have bannerUrl, it won't be saved unless DbGame is extended.
  // For now, mapGameToDbGameAdapter doesn't handle game.bannerUrl explicitly for DbGame.
  // if (game.bannerUrl) dbGame.banner_url = game.bannerUrl; // No banner_url in DbGame based on 'games' table

  if (game.description) dbGame.description = game.description;
  if (game.rtp !== undefined && game.rtp !== null) dbGame.rtp = Number(game.rtp);

  if (game.isPopular !== undefined) dbGame.is_popular = game.isPopular; // is_popular not in 'games' table
  if (game.isNew !== undefined) dbGame.is_new = game.isNew; // is_new not in 'games' table
  if (game.is_featured !== undefined) dbGame.is_featured = game.is_featured;
  if (game.show_home !== undefined) dbGame.show_home = game.show_home;

  if (game.volatility) dbGame.volatility = game.volatility; // volatility not in 'games' table
  if (game.lines !== undefined && game.lines !== null) dbGame.lines = Number(game.lines); // lines not in 'games' table
  if (game.min_bet !== undefined && game.min_bet !== null) dbGame.min_bet = Number(game.min_bet); // min_bet not in 'games' table
  if (game.max_bet !== undefined && game.max_bet !== null) dbGame.max_bet = Number(game.max_bet); // max_bet not in 'games' table

  if (game.features) dbGame.features = game.features;
  if (game.tags) dbGame.tags = game.tags;
  if (game.themes) dbGame.themes = game.themes; // themes not in 'games' table
  
  if (game.releaseDate) dbGame.release_date = game.releaseDate; // release_date not in 'games' table
  
  if (game.game_id) dbGame.game_id = String(game.game_id); // This is provider's game ID
  if (game.game_code) dbGame.game_code = String(game.game_code);
  
  if (game.status) dbGame.status = game.status;


  // Clean up undefined properties before sending to Supabase
  Object.keys(dbGame).forEach(key => {
    const dbGameKey = key as keyof DbGame;
    if (dbGame[dbGameKey] === undefined) {
      delete dbGame[dbGameKey];
    }
  });
  
  return dbGame;
};

import { Game } from '@/types';

// Example function (replace with your actual implementation)
export const adaptApiGameToInternalFormat = (apiGame: any): Game => {
  // Basic transformation, expand as needed
  return {
    id: String(apiGame.id || apiGame.game_id || apiGame.game_code), // Ensure ID is a string
    title: apiGame.name || apiGame.title,
    providerName: apiGame.provider_name || apiGame.provider,
    provider_slug: apiGame.provider, // Assuming apiGame.provider is the slug
    categoryName: apiGame.category_name || apiGame.category,
    // category_slugs: apiGame.categories, // Adapt based on API structure
    image: apiGame.thumbnail || apiGame.icon_2 || apiGame.icon_1 || apiGame.logo,
    cover: apiGame.banner_url || apiGame.image_background,
    rtp: parseRtp(apiGame.rtp), // Use helper for robust parsing
    // volatility: apiGame.volatility,
    // minBet: apiGame.min_bet,
    // maxBet: apiGame.max_bet,
    // lines: apiGame.lines,
    features: apiGame.features || [], // Ensure it's an array
    tags: apiGame.tags || [], // Ensure it's an array
    status: apiGame.status || 'active',
    game_id: apiGame.game_id || apiGame.id, // External game ID
    game_code: apiGame.game_code, // External game code
    release_date: apiGame.release_date || apiGame.launch_date, // Corrected property name
  };
};

// Helper function to parse RTP values which might come in different formats
const parseRtp = (rtp: any): number | undefined => {
  if (rtp === undefined || rtp === null) return undefined;
  
  // If it's already a number, return it
  if (typeof rtp === 'number') return rtp;
  
  // If it's a string, try to parse it
  if (typeof rtp === 'string') {
    // Remove any % sign and trim
    const cleanRtp = rtp.replace('%', '').trim();
    
    // Try to parse as float
    const parsedRtp = parseFloat(cleanRtp);
    
    // Return the parsed value if valid, otherwise undefined
    return isNaN(parsedRtp) ? undefined : parsedRtp;
  }
  
  return undefined;
};

// Function to adapt internal Game format to API format if needed
export const adaptInternalGameToApiFormat = (game: Game): any => {
  // Transform your internal Game type to whatever format your API expects
  return {
    id: game.id,
    title: game.title,
    provider: game.provider_slug || game.providerName,
    category: game.category_slugs || game.categoryName,
    thumbnail: game.image,
    banner_url: game.cover,
    rtp: game.rtp,
    volatility: game.volatility,
    min_bet: game.minBet,
    max_bet: game.maxBet,
    lines: game.lines,
    features: game.features,
    tags: game.tags,
    status: game.status,
    game_id: game.game_id,
    game_code: game.game_code,
    release_date: game.release_date,
    // Add any other fields needed by your API
  };
};

// Function to adapt database game format to internal format
export const adaptDbGameToInternalFormat = (dbGame: any): Game => {
  return {
    id: String(dbGame.id),
    title: dbGame.title,
    providerName: dbGame.provider_name,
    provider_slug: dbGame.provider_slug,
    categoryName: Array.isArray(dbGame.category_names) 
      ? dbGame.category_names.join(', ') 
      : dbGame.category_name,
    category_slugs: dbGame.category_slugs,
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
    themes: dbGame.themes || [],
    isNew: dbGame.is_new,
    isPopular: dbGame.is_popular,
    is_featured: dbGame.is_featured,
    show_home: dbGame.show_home,
    status: dbGame.status || 'active',
    slug: dbGame.slug,
    game_id: dbGame.game_id,
    game_code: dbGame.game_code,
    release_date: dbGame.release_date,
    // Add any other fields from your database schema
  };
};

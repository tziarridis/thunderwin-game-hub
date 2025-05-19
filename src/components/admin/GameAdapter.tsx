
import { Game, DbGame } from '@/types'; // Assuming DbGame is also defined in types

// Helper function to parse RTP values which might come in different formats
const parseRtp = (rtp: any): number | undefined => {
  if (rtp === undefined || rtp === null || rtp === '') return undefined;
  if (typeof rtp === 'number') return rtp;
  if (typeof rtp === 'string') {
    const cleanRtp = rtp.replace('%', '').trim();
    const parsedRtp = parseFloat(cleanRtp);
    return isNaN(parsedRtp) ? undefined : parsedRtp;
  }
  return undefined;
};

// Adapt API game (any structure) to our internal Game format
export const adaptApiGameToInternalFormat = (apiGame: any): Game => {
  return {
    id: String(apiGame.id || apiGame.game_id || apiGame.game_code || apiGame.slug || Date.now() + Math.random()), // Ensure ID is a string and unique
    title: apiGame.name || apiGame.title || 'Untitled Game',
    providerName: apiGame.provider_name || apiGame.provider, // Prefer provider_name for display
    provider_slug: apiGame.provider_slug || apiGame.provider, // Keep slug if available
    categoryName: apiGame.category_name || apiGame.category, // Prefer category_name
    category_slugs: apiGame.category_slugs || apiGame.categories || (apiGame.category ? [apiGame.category] : []), // Ensure array or convert
    image: apiGame.image || apiGame.thumbnail || apiGame.icon_2 || apiGame.icon_1 || apiGame.logo,
    cover: apiGame.cover || apiGame.banner_url || apiGame.image_background,
    banner: apiGame.banner,
    rtp: parseRtp(apiGame.rtp),
    volatility: apiGame.volatility,
    minBet: apiGame.min_bet !== undefined ? Number(apiGame.min_bet) : undefined,
    maxBet: apiGame.max_bet !== undefined ? Number(apiGame.max_bet) : undefined,
    lines: apiGame.lines !== undefined ? Number(apiGame.lines) : undefined,
    features: apiGame.features || [],
    tags: apiGame.tags || [],
    themes: apiGame.themes || [],
    status: apiGame.status || 'active',
    slug: apiGame.slug,
    game_id: apiGame.game_id || apiGame.id,
    game_code: apiGame.game_code,
    release_date: apiGame.release_date || apiGame.launch_date,
    description: apiGame.description,
    isNew: !!apiGame.is_new,
    isPopular: !!apiGame.is_popular,
    is_featured: !!apiGame.is_featured,
    show_home: !!apiGame.show_home,
  };
};


// Adapt internal Game format to API format if needed (e.g., for saving back)
export const adaptInternalGameToApiFormat = (game: Game): any => {
  return {
    // id: game.id, // Usually not sent back if API assigns ID
    title: game.title,
    provider_slug: game.provider_slug || game.providerName, // API might expect 'provider' or 'provider_slug'
    category_slugs: game.category_slugs || (game.categoryName ? [game.categoryName] : []), // API structure for categories
    image_url: game.image || game.image_url, // API might expect 'thumbnail' or 'image_url'
    cover: game.cover,
    banner: game.banner,
    rtp: game.rtp,
    volatility: game.volatility,
    min_bet: game.minBet,
    max_bet: game.maxBet,
    lines: game.lines,
    features: game.features,
    tags: game.tags,
    themes: game.themes,
    status: game.status,
    slug: game.slug,
    game_id: game.game_id,
    game_code: game.game_code,
    release_date: game.release_date,
    description: game.description,
    is_new: game.isNew,
    is_popular: game.isPopular,
    is_featured: game.is_featured,
    show_home: game.show_home,
    // Map other fields as required by your specific API
  };
};

// Adapt database game (DbGame) format to internal Game format
export const adaptDbGameToInternalFormat = (dbGame: DbGame): Game => {
  // Ensure category_slugs and categoryName are correctly derived
  let categoryName: string | undefined = undefined;
  let categorySlugs: string[] | string | undefined = dbGame.category_slugs;

  if (Array.isArray(dbGame.category_names) && dbGame.category_names.length > 0) {
    categoryName = dbGame.category_names.join(', ');
  } else if (typeof dbGame.category_name === 'string') {
    categoryName = dbGame.category_name;
  }
  
  if (!categorySlugs && categoryName) { // If slugs are missing but name exists, try to use name as slug(s)
    categorySlugs = categoryName.toLowerCase().split(',').map(s => s.trim().replace(/\s+/g, '-'));
  }


  return {
    id: String(dbGame.id),
    title: dbGame.title || 'Untitled Game',
    providerName: dbGame.provider_name, // Assuming DbGame has provider_name
    provider_slug: dbGame.provider_slug,
    categoryName: categoryName,
    category_slugs: categorySlugs,
    image: dbGame.image_url,
    cover: dbGame.cover,
    banner: dbGame.banner,
    description: dbGame.description,
    rtp: parseRtp(dbGame.rtp),
    volatility: dbGame.volatility,
    minBet: dbGame.min_bet !== undefined ? Number(dbGame.min_bet) : undefined,
    maxBet: dbGame.max_bet !== undefined ? Number(dbGame.max_bet) : undefined,
    lines: dbGame.lines !== undefined ? Number(dbGame.lines) : undefined,
    features: dbGame.features || [],
    tags: dbGame.tags || [],
    themes: dbGame.themes || [],
    isNew: !!dbGame.is_new,
    isPopular: !!dbGame.is_popular,
    is_featured: !!dbGame.is_featured,
    show_home: !!dbGame.show_home,
    status: dbGame.status || 'active',
    slug: dbGame.slug,
    game_id: dbGame.game_id,
    game_code: dbGame.game_code,
    release_date: dbGame.release_date,
    provider_id: dbGame.provider_id,
  };
};


import { Game, DbGame } from '@/types';

// Adapter to transform DbGame (raw from DB) to Game (used in UI/app logic)
export const adaptDbGameToGame = (dbGame: DbGame): Game => {
  return {
    id: dbGame.id, // Use DB id as primary id for Game type
    title: dbGame.title,
    providerName: dbGame.provider_name || dbGame.provider_slug, // Prefer display name
    provider_slug: dbGame.provider_slug,
    categoryName: Array.isArray(dbGame.category_names) ? dbGame.category_names.join(', ') : (dbGame.category_slugs && !Array.isArray(dbGame.category_slugs) ? dbGame.category_slugs : undefined),
    category_slugs: dbGame.category_slugs,
    image: dbGame.image_url || dbGame.cover, // Prefer image_url, fallback to cover
    image_url: dbGame.image_url,
    cover: dbGame.cover,
    banner: dbGame.banner,
    rtp: dbGame.rtp,
    volatility: dbGame.volatility,
    slug: dbGame.slug,
    tags: dbGame.tags || [],
    isNew: dbGame.is_new,
    isPopular: dbGame.is_popular,
    is_featured: dbGame.is_featured,
    show_home: dbGame.show_home,
    description: dbGame.description,
    minBet: dbGame.min_bet,
    maxBet: dbGame.max_bet,
    lines: dbGame.lines,
    features: dbGame.features || [],
    themes: dbGame.themes || [],
    status: dbGame.status,
    game_id: dbGame.game_id, // External provider game ID
    game_code: dbGame.game_code, // External provider game code
    release_date: dbGame.release_date,
    provider_id: dbGame.provider_id, // Internal DB provider link
    // Ensure all required Game fields are mapped
  };
};

// Adapter to transform Game (used in UI/app logic) back to DbGame (for saving to DB)
// This might be partial if you only update certain fields
export const adaptGameToDbGame = (game: Game): Partial<DbGame> => {
  const dbGame: Partial<DbGame> = {
    id: typeof game.id === 'string' && game.id.includes('-') ? undefined : game.id, // if it's a UUID, don't send it as id for insert
    title: game.title,
    provider_slug: game.provider_slug,
    // Handle category_slugs carefully: if Game has categoryName, you might need to find/create slugs
    category_slugs: game.category_slugs, 
    image_url: game.image_url || game.image,
    cover: game.cover,
    banner: game.banner,
    description: game.description,
    rtp: typeof game.rtp === 'string' ? parseFloat(game.rtp) : game.rtp,
    volatility: game.volatility,
    min_bet: game.minBet,
    max_bet: game.maxBet,
    lines: game.lines,
    features: game.features,
    themes: game.themes,
    tags: game.tags,
    status: game.status,
    slug: game.slug,
    game_id: game.game_id,
    game_code: game.game_code,
    provider_id: game.provider_id,
    is_new: game.isNew,
    is_popular: game.isPopular,
    is_featured: game.is_featured,
    show_home: game.show_home,
    release_date: game.release_date,
    // provider_name is usually derived or joined, not directly set unless denormalized
  };
  // Remove undefined properties to avoid issues with Supabase client partial updates
  Object.keys(dbGame).forEach(key => (dbGame as any)[key] === undefined && delete (dbGame as any)[key]);
  return dbGame;
};


// Example usage:
// Assuming we have a function to fetch games in DbGame format
// async function fetchRawGames(): Promise<DbGame[]> {
//   // ... fetch from Supabase or API
//   return []; // placeholder
// }

// async function getAdaptedGames(): Promise<Game[]> {
//   const rawGames = await fetchRawGames();
//   return rawGames.map(adaptDbGameToGame);
// }

// For categoryName, if DbGame has category_names (array) or category_slugs (string/array)
// const getCategoryDisplayName = (dbGame: DbGame): string | undefined => {
//   if (Array.isArray(dbGame.category_names) && dbGame.category_names.length > 0) {
//     return dbGame.category_names.join(', '); // Or just the first one: dbGame.category_names[0]
//   }
//   if (dbGame.category_slugs) {
//     if (Array.isArray(dbGame.category_slugs) && dbGame.category_slugs.length > 0) {
//       return dbGame.category_slugs.map(slug => slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', '); // Format slug
//     }
//     if (typeof dbGame.category_slugs === 'string') {
//       return dbGame.category_slugs.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Format slug
//     }
//   }
//   return undefined;
// };

// // Update adaptDbGameToGame
// export const adaptDbGameToGameUpdated = (dbGame: DbGame): Game => {
//   return {
//     // ... other properties
//     id: dbGame.id,
//     title: dbGame.title,
//     // ...
//     categoryName: getCategoryDisplayName(dbGame),
//     category_slugs: dbGame.category_slugs,
//     // ...
//   };
// };

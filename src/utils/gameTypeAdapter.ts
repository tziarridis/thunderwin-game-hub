
import { Game, DbGame, GameTag } from '@/types/game'; // Assuming GameTag is exported from game types

// Helper to create a simple slug
const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
};

// Converts a database game object to the UI game type
export const convertAPIGameToUIGame = (dbGame: DbGame): Game => {
  // Provider details
  // Assuming dbGame.distribution is the provider name from the 'games' table
  // and dbGame.provider_id is the foreign key.
  // The Game type expects provider_slug and providerName.
  // dbGame.providers might be present if it's an enriched object, otherwise undefined.
  const providerName = dbGame.providers?.name || dbGame.distribution || dbGame.provider_slug || 'Unknown Provider';
  const providerSlug = dbGame.providers?.slug || dbGame.provider_slug || slugify(providerName);

  const provider = dbGame.providers ? {
    id: dbGame.providers.id?.toString() || '',
    name: dbGame.providers.name || '',
    slug: dbGame.providers.slug || ''
  } : undefined;

  // Game slug: Try dbGame.slug, then slugify game_name, then game_id, then id.
  const gameSlug = dbGame.slug || slugify(dbGame.game_name || dbGame.title || '') || dbGame.game_id?.toString() || dbGame.id?.toString() || '';

  // Categories: Use dbGame.game_type to derive category_slugs if not present
  let categorySlugs: string[] = [];
  if (Array.isArray(dbGame.category_slugs) && dbGame.category_slugs.length > 0) {
    categorySlugs = dbGame.category_slugs;
  } else if (dbGame.game_type) {
    categorySlugs = [slugify(dbGame.game_type)];
  }

  // Tags: Ensure it's an array, default to empty array if null/undefined
  let tags: string[] | GameTag[] = [];
  if (Array.isArray(dbGame.tags)) {
    tags = dbGame.tags;
  } else if (typeof dbGame.tags === 'string') {
    tags = dbGame.tags.split(',').map(t => t.trim()).filter(Boolean);
  }


  return {
    id: dbGame.id?.toString() || '',
    title: dbGame.game_name || dbGame.title || '',
    slug: gameSlug,
    game_id: dbGame.game_id || '',
    
    provider_id: dbGame.provider_id?.toString(), // Added provider_id
    provider_slug: providerSlug,
    providerName: providerName,
    provider: provider,

    category: dbGame.game_type, // original game_type
    categoryName: dbGame.game_type, // Display name for category
    category_slugs: categorySlugs,

    description: dbGame.description || '',
    rtp: typeof dbGame.rtp === 'string' ? parseFloat(dbGame.rtp) : dbGame.rtp,
    image: dbGame.cover || dbGame.image_url || '',
    cover: dbGame.cover || '',
    banner: dbGame.banner || dbGame.banner_url || '',
    status: dbGame.status || 'inactive',
    views: dbGame.views || 0,
    
    is_featured: !!dbGame.is_featured,
    isNew: !!dbGame.is_new, // Changed from is_new
    isPopular: !!dbGame.is_popular || !!dbGame.is_featured, // Changed from is_popular
    
    tags: tags,
    volatility: dbGame.volatility || undefined,
    lines: dbGame.lines || undefined,
    min_bet: dbGame.min_bet || undefined,
    max_bet: dbGame.max_bet || undefined,
    
    only_real: !!dbGame.only_real,
    only_demo: !!dbGame.only_demo,
    has_freespins: !!dbGame.has_freespins,
    
    created_at: dbGame.created_at || '',
    updated_at: dbGame.updated_at || '',
    show_home: !!dbGame.show_home,
    releaseDate: dbGame.release_date || undefined, // Added releaseDate
  };
};

// Convert from UI Game type to Database Game type for saving
export const convertUIGameToDbGame = (game: Partial<Game>): Partial<DbGame> => {
  const dbGame: Partial<DbGame> = {
    // Map essential fields
    id: game.id?.toString(),
    game_id: game.game_id,
    game_name: game.title,
    slug: game.slug, // UI game should have a slug
    provider_id: game.provider_id?.toString(),
    provider_slug: game.provider_slug, // UI game should have provider_slug
    // 'distribution' field in 'games' table seems to be provider name.
    // If Game.providerName is available, it can be mapped to 'distribution'.
    distribution: game.providerName, 
    game_type: game.categoryName || game.category,
    category_slugs: game.category_slugs,
    description: game.description,
    cover: game.cover || game.image,
    banner: game.banner,
    banner_url: game.banner, // keep consistency if possible
    image_url: game.image, // keep consistency
    status: game.status,
    is_featured: game.is_featured,
    is_new: game.isNew,
    is_popular: game.isPopular,
    tags: Array.isArray(game.tags) ? game.tags as string[] : [], // ensure tags are string[] for DB
    rtp: game.rtp,
    volatility: game.volatility,
    lines: game.lines,
    min_bet: game.min_bet,
    max_bet: game.max_bet,
    only_real: game.only_real,
    only_demo: game.only_demo,
    has_freespins: game.has_freespins,
    show_home: game.show_home,
    release_date: game.releaseDate, // Map to release_date
  };

  // Remove undefined fields to avoid issues with Supabase client
  Object.keys(dbGame).forEach(key => {
    if ((dbGame as any)[key] === undefined) {
      delete (dbGame as any)[key];
    }
  });

  return dbGame;
};


import { Game, DbGame, GameTag, GameStatusEnum, GameVolatilityEnum } from '@/types/game';

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

// Converts a database game object (DbGame) to the UI game type (Game)
// Renamed from convertAPIGameToUIGame to convertDbGameToGame
export const convertDbGameToGame = (dbGame: DbGame): Game => {
  const providerName = dbGame.providers?.name || dbGame.distribution || dbGame.provider_slug || 'Unknown Provider';
  const providerSlug = dbGame.providers?.slug || dbGame.provider_slug || slugify(providerName);

  const provider = dbGame.providers ? {
    id: dbGame.providers.id?.toString() || '',
    name: dbGame.providers.name || '',
    slug: dbGame.providers.slug || ''
  } : undefined;

  const gameSlug = dbGame.slug || slugify(dbGame.game_name || dbGame.title || '') || dbGame.game_id?.toString() || dbGame.id?.toString() || '';

  let categorySlugs: string[] = [];
  if (Array.isArray(dbGame.category_slugs) && dbGame.category_slugs.length > 0) {
    categorySlugs = dbGame.category_slugs;
  } else if (dbGame.game_type) {
    categorySlugs = [slugify(dbGame.game_type)];
  }

  let tags: GameTag[] | string[] = [];
  if (Array.isArray(dbGame.tags)) {
    // Assuming DbGame tags are string[]. If they can be GameTag[], more complex mapping is needed.
    // For now, if it's string[], map to GameTag[] if desired by Game type, or keep as string[].
    // Game type allows GameTag[] | string[]. Let's try to make them GameTag[] for consistency.
    tags = dbGame.tags.map(tag => (typeof tag === 'string' ? { name: tag, slug: slugify(tag) } : tag));
  } else if (typeof dbGame.tags === 'string') { // Should not happen if DbGame.tags is string[]
    tags = dbGame.tags.split(',').map(t => {
      const trimmed = t.trim();
      return { name: trimmed, slug: slugify(trimmed)};
    }).filter(Boolean);
  }
  
  const gameStatus = Object.values(GameStatusEnum).includes(dbGame.status as GameStatusEnum) 
    ? dbGame.status 
    : GameStatusEnum.INACTIVE;

  const gameVolatility = dbGame.volatility && Object.values(GameVolatilityEnum).includes(dbGame.volatility as GameVolatilityEnum)
    ? dbGame.volatility
    : undefined;

  return {
    id: dbGame.id?.toString() || '',
    title: dbGame.title || dbGame.game_name || 'N/A', // Prioritize title
    slug: gameSlug,
    game_id: dbGame.game_id || String(dbGame.id), // Fallback game_id to id
    
    provider_id: dbGame.provider_id?.toString(),
    provider_slug: providerSlug,
    providerName: providerName,
    provider: provider,

    category: dbGame.game_type || undefined,
    categoryName: dbGame.game_type || undefined,
    category_slugs: categorySlugs,
    categoryNames: dbGame.game_type ? [dbGame.game_type] : [], // Simplistic mapping

    description: dbGame.description || '',
    rtp: typeof dbGame.rtp === 'string' ? parseFloat(dbGame.rtp) : (typeof dbGame.rtp === 'number' ? dbGame.rtp : undefined),
    image: dbGame.cover || dbGame.image_url || undefined,
    image_url: dbGame.image_url || dbGame.cover || undefined,
    cover: dbGame.cover || dbGame.image_url || undefined,
    banner: dbGame.banner_url || dbGame.cover || undefined, // Match Game type
    bannerUrl: dbGame.banner_url || dbGame.cover || undefined, // Match Game type

    status: gameStatus,
    views: dbGame.views || 0,
    
    is_featured: !!dbGame.is_featured,
    is_new: !!dbGame.is_new, // Use is_new from DbGame
    is_popular: !!dbGame.is_popular, // Use is_popular from DbGame
    
    tags: tags,
    volatility: gameVolatility,
    lines: dbGame.lines ?? undefined,
    min_bet: dbGame.min_bet ?? undefined,
    max_bet: dbGame.max_bet ?? undefined,
    
    only_real: !!dbGame.only_real,
    only_demo: !!dbGame.only_demo,
    has_freespins: !!dbGame.has_freespins,
    mobile_friendly: !!dbGame.is_mobile,
    
    created_at: dbGame.created_at || undefined,
    updated_at: dbGame.updated_at || undefined,
    show_home: !!dbGame.show_home,
    releaseDate: dbGame.release_date || dbGame.created_at || undefined,
    game_code: dbGame.game_code || undefined,
  };
};

// Convert from UI Game type (Game) to Database Game type (DbGame) for saving
// Renamed from convertUIGameToDbGame to convertGameToDbGame
export const convertGameToDbGame = (game: Partial<Game>): Partial<DbGame> => {
  const dbGame: Partial<DbGame> = {
    id: game.id?.toString(),
    game_id: game.game_id || undefined,
    title: game.title, // Use title for DbGame.title
    game_name: game.title, // Also set game_name for consistency
    slug: game.slug || slugify(game.title || ''),
    provider_id: game.provider_id?.toString(),
    provider_slug: game.provider_slug,
    distribution: game.providerName || game.provider_slug, 
    game_type: game.categoryName || (game.category_slugs && game.category_slugs.length > 0 ? game.category_slugs[0] : undefined),
    category_slugs: game.category_slugs,
    description: game.description,
    cover: game.cover || game.image,
    banner_url: game.bannerUrl || game.banner,
    image_url: game.image_url || game.image || game.cover,
    status: game.status || GameStatusEnum.INACTIVE,
    is_featured: game.is_featured,
    is_new: game.is_new, // Map from Game.is_new
    is_popular: game.is_popular, // Map from Game.is_popular
    tags: Array.isArray(game.tags) 
      ? game.tags.map(tag => (typeof tag === 'string' ? tag : tag.name)).filter(Boolean) as string[]
      : [],
    rtp: game.rtp,
    volatility: game.volatility,
    lines: game.lines,
    min_bet: game.min_bet,
    max_bet: game.max_bet,
    only_real: game.only_real,
    only_demo: game.only_demo,
    has_freespins: game.has_freespins,
    show_home: game.show_home,
    release_date: game.releaseDate,
    is_mobile: game.mobile_friendly,
    game_code: game.game_code,
    views: game.views,
  };

  Object.keys(dbGame).forEach(key => {
    if ((dbGame as any)[key] === undefined) {
      delete (dbGame as any)[key];
    }
  });

  return dbGame;
};

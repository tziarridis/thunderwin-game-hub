import { Game, DbGame, GameTag, GameStatusEnum, GameVolatilityEnum, GameProvider } from '@/types/game'; // Added GameProvider

// Helper to create a simple slug
export const slugify = (text: string): string => { // Added export
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
export const convertDbGameToGame = (dbGame: DbGame): Game => {
  const providerName = dbGame.providers?.name || dbGame.distribution || dbGame.provider_slug || 'Unknown Provider';
  const providerSlug = dbGame.providers?.slug || dbGame.provider_slug || slugify(providerName);

  let providerData: GameProvider | undefined = undefined;
  // Robust handling of dbGame.providers
  if (dbGame.providers && typeof dbGame.providers === 'object' && 'id' in dbGame.providers && 'name' in dbGame.providers && 'slug' in dbGame.providers) {
    providerData = {
      id: String(dbGame.providers.id) || '', // Ensure id is string
      name: dbGame.providers.name || '',
      slug: dbGame.providers.slug || ''
    };
  }


  const gameSlug = dbGame.slug || slugify(dbGame.game_name || dbGame.title || '') || dbGame.game_id?.toString() || dbGame.id?.toString() || '';

  let categorySlugs: string[] = [];
  if (Array.isArray(dbGame.category_slugs) && dbGame.category_slugs.length > 0) {
    categorySlugs = dbGame.category_slugs;
  } else if (dbGame.game_type) {
    categorySlugs = [slugify(dbGame.game_type)];
  }

  let tags: GameTag[] | string[] = [];
  if (Array.isArray(dbGame.tags)) {
    tags = dbGame.tags.map(tag => (typeof tag === 'string' ? { name: tag, slug: slugify(tag) } : tag));
  } else if (typeof dbGame.tags === 'string') { 
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
    title: dbGame.title || dbGame.game_name || 'N/A',
    slug: gameSlug,
    game_id: dbGame.game_id || String(dbGame.id),
    
    provider_id: dbGame.provider_id?.toString(),
    provider_slug: providerSlug,
    providerName: providerName,
    provider: providerData, // Use the robustly mapped providerData

    category: dbGame.game_type || undefined,
    categoryName: dbGame.game_type || undefined,
    category_slugs: categorySlugs,
    categoryNames: dbGame.game_type ? [dbGame.game_type] : [],

    description: dbGame.description || '',
    rtp: typeof dbGame.rtp === 'string' ? parseFloat(dbGame.rtp) : (typeof dbGame.rtp === 'number' ? dbGame.rtp : undefined),
    image: dbGame.cover || dbGame.image_url || undefined,
    image_url: dbGame.image_url || dbGame.cover || undefined,
    cover: dbGame.cover || dbGame.image_url || undefined,
    banner: dbGame.banner_url || dbGame.cover || undefined,
    bannerUrl: dbGame.banner_url || dbGame.cover || undefined,

    status: gameStatus,
    views: dbGame.views || 0,
    
    is_featured: !!dbGame.is_featured,
    is_new: !!dbGame.is_new,
    is_popular: !!dbGame.is_popular,
    
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
export const convertGameToDbGame = (game: Partial<Game>): Partial<DbGame> => {
  const dbGame: Partial<DbGame> = {
    id: game.id?.toString(),
    game_id: game.game_id || undefined,
    title: game.title,
    game_name: game.title, 
    slug: game.slug || slugify(game.title || ''),
    provider_id: game.provider_id?.toString(),
    provider_slug: game.provider_slug,
    // Ensure distribution is set if provider_slug is available, as it's NOT NULL in DB
    distribution: game.provider_slug || slugify(game.providerName || ''), // Fallback for distribution
    game_type: game.categoryName || (game.category_slugs && game.category_slugs.length > 0 ? game.category_slugs[0] : undefined),
    category_slugs: game.category_slugs,
    description: game.description,
    cover: game.cover || game.image,
    banner_url: game.bannerUrl || game.banner,
    image_url: game.image_url || game.image || game.cover,
    status: game.status || GameStatusEnum.INACTIVE,
    is_featured: game.is_featured,
    is_new: game.is_new,
    is_popular: game.is_popular,
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

  // Ensure distribution is not undefined if provider_slug was not present
  if (!dbGame.distribution && dbGame.provider_slug) {
    dbGame.distribution = dbGame.provider_slug;
  } else if (!dbGame.distribution && game.title) { // As a last resort, slugify title if nothing else
     dbGame.distribution = slugify(game.title);
  } else if (!dbGame.distribution) {
    dbGame.distribution = 'unknown-provider'; // Should not happen due to form validation
  }


  Object.keys(dbGame).forEach(key => {
    if ((dbGame as any)[key] === undefined) {
      delete (dbGame as any)[key];
    }
  });

  return dbGame;
};

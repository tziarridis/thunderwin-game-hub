import { Game, DbGame, GameTag, GameStatusEnum, GameVolatilityEnum, GameProvider, GameVolatility } from '@/types/game';

export const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const convertDbGameToGame = (dbGame: DbGame): Game => {
  // The provider data might be directly on dbGame if not joined, or inside dbGame.game_providers if joined.
  const joinedProviderData = dbGame.game_providers; // This field name must match the alias in Supabase select
  
  let providerName: string | undefined;
  let providerSlug: string | undefined;
  let providerData: GameProvider | undefined = undefined;

  if (joinedProviderData && typeof joinedProviderData === 'object' && 'name' in joinedProviderData && 'slug' in joinedProviderData) {
    providerName = joinedProviderData.name || 'Unknown Provider';
    providerSlug = joinedProviderData.slug || slugify(providerName);
    providerData = {
      id: String(joinedProviderData.id) || undefined, // Ensure id is string or undefined
      name: joinedProviderData.name || '',
      slug: joinedProviderData.slug || ''
    };
  } else {
    // Fallback if no joined data or it's not in expected structure
    providerName = dbGame.provider_slug ? dbGame.provider_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Provider';
    providerSlug = dbGame.provider_slug || slugify(dbGame.distribution || 'unknown-provider');
    // providerData would be minimal here or based on dbGame.provider_id if available to fetch separately
  }


  const gameSlug = dbGame.slug || slugify(dbGame.game_name || dbGame.title || '') || dbGame.game_id?.toString() || dbGame.id?.toString() || '';

  let categorySlugs: string[] = [];
  if (Array.isArray(dbGame.category_slugs) && dbGame.category_slugs.length > 0) {
    categorySlugs = dbGame.category_slugs;
  } else if (dbGame.game_type) {
    categorySlugs = [slugify(dbGame.game_type)];
  }

  let tags: GameTag[] = []; // Ensure tags are always GameTag[]
  if (Array.isArray(dbGame.tags)) {
    tags = dbGame.tags.map(tag => {
      if (typeof tag === 'string') return { name: tag, slug: slugify(tag) };
      // If it's already a GameTag-like object, ensure it has name and slug
      if (typeof tag === 'object' && tag !== null && 'name' in tag) {
        return { name: tag.name, slug: (tag as GameTag).slug || slugify(tag.name) };
      }
      return { name: 'unknown', slug: 'unknown'}; // Fallback for malformed tags
    }).filter(tag => tag.name !== 'unknown');
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
    game_id: dbGame.game_id || String(dbGame.id), // Ensure game_id is string
    
    provider_id: String(dbGame.provider_id) || undefined, // Ensure provider_id is string or undefined
    provider_slug: providerSlug,
    providerName: providerName,
    provider: providerData,

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
    
    tags: tags, // Now consistently GameTag[]
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

// Make sure convertGameToDbGame correctly handles GameVolatility type for dbGame.volatility
export const convertGameToDbGame = (game: Partial<Game>): Partial<DbGame> => {
  const dbGame: Partial<DbGame> = {
    id: game.id?.toString(), // Ensure ID is string
    game_id: game.game_id || undefined, // Ensure game_id is string
    title: game.title,
    game_name: game.title, 
    slug: game.slug || slugify(game.title || ''),
    provider_id: game.provider_id?.toString(), // Ensure provider_id is string
    provider_slug: game.provider_slug,
    distribution: game.provider_slug || slugify(game.providerName || game.provider_slug || 'unknown'),
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
      : (typeof game.tags === 'string' ? [game.tags] : []), // Handle if tags is a single string
    rtp: game.rtp,
    volatility: game.volatility, // This should be GameVolatility type, which is compatible with DbGame.volatility
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

  if (!dbGame.distribution) {
    dbGame.distribution = 'unknown-provider';
  }

  Object.keys(dbGame).forEach(key => {
    if ((dbGame as any)[key] === undefined) {
      delete (dbGame as any)[key];
    }
  });

  return dbGame;
};

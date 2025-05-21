
import { Game, DbGame } from '@/types/game';

// Converts a database game object to the UI game type
export const convertAPIGameToUIGame = (dbGame: DbGame): Game => {
  // Convert provider object structure if it exists
  const provider = dbGame.providers ? {
    id: dbGame.providers.id?.toString() || '',
    name: dbGame.providers.name || '',
    slug: dbGame.providers.slug || ''
  } : undefined;

  return {
    id: dbGame.id?.toString() || '',
    title: dbGame.game_name || dbGame.title || '',
    slug: dbGame.slug || dbGame.id?.toString() || '',
    game_id: dbGame.game_id || '',
    provider_slug: dbGame.provider_slug || '',
    providerName: dbGame.providers?.name || dbGame.provider_slug || '',
    provider: provider,
    category: dbGame.game_type,
    categoryName: dbGame.game_type,
    category_slugs: Array.isArray(dbGame.category_slugs) ? dbGame.category_slugs : [],
    description: dbGame.description || '',
    rtp: typeof dbGame.rtp === 'string' ? parseFloat(dbGame.rtp) : dbGame.rtp,
    image: dbGame.cover || dbGame.image_url || '',
    cover: dbGame.cover || '',
    banner: dbGame.banner || dbGame.banner_url || '',
    status: dbGame.status || 'inactive',
    views: dbGame.views || 0,
    is_featured: !!dbGame.is_featured,
    isNew: !!dbGame.is_new,
    isPopular: !!dbGame.is_popular || !!dbGame.is_featured,
    tags: dbGame.tags || [],
    volatility: dbGame.volatility || undefined,
    lines: dbGame.lines || undefined,
    min_bet: dbGame.min_bet || undefined,
    max_bet: dbGame.max_bet || undefined,
    only_real: !!dbGame.only_real,
    only_demo: !!dbGame.only_demo,
    has_freespins: !!dbGame.has_freespins,
    created_at: dbGame.created_at || '',
    updated_at: dbGame.updated_at || '',
    show_home: !!dbGame.show_home
  };
};

// Convert from UI Game type to Database Game type for saving
export const convertUIGameToDbGame = (game: Partial<Game>): Partial<DbGame> => {
  const dbGame: Partial<DbGame> = {
    // Map essential fields
    id: game.id?.toString(),
    game_id: game.game_id,
    game_name: game.title,
    slug: game.slug,
    provider_id: game.provider_id?.toString(),
    provider_slug: game.provider_slug,
    game_type: game.categoryName || game.category,
    category_slugs: game.category_slugs,
    description: game.description,
    cover: game.cover || game.image,
    banner: game.banner,
    banner_url: game.banner,
    image_url: game.image,
    status: game.status,
    is_featured: game.is_featured,
    is_new: game.isNew,
    is_popular: game.isPopular,
    tags: game.tags as string[],
    rtp: game.rtp,
    volatility: game.volatility,
    lines: game.lines,
    min_bet: game.min_bet,
    max_bet: game.max_bet,
    only_real: game.only_real,
    only_demo: game.only_demo,
    has_freespins: game.has_freespins,
    show_home: game.show_home
  };

  return dbGame;
};

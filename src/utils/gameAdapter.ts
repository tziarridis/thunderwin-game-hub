
import { Game as UIGame, GameProvider as UIGameProvider, DbGame as UIDbGame } from '@/types'; // Use UIDbGame for clarity
// APIGame refers to external aggregator types if they were different.
// For now, assuming APIGame/APIGameProvider are similar to UIGame/UIGameProvider from @/types
// if no distinct external API structure is defined.
// Let's assume APIGame and APIGameProvider are equivalent to UIGame and UIGameProvider from @/types for now.
type APIGame = UIGame; 
type APIGameProvider = UIGameProvider;


export const adaptGameForUI = (apiGame: APIGame): UIGame => {
  // This adapter assumes apiGame structure is similar to UIGame from @/types
  // or it's a generic object that needs mapping to UIGame.
  // The fields like game_name, distribution, game_type, cover, rtp, etc.
  // are from the `games` table schema (DbGame).
  return {
    id: String(apiGame.id || apiGame.game_id || ''), // Ensure id is a string
    game_id: String(apiGame.game_id || apiGame.id || ''), // Ensure game_id is a string
    title: apiGame.title || apiGame.game_name || '',
    slug: apiGame.slug || String(apiGame.id || apiGame.game_id || ''),
    description: apiGame.description || '',
    
    providerName: apiGame.providerName || apiGame.provider_slug || apiGame.distribution, // Use existing Game fields
    provider_slug: apiGame.provider_slug || apiGame.distribution,

    categoryName: apiGame.categoryName || apiGame.game_type || 'slots',
    category_slugs: Array.isArray(apiGame.category_slugs) ? apiGame.category_slugs : (apiGame.category_slugs ? [apiGame.category_slugs] : []),

    image: apiGame.image || apiGame.cover || apiGame.image_url,
    cover: apiGame.cover || apiGame.image || apiGame.image_url,
    image_url: apiGame.image_url || apiGame.cover || apiGame.image,
    bannerUrl: apiGame.bannerUrl || apiGame.cover, // Use cover as fallback for banner

    rtp: apiGame.rtp || 96, // Default RTP
    volatility: apiGame.volatility || 'medium', // Default volatility
    
    min_bet: apiGame.min_bet ?? 0.1, // Use ?? for default if null/undefined
    max_bet: apiGame.max_bet ?? 100,
    
    isPopular: apiGame.isPopular ?? apiGame.is_featured ?? false,
    isNew: apiGame.isNew ?? apiGame.show_home ?? false,
    is_featured: apiGame.is_featured ?? false,
    show_home: apiGame.show_home ?? false,

    releaseDate: apiGame.releaseDate || apiGame.created_at || new Date().toISOString(),
    tags: Array.isArray(apiGame.tags) ? apiGame.tags : [],
    features: Array.isArray(apiGame.features) ? apiGame.features : [],
    themes: Array.isArray(apiGame.themes) ? apiGame.themes : [],
    
    status: apiGame.status || 'active',
    game_code: apiGame.game_code || String(apiGame.game_id || apiGame.id || ''),
    
    // Add other fields from UIGame with defaults if not in apiGame
    only_demo: apiGame.only_demo ?? false,
    only_real: apiGame.only_real ?? false,
    views: apiGame.views ?? 0,
    lines: apiGame.lines ?? null,
    reels: apiGame.reels ?? null,
    default_bet: apiGame.default_bet ?? null,
    currencies_accepted: apiGame.currencies_accepted ?? null,
    languages_supported: apiGame.languages_supported ?? null,
    technology: apiGame.technology ?? 'html5',
    is_mobile_compatible: apiGame.is_mobile_compatible ?? true,
    launch_url_template: apiGame.launch_url_template ?? null,
    api_integration_type: apiGame.api_integration_type ?? null,
    created_at: apiGame.created_at ?? new Date().toISOString(),
    updated_at: apiGame.updated_at ?? new Date().toISOString(),
    aggregator_game_id: apiGame.aggregator_game_id ?? undefined,
    aggregator_provider_id: apiGame.aggregator_provider_id ?? undefined,
    // isFavorite is a UI state, not from API typically
  };
};

// This adapter maps UIGame (frontend) to APIGame (structure for external API or a more raw DB format like DbGame)
// If APIGame is intended to be DbGame for Supabase, then map to DbGame fields.
export const adaptGameForAPI = (uiGame: UIGame): Partial<UIDbGame> => { // Output type changed to Partial<UIDbGame>
  // This should map to the fields of `DbGame` if target is Supabase `games` table
  const dbData: Partial<UIDbGame> = {
    id: String(uiGame.id), // PK for 'games' table
    game_id: String(uiGame.game_id || uiGame.id), // Provider's game ID
    game_name: uiGame.title || '',
    game_code: uiGame.game_code || String(uiGame.game_id || uiGame.id),
    game_type: uiGame.categoryName || (Array.isArray(uiGame.category_slugs) && uiGame.category_slugs.length > 0 ? uiGame.category_slugs[0] : 'slots'),
    description: uiGame.description || '',
    cover: uiGame.image || uiGame.cover || '',
    status: uiGame.status || 'active',
    technology: uiGame.technology || 'HTML5',
    // has_lobby, is_mobile, has_freespins, has_tables are from `games` table
    has_lobby: uiGame.has_lobby ?? false,
    is_mobile: uiGame.is_mobile_compatible ?? true, // map is_mobile_compatible to is_mobile
    has_freespins: uiGame.has_freespins ?? (uiGame.categoryName === 'slots'),
    has_tables: uiGame.has_tables ?? (uiGame.categoryName === 'table-games'), // Example mapping
    only_demo: uiGame.only_demo ?? false,
    rtp: uiGame.rtp ?? 96,
    distribution: uiGame.provider_slug || uiGame.providerName, // Maps to `games.distribution`
    views: uiGame.views ?? Math.floor(Math.random() * 1000),
    is_featured: uiGame.is_featured ?? false,
    show_home: uiGame.show_home ?? false,
    created_at: uiGame.created_at || uiGame.releaseDate || new Date().toISOString(),
    updated_at: uiGame.updated_at || new Date().toISOString(),
    // These fields from UIGame might not directly map to DbGame or need transformation
    // provider_id: uiGame.provider_id, // If you have a separate providers table and this is the FK
    // slug: uiGame.slug, // slug is in DbGame type, map it
    // lines, reels, features, themes, min_bet, max_bet, etc. are not in base `games` table schema from Supabase.
    // If added to `games` table, they can be mapped here.
  };
  if (uiGame.slug) dbData.slug = uiGame.slug;
  if (uiGame.provider_id) dbData.provider_id = uiGame.provider_id;
  if (uiGame.min_bet !== undefined) dbData.min_bet = uiGame.min_bet;
  if (uiGame.max_bet !== undefined) dbData.max_bet = uiGame.max_bet;
  // ... map other relevant fields ...
  
  Object.keys(dbData).forEach(key => (dbData as any)[key] === undefined && delete (dbData as any)[key]);
  return dbData;
};

export const adaptGamesForUI = (apiGames: APIGame[]): UIGame[] => {
  return apiGames.map(adaptGameForUI);
};

export const adaptProviderForUI = (apiProvider: APIGameProvider): UIGameProvider => {
  return {
    id: String(apiProvider.id || ''), // Ensure id is string
    name: apiProvider.name || '',
    slug: apiProvider.slug || '', // Add slug
    logoUrl: apiProvider.logoUrl || '', // Use logoUrl
    description: apiProvider.description || '',
    isActive: apiProvider.isActive ?? true,
    game_ids: apiProvider.game_ids || [],
    // gamesCount: 0, // This typically comes from an aggregation or separate calculation
    // isPopular: false // This is a UI state or derived
  };
};

export const adaptProvidersForUI = (apiProviders: APIGameProvider[]): UIGameProvider[] => {
  return apiProviders.map(adaptProviderForUI);
};

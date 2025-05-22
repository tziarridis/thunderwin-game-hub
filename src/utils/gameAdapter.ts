// This file might be redundant if src/components/admin/GameAdapter.tsx covers all needs.
// For now, let's assume it's for more general UI conversion, if any.
// It's critical that types here (UIGame, APIGame, UIDbGame) are consistent with src/types/game.ts

import { Game as UIGame, GameProvider as UIGameProvider, DbGame as UIDbGame, GameStatusEnum, GameVolatilityEnum, GameTag } from '@/types';

// APIGame can be an external API's game structure, or just UIGame if no external API.
// For this example, let's assume APIGame is similar to UIGame from an external source.
type APIGame = Partial<UIGame> & { id: string | number, game_name?: string, distribution?: string, game_type?: string, cover?: string }; // Example APIGame

// This adapter would map an APIGame (e.g. from an aggregator) to our UIGame format
export const adaptAPIGameToUIGame = (apiGame: APIGame): UIGame => {
  return {
    id: String(apiGame.id),
    game_id: String(apiGame.game_id || apiGame.id),
    title: apiGame.title || apiGame.game_name || 'Unknown Title',
    slug: apiGame.slug || String(apiGame.id),
    provider_slug: apiGame.provider_slug || apiGame.distribution || 'unknown-provider',
    providerName: apiGame.providerName || apiGame.provider_slug || apiGame.distribution,
    category_slugs: apiGame.category_slugs || (apiGame.game_type ? [apiGame.game_type.toLowerCase().replace(/\s+/g, '-')] : []),
    categoryNames: apiGame.categoryNames || (apiGame.game_type ? [apiGame.game_type] : []),
    image: apiGame.image || apiGame.cover || apiGame.image_url,
    image_url: apiGame.image_url || apiGame.cover || apiGame.image,
    cover: apiGame.cover || apiGame.image || apiGame.image_url,
    bannerUrl: apiGame.bannerUrl || apiGame.cover,
    description: apiGame.description || '',
    rtp: typeof apiGame.rtp === 'number' ? apiGame.rtp : undefined,
    volatility: apiGame.volatility || undefined,
    tags: (apiGame.tags || []).map(tag => typeof tag === 'string' ? {name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-')} : tag) as GameTag[],
    features: apiGame.features || [],
    themes: apiGame.themes || [],
    status: apiGame.status || GameStatusEnum.ACTIVE,
    releaseDate: apiGame.releaseDate || apiGame.created_at,
    is_popular: apiGame.is_popular ?? false,
    is_new: apiGame.is_new ?? false,
    is_featured: apiGame.is_featured ?? false,
    show_home: apiGame.show_home ?? false,
    mobile_friendly: apiGame.mobile_friendly ?? true,
    lines: apiGame.lines,
    min_bet: apiGame.min_bet,
    max_bet: apiGame.max_bet,
    only_demo: apiGame.only_demo ?? false,
    only_real: apiGame.only_real ?? false,
    game_code: apiGame.game_code,
    // other UIGame fields
  };
};

// This adapter maps UIGame (frontend) to UIDbGame (Supabase 'games' table structure)
export const adaptUIGameToDbGame = (uiGame: Partial<UIGame>): Partial<UIDbGame> => {
  const dbData: Partial<UIDbGame> = {
    // id: String(uiGame.id), // Usually not set directly for insert, or used in .eq() for update
    game_id: uiGame.game_id ? String(uiGame.game_id) : undefined,
    title: uiGame.title,
    game_name: uiGame.title, // Keep game_name consistent
    slug: uiGame.slug,
    provider_slug: uiGame.provider_slug,
    provider_id: uiGame.provider_id ? String(uiGame.provider_id) : undefined,
    category_slugs: uiGame.category_slugs,
    game_type: uiGame.category_slugs && uiGame.category_slugs.length > 0 ? uiGame.category_slugs[0] : uiGame.categoryName, // Example: use first category as game_type
    image_url: uiGame.image_url || uiGame.image || uiGame.cover,
    cover: uiGame.cover || uiGame.image || uiGame.image_url,
    banner_url: uiGame.bannerUrl,
    description: uiGame.description,
    rtp: uiGame.rtp,
    volatility: uiGame.volatility,
    tags: Array.isArray(uiGame.tags) ? uiGame.tags.map(t => typeof t === 'string' ? t : (t as GameTag).name) : [],
    features: uiGame.features,
    themes: uiGame.themes,
    status: uiGame.status,
    release_date: uiGame.releaseDate,
    is_popular: uiGame.is_popular,
    is_new: uiGame.is_new,
    is_featured: uiGame.is_featured,
    show_home: uiGame.show_home,
    is_mobile: uiGame.mobile_friendly, // Map UIGame.mobile_friendly to DbGame.is_mobile
    lines: uiGame.lines,
    min_bet: uiGame.min_bet,
    max_bet: uiGame.max_bet,
    only_demo: uiGame.only_demo,
    only_real: uiGame.only_real,
    has_freespins: uiGame.has_freespins,
    game_code: uiGame.game_code,
    distribution: uiGame.provider_slug, // map provider_slug to distribution
    // Ensure all other relevant DbGame fields are mapped from UIGame
  };
  if (uiGame.id) dbData.id = String(uiGame.id); // Add id if present (for updates)

  Object.keys(dbData).forEach(key => (dbData as any)[key] === undefined && delete (dbData as any)[key]);
  return dbData;
};


// Removed adaptGameForUI, adaptGameForAPI, adaptGamesForUI, adaptProviderForUI, adaptProvidersForUI
// as they are largely superseded by mapDbGameToGameAdapter and mapGameToDbGameAdapter,
// or specific adapters like adaptAPIGameToUIGame if dealing with external APIs.
// If these are still needed for other parts of the app, they should be updated for consistency with src/types/game.ts.
// For now, focusing on fixing admin panel errors.

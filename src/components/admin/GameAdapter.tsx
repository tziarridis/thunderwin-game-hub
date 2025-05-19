import { Game, DbGame, GameProvider, GameCategory } from '@/types';
import { format, parseISO } from 'date-fns';

// Function to format date, ensuring input is string
const formatGameReleaseDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    // Ensure dateString is a string before parsing
    return format(parseISO(String(dateString)), 'MMM d, yyyy');
  } catch (error) {
    console.warn('Invalid date format for release date:', dateString, error);
    // Fallback for potentially already formatted or unparseable dates
    // Or handle specific expected non-ISO formats if necessary
    return String(dateString); 
  }
};

// Adapter to transform API/DB game data to a consistent Game object for UI
export const adaptGameData = (gameData: DbGame, providers: GameProvider[], categories: GameCategory[]): Game => {
  const provider = providers.find(p => p.id === gameData.provider_id || p.slug === gameData.provider_slug);
  // Handle category_slugs which might be an array or a single string
  const firstCategorySlug = Array.isArray(gameData.category_slugs) ? gameData.category_slugs[0] : gameData.category_slugs;
  const category = categories.find(c => c.slug === firstCategorySlug);

  return {
    id: gameData.id,
    slug: gameData.slug || undefined,
    title: gameData.title || 'Unknown Game',
    provider: provider?.slug || gameData.provider_slug || 'unknown-provider',
    providerName: provider?.name || gameData.provider_name || 'Unknown Provider',
    category: category?.slug || (Array.isArray(gameData.category_slugs) ? gameData.category_slugs.join(', ') : gameData.category_slugs) || 'unknown-category',
    categoryName: category?.name || (Array.isArray(gameData.category_names) ? gameData.category_names.join(', ') : gameData.category_names) || 'Unknown Category',
    image: gameData.cover || gameData.image_url || '/placeholder.svg', // Prefer cover, then image_url
    description: gameData.description || undefined,
    rtp: gameData.rtp || undefined,
    volatility: gameData.volatility || undefined,
    minBet: gameData.min_bet || undefined,
    maxBet: gameData.max_bet || undefined,
    lines: gameData.lines || undefined,
    isNew: gameData.is_new || false,
    isPopular: gameData.is_popular || false,
    is_featured: gameData.is_featured || false,
    show_home: gameData.show_home || false,
    tags: gameData.tags || [],
    // jackpot: data.jackpot_enabled, // Example, if your DB has this
    releaseDate: gameData.release_date ? formatGameReleaseDate(gameData.release_date) : undefined,
    views: gameData.views || 0,
    features: gameData.features || [],
    themes: gameData.themes || [],
    game_id: gameData.game_id || undefined,
    name: gameData.title || 'Unknown Game', // Using title as name
    category_slugs: gameData.category_slugs || [],
    created_at: gameData.created_at,
    updated_at: gameData.updated_at,
    provider_id: gameData.provider_id || undefined,
    provider_slug: gameData.provider_slug || undefined,
    cover: gameData.cover || undefined,
    banner: gameData.banner || undefined,
    image_url: gameData.image_url || undefined,
    status: gameData.status || 'inactive',
    game_code: gameData.game_code || undefined,
    isFavorite: false, // Default, to be updated by favorite logic
  };
};

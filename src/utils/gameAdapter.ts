
import { Game as GameFromAPI, GameProvider as GameProviderFromAPI } from '@/types/game';
import { Game as UIGame, GameProvider as UIGameProvider } from '@/types';

/**
 * Converts a Game from the API format to the UI format
 */
export function adaptGameForUI(game: GameFromAPI): UIGame {
  // Create provider object or string based on what's available
  let provider: UIGameProvider | string;
  
  if (typeof game.provider === 'object' && game.provider) {
    provider = {
      id: game.provider.id?.toString() || '0',
      name: game.provider.name || '',
      logo: game.provider.logo || '',
      gamesCount: 0, // Default value
      isPopular: false, // Default value
      description: game.provider.description || '',
      featured: false // Default value
    };
  } else {
    provider = game.distribution || '';
  }

  return {
    id: game.id ? game.id.toString() : '',
    title: game.game_name,
    provider: provider,
    category: game.game_type || 'slots',
    image: game.cover || '',
    rtp: game.rtp || 96,
    volatility: 'medium', // Default value as this isn't in the API model
    minBet: 0.1, // Default values as these aren't in the API model
    maxBet: 100,
    isPopular: game.is_featured || false,
    isNew: game.show_home || false,
    isFavorite: false, // Default value
    releaseDate: game.created_at || new Date().toISOString(),
    jackpot: false, // Default value
    description: game.description || '',
    tags: [],
  };
}

/**
 * Converts an array of Games from the API format to the UI format
 */
export function adaptGamesForUI(games: GameFromAPI[]): UIGame[] {
  return games.map(adaptGameForUI);
}

/**
 * Converts a Game from the UI format to the API format
 */
export function adaptGameForAPI(game: UIGame): Omit<GameFromAPI, 'id'> {
  let providerId = 1;
  let providerName = '';
  
  if (typeof game.provider === 'object' && game.provider) {
    providerId = parseInt(game.provider.id || '1');
    providerName = game.provider.name || '';
  } else if (typeof game.provider === 'string') {
    providerName = game.provider;
  }
    
  return {
    provider_id: providerId,
    game_id: game.id,
    game_name: game.title,
    game_code: game.id.replace(/\D/g, ''),
    game_type: game.category,
    description: game.description || '',
    cover: game.image || '',
    status: 'active',
    technology: 'HTML5',
    has_lobby: false,
    is_mobile: true,
    has_freespins: game.category === 'slots',
    has_tables: game.category === 'table',
    only_demo: false,
    rtp: game.rtp,
    distribution: providerName,
    views: 0,
    is_featured: game.isPopular,
    show_home: game.isNew,
  };
}

/**
 * Converts a provider from API format to UI format
 */
export function adaptProviderForUI(provider: GameProviderFromAPI): UIGameProvider {
  return {
    id: provider.id.toString(),
    name: provider.name,
    logo: provider.logo || '',
    gamesCount: 0, // Default value
    isPopular: false, // Default value
    description: provider.description || '',
    featured: false, // Default value
  };
}

/**
 * Converts an array of providers from API format to UI format
 */
export function adaptProvidersForUI(providers: GameProviderFromAPI[]): UIGameProvider[] {
  return providers.map(adaptProviderForUI);
}


import { Game as APIGame, GameProvider as APIGameProvider } from '@/types/game';
import { Game as UIGame, GameProvider as UIGameProvider } from '@/types';

export const adaptGameForUI = (apiGame: APIGame): UIGame => {
  return {
    id: apiGame.id.toString(),
    title: apiGame.game_name || '',
    description: apiGame.description || '',
    provider: apiGame.distribution || '',
    category: apiGame.game_type || 'slots',
    image: apiGame.cover || '',
    rtp: apiGame.rtp || 96,
    volatility: 'medium', // Default value as API doesn't have this
    minBet: 0.1, // Default value as API doesn't have this
    maxBet: 100, // Default value as API doesn't have this 
    isPopular: apiGame.is_featured || false,
    isNew: apiGame.show_home || false,
    isFavorite: false,
    jackpot: false,
    releaseDate: apiGame.created_at || new Date().toISOString(),
    tags: []
  };
};

export const adaptGameForAPI = (uiGame: UIGame): Omit<APIGame, 'id'> => {
  return {
    provider_id: 1, // Default provider ID
    game_id: uiGame.id || '',
    game_name: uiGame.title || '',
    game_code: uiGame.id ? uiGame.id.replace(/\D/g, '') : '',
    game_type: uiGame.category || 'slots',
    description: uiGame.description || '',
    cover: uiGame.image || '',
    status: 'active',
    technology: 'HTML5',
    has_lobby: false,
    is_mobile: true,
    has_freespins: uiGame.category === 'slots',
    has_tables: uiGame.category === 'table',
    only_demo: false,
    rtp: uiGame.rtp || 96,
    distribution: typeof uiGame.provider === 'string' ? uiGame.provider : '',
    views: Math.floor(Math.random() * 1000),
    is_featured: uiGame.isPopular || false,
    show_home: uiGame.isNew || false,
    created_at: uiGame.releaseDate || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const adaptGamesForUI = (apiGames: APIGame[]): UIGame[] => {
  return apiGames.map(adaptGameForUI);
};

export const adaptProviderForUI = (apiProvider: APIGameProvider): UIGameProvider => {
  return {
    id: apiProvider.id.toString(),
    name: apiProvider.name || '',
    logo: apiProvider.logo || '',
    gamesCount: 0
  };
};

export const adaptProvidersForUI = (apiProviders: APIGameProvider[]): UIGameProvider[] => {
  return apiProviders.map(adaptProviderForUI);
};

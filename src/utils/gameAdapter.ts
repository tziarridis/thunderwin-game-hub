
import { Game as APIGame, GameProvider as APIGameProvider } from '@/types/game';
import { Game as UIGame, GameProvider as UIGameProvider } from '@/types';
import { GameDataExtended, GameCompatibility } from '@/types/gameService';

export const adaptGameForUI = (apiGame: APIGame | GameDataExtended): UIGame => {
  return {
    id: (apiGame.id?.toString() || ''),
    title: apiGame.game_name || '',
    description: apiGame.description || '',
    provider: apiGame.distribution || '',
    category: ('game_type' in apiGame ? apiGame.game_type : 'type' in apiGame ? apiGame.type : '') || 'slots',
    image: apiGame.cover || ('thumbnail' in apiGame ? apiGame.thumbnail : '') || '',
    rtp: apiGame.rtp || 96,
    volatility: 'medium',
    minBet: 0.1,
    maxBet: 100,
    isPopular: apiGame.is_featured || false,
    isNew: apiGame.show_home || false,
    isFavorite: false,
    jackpot: false,
    releaseDate: apiGame.created_at || new Date().toISOString(),
    tags: []
  };
};

export const adaptGameForAPI = (uiGame: UIGame): GameDataExtended => {
  return {
    provider_id: typeof uiGame.provider === 'string' ? uiGame.provider : '1', // Convert to string for API compatibility
    game_id: uiGame.id || '',
    game_name: uiGame.title || '',
    game_code: uiGame.id ? uiGame.id.replace(/\D/g, '') : '',
    game_type: uiGame.category || 'slots',
    type: uiGame.category || 'slots',
    description: uiGame.description || '',
    cover: uiGame.image || '',
    thumbnail: uiGame.image || '',
    status: 'active', // Add required status field
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

export const adaptGamesForUI = (apiGames: (APIGame | GameDataExtended)[]): UIGame[] => {
  return apiGames.map(adaptGameForUI);
};

export const adaptProviderForUI = (apiProvider: APIGameProvider): UIGameProvider => {
  return {
    id: apiProvider.id?.toString() || '',
    name: apiProvider.name || '',
    logo: apiProvider.logo || '',
    gamesCount: 0,
    isPopular: false // Adding the required property
  };
};

export const adaptProvidersForUI = (apiProviders: APIGameProvider[]): UIGameProvider[] => {
  return apiProviders.map(adaptProviderForUI);
};


import { Game as UIGame, GameProvider as UIGameProvider } from '@/types';
import { Game as APIGame, GameProvider as APIGameProvider } from '@/types/game';
import { availableProviders, getProviderById } from '@/config/gameProviders';

/**
 * Adapt API game format to UI game format
 */
export const adaptGameForUI = (apiGame: APIGame): UIGame => {
  const provider = getProviderById(apiGame.provider_id.toString()) || { id: 'unknown', name: 'Unknown Provider' };
  
  return {
    id: apiGame.id?.toString() || '',
    title: apiGame.game_name,
    provider: provider.name,
    category: apiGame.game_type || 'slot',
    image: apiGame.cover,
    rtp: apiGame.rtp || 96,
    volatility: 'medium', // Default value as API doesn't provide this
    minBet: 0.1, // Default value as API doesn't provide this
    maxBet: 100, // Default value as API doesn't provide this
    isPopular: apiGame.is_featured || false,
    isNew: apiGame.show_home || false,
    isFavorite: false,
    releaseDate: apiGame.created_at || new Date().toISOString(),
    jackpot: false, // Default value as API doesn't provide this
    description: apiGame.description || '',
    tags: apiGame.game_type ? [apiGame.game_type] : []
  };
};

/**
 * Adapt UI game format to API game format
 */
export const adaptGameForAPI = (uiGame: UIGame): Omit<APIGame, 'id'> => {
  // Find provider ID by name
  const providerObj = availableProviders.find(p => p.name === uiGame.provider);
  const provider_id = providerObj ? parseInt(providerObj.id) : 1;
  
  return {
    provider_id,
    game_id: uiGame.id,
    game_name: uiGame.title,
    game_code: uiGame.id,
    game_type: uiGame.category,
    description: uiGame.description || '',
    cover: uiGame.image || '',
    status: 'active',
    technology: 'html5',
    has_lobby: false,
    is_mobile: true,
    has_freespins: false,
    has_tables: uiGame.category === 'table' || uiGame.category === 'live',
    only_demo: false,
    rtp: uiGame.rtp,
    distribution: uiGame.provider,
    views: 0,
    is_featured: uiGame.isPopular,
    show_home: uiGame.isNew,
    created_at: uiGame.releaseDate,
    updated_at: new Date().toISOString()
  };
};

/**
 * Adapt API providers to UI providers format
 */
export const adaptProvidersForUI = (apiProviders: APIGameProvider[]): UIGameProvider[] => {
  return apiProviders.map(provider => ({
    id: provider.id.toString(),
    name: provider.name,
    code: provider.id.toString(),
    currency: 'EUR',
    logo: provider.logo || '',
    gamesCount: provider.gamesCount || 0,
    isPopular: provider.isPopular || false
  }));
};

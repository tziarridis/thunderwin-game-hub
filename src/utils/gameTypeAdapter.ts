
import { Game as UIGame } from '@/types';
import { Game as APIGame } from '@/types/game';

// Convert UI Game format to API Game format
export const convertUIGameToAPIGame = (uiGame: UIGame): Omit<APIGame, 'id'> => {
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

// Convert API Game format to UI Game format
export const convertAPIGameToUIGame = (apiGame: APIGame): UIGame => {
  return {
    id: apiGame.id?.toString() || '',
    name: apiGame.game_name || '',
    title: apiGame.game_name || '',
    description: apiGame.description || '',
    provider: apiGame.distribution || '',
    provider_slug: apiGame.provider_id?.toString() || '',
    category: apiGame.game_type || 'slots',
    image: apiGame.cover || '',
    rtp: apiGame.rtp || 96,
    volatility: 'medium', // Default value as API doesn't have this
    minBet: 0.1, // Default value as API doesn't have this
    maxBet: 100, // Default value as API doesn't have this 
    isPopular: apiGame.is_featured || false,
    isNew: apiGame.show_home || false,
    isFavorite: false,
    slug: apiGame.game_id?.toString() || '',
    jackpot: false,
    releaseDate: apiGame.created_at || new Date().toISOString(),
    tags: [],
    features: [] // Initialize with empty array to satisfy type
  };
};

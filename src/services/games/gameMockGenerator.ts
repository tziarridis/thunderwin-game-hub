
import { GameData } from '@/types/gameService';

const gameTypes = ['slots', 'table', 'live', 'jackpot', 'crash'];
const gameThemes = ['classic', 'adventure', 'fantasy', 'fruit', 'egypt', 'animal', 'space'];
const providers = ['egt', 'netent', 'pragmatic', 'playtech', 'redtiger', 'playngo'];

/**
 * Generate mock game data for development
 * @param count Number of mock games to generate
 * @returns Array of mock game data
 */
export function generateMockGames(count = 20): GameData[] {
  const mockGames: GameData[] = [];
  
  for (let i = 0; i < count; i++) {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const type = gameTypes[Math.floor(Math.random() * gameTypes.length)];
    const theme = gameThemes[Math.floor(Math.random() * gameThemes.length)];
    
    const game: GameData = {
      provider_id: provider,
      game_id: `game_${provider}_${i}`,
      game_name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Game ${i}`,
      game_code: `${provider}_${type}_${i}`,
      type,
      theme,
      is_mobile: Math.random() > 0.1, // 90% mobile compatible
      is_desktop: true,
      thumbnail: `/games/${provider}/${type}_${i}.jpg`,
      background: `/games/bg/${provider}_${i}.jpg`,
      is_featured: Math.random() > 0.8, // 20% featured
      show_home: Math.random() > 0.3, // 70% show on home
      popularity: Math.floor(Math.random() * 1000)
    };
    
    mockGames.push(game);
  }
  
  return mockGames;
}

/**
 * Generate a single mock game
 * @param provider Provider ID
 * @param index Game index
 * @returns Mock game data
 */
export function generateMockGame(provider: string, index: number): GameData {
  const type = gameTypes[Math.floor(Math.random() * gameTypes.length)];
  const theme = gameThemes[Math.floor(Math.random() * gameThemes.length)];
  
  return {
    provider_id: provider,
    game_id: `game_${provider}_${index}`,
    game_name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Game ${index}`,
    game_code: `${provider}_${type}_${index}`,
    type,
    theme,
    is_mobile: Math.random() > 0.1, // 90% mobile compatible
    is_desktop: true,
    thumbnail: `/games/${provider}/${type}_${index}.jpg`,
    background: `/games/bg/${provider}_${index}.jpg`,
    is_featured: Math.random() > 0.8, // 20% featured
    show_home: Math.random() > 0.3, // 70% show on home
    popularity: Math.floor(Math.random() * 1000)
  };
}

export default {
  generateMockGames,
  generateMockGame
};

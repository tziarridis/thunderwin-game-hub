
import { GameInfo } from '@/types/gameAggregator';

/**
 * Generate mock games for development
 */
export function generateMockGamesForProvider(providerCode: string, count: number): GameInfo[] {
  const gameTypes = ['slots', 'table', 'live', 'jackpot', 'crash'];
  const gameThemes = ['classic', 'adventure', 'fantasy', 'fruit', 'egypt', 'animal', 'space'];
  
  const mockGames: GameInfo[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = gameTypes[Math.floor(Math.random() * gameTypes.length)];
    const theme = gameThemes[Math.floor(Math.random() * gameThemes.length)];
    
    const game = {
      game_id: `${providerCode.toLowerCase()}_game_${i}`,
      game_name: `${providerCode} ${type.charAt(0).toUpperCase() + type.slice(1)} ${i}`,
      game_code: `${providerCode.toLowerCase()}_${type}_${i}`,
      type,
      theme,
      is_mobile: Math.random() > 0.1, // 90% mobile compatible
      is_desktop: true,
      thumbnail: `/games/${providerCode.toLowerCase()}/${type}_${i}.jpg`,
      background: `/games/bg/${providerCode.toLowerCase()}_${i}.jpg`
    };
    
    mockGames.push(game);
  }
  
  return mockGames;
}

/**
 * Normalize games from various provider formats to our schema
 */
export function normalizeGames(games: any[], providerConfig: any): GameInfo[] {
  if (!games || !Array.isArray(games)) {
    return [];
  }

  // Different providers might use different field names
  // This function handles the mapping
  return games.map(game => {
    // Default mappings for common provider formats
    return {
      game_id: game.id || game.game_id || game.gameId || '',
      game_name: game.name || game.title || game.game_name || game.gameName || '',
      game_code: game.code || game.game_code || game.gameCode || '',
      type: game.category || game.type || game.gameType || 'slots',
      theme: game.theme || game.genre || '',
      is_mobile: game.mobile_support !== false && game.isMobile !== false,
      is_desktop: game.desktop_support !== false && game.isDesktop !== false,
      thumbnail: game.thumbnail || game.image || game.icon || '',
      background: game.background || game.banner || game.bgImage || ''
    };
  });
}

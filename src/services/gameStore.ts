
import { GameInfo } from '@/types/gameAggregator';

// In-memory storage for games (since we don't have a games table in Supabase yet)
let inMemoryGames: {[key: string]: GameInfo[]} = {};

/**
 * Game Store Service 
 * Handles in-memory storage of games
 */
export const gameStore = {
  /**
   * Get all games for a provider
   * @param providerKey Provider identifier
   * @returns Array of games or empty array
   */
  getGamesForProvider: (providerKey: string): GameInfo[] => {
    return inMemoryGames[providerKey] || [];
  },
  
  /**
   * Store games for a provider
   * @param providerKey Provider identifier
   * @param games Array of games
   */
  storeGamesForProvider: (providerKey: string, games: GameInfo[]): void => {
    inMemoryGames[providerKey] = games;
  },
  
  /**
   * Check if we have games for a provider
   * @param providerKey Provider identifier
   * @returns True if provider has games
   */
  hasGamesForProvider: (providerKey: string): boolean => {
    return inMemoryGames[providerKey] && inMemoryGames[providerKey].length > 0;
  },
  
  /**
   * Update or add a game
   * @param providerKey Provider identifier
   * @param game Game info
   * @returns true if added, false if updated
   */
  upsertGame: (providerKey: string, game: GameInfo): boolean => {
    if (!inMemoryGames[providerKey]) {
      inMemoryGames[providerKey] = [];
    }
    
    const existingIndex = inMemoryGames[providerKey].findIndex(g => g.game_id === game.game_id);
    
    if (existingIndex !== -1) {
      // Update existing game
      inMemoryGames[providerKey][existingIndex] = {
        ...inMemoryGames[providerKey][existingIndex],
        ...game,
      };
      return false; // Updated
    } else {
      // Add new game
      inMemoryGames[providerKey].push(game);
      return true; // Added
    }
  },
  
  /**
   * Get all games from all providers
   * @returns Array of all games
   */
  getAllGames: (): GameInfo[] => {
    const allGames: GameInfo[] = [];
    
    for (const providerGames of Object.values(inMemoryGames)) {
      allGames.push(...providerGames);
    }
    
    return allGames;
  },
  
  /**
   * Find a game by ID
   * @param gameId Game identifier
   * @returns Game info or null
   */
  findGameById: (gameId: string): GameInfo | null => {
    for (const providerGames of Object.values(inMemoryGames)) {
      const game = providerGames.find(g => g.game_id === gameId);
      if (game) return game;
    }
    return null;
  },
  
  /**
   * Clear all stored games
   */
  clearAllGames: (): void => {
    inMemoryGames = {};
  }
};

export default gameStore;
